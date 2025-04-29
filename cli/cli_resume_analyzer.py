#!/usr/bin/env python3
import os
import json
import time
import logging
import subprocess
import requests
from typing import Dict, List, Any
from google_integration import GoogleServicesManager
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CLIResumeAnalyzer:
    def __init__(self):
        load_dotenv()
        self.google_manager = None
        self.llm_endpoint = os.getenv("LLM_ENDPOINT", "http://localhost:1234")
        self.folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
        self.spreadsheet_id = None
        self.jd_data = None

    def setup_google_services(self):
        """Initialize Google services with step-by-step guidance."""
        print("\n=== Google Services Setup ===")
        
        if not os.path.exists('credentials.json'):
            print("\nERROR: credentials.json not found!")
            print("Please follow these steps:")
            print("1. Go to Google Cloud Console (https://console.cloud.google.com)")
            print("2. Create a new project or select existing project")
            print("3. Enable Drive API and Sheets API")
            print("4. Go to Credentials")
            print("5. Create OAuth 2.0 Client ID (Desktop Application)")
            print("6. Download the client configuration file")
            print("7. Rename it to 'credentials.json' and place it in this directory")
            input("\nPress Enter once you have completed these steps...")
            
            if not os.path.exists('credentials.json'):
                print("credentials.json still not found. Please try again.")
                return False

        try:
            self.google_manager = GoogleServicesManager()
            self.google_manager.authenticate()
            print("\n✓ Successfully authenticated with Google services!")
            return True
        except Exception as e:
            print(f"\nError during Google authentication: {e}")
            return False

    def load_job_description(self):
        """Load or create job description analysis."""
        print("\n=== Job Description Setup ===")
        
        if os.path.exists('jd_analysis.json'):
            try:
                with open('jd_analysis.json', 'r') as f:
                    self.jd_data = json.load(f)
                print("\n✓ Successfully loaded existing job description!")
                return True
            except json.JSONDecodeError:
                print("\nError: Invalid jd_analysis.json file")
                return False
        else:
            print("\nERROR: jd_analysis.json not found!")
            print("Please create a job description analysis file with the following format:")
            print("""
{
    "title": "Associate Product Manager",
    "required_skills": ["product management", "data analysis"],
    "preferred_skills": ["SQL", "Python"],
    "minimum_experience": "2 years",
    "education": "Bachelor's degree",
    "key_responsibilities": [
        "Product strategy",
        "Feature development"
    ]
}
""")
            input("\nPress Enter once you have created the file...")
            
            if not os.path.exists('jd_analysis.json'):
                print("jd_analysis.json still not found. Please try again.")
                return False
            return self.load_job_description()

    def setup_spreadsheet(self):
        """Create or get existing results spreadsheet."""
        print("\n=== Google Sheets Setup ===")
        
        try:
            spreadsheet_title = "Resume Analysis Results"
            self.spreadsheet_id = self.google_manager.create_or_get_spreadsheet(spreadsheet_title)
            self.google_manager.format_spreadsheet(self.spreadsheet_id)
            print(f"\n✓ Spreadsheet ready! ID: {self.spreadsheet_id}")
            return True
        except Exception as e:
            print(f"\nError setting up spreadsheet: {e}")
            return False

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file."""
        try:
            result = subprocess.run(
                ['pdftotext', pdf_path, '-'],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout
        except subprocess.CalledProcessError as e:
            print(f"\nError: Failed to extract text from PDF. Is pdftotext installed?")
            print("To install pdftotext:")
            print("- On macOS: brew install poppler")
            print("- On Ubuntu: sudo apt-get install poppler-utils")
            print("- On Windows: Download from xpdfreader.com/download.html")
            raise

    def analyze_resume(self, pdf_content: bytes, filename: str) -> Dict:
        """Analyze a single resume using the LLM."""
        # Save PDF temporarily
        temp_pdf = "temp_resume.pdf"
        with open(temp_pdf, 'wb') as f:
            f.write(pdf_content)

        try:
            # Extract text
            text = self.extract_text_from_pdf(temp_pdf)
            
            # Create analysis prompt
            prompt = {
                "model": "local-model",  # Change based on your LLM setup
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert HR analyst. Analyze resumes against job requirements and provide structured feedback."
                    },
                    {
                        "role": "user",
                        "content": f"Compare this resume against our job requirements and output ONLY a JSON object containing:\n"
                                 f"- candidate_name: string\n"
                                 f"- education: object (degree, field, school)\n"
                                 f"- years_experience: string\n"
                                 f"- relevant_skills: array of strings\n"
                                 f"- experience_highlights: array of strings\n"
                                 f"- match_score: number (0-100)\n"
                                 f"- match_rationale: string\n\n"
                                 f"Job Requirements:\n```json\n{json.dumps(self.jd_data)}\n```\n\n"
                                 f"Resume Text:\n```\n{text}\n```"
                    }
                ],
                "temperature": 0.2
            }

            # Send to LLM
            response = requests.post(
                f"{self.llm_endpoint}/v1/chat/completions",
                headers={"Content-Type": "application/json"},
                json=prompt
            )
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            content = result['choices'][0]['message']['content']
            analysis = json.loads(content)
            analysis['filename'] = filename
            
            return analysis

        finally:
            # Cleanup
            if os.path.exists(temp_pdf):
                os.remove(temp_pdf)

    def process_resumes(self):
        """Process all resumes in the Google Drive folder."""
        print("\n=== Processing Resumes ===")
        
        try:
            # Get list of PDF files
            files = self.google_manager.watch_folder(self.folder_id)
            if not files:
                print("\nNo PDF files found in the specified Google Drive folder!")
                return
            
            print(f"\nFound {len(files)} resumes to process...")
            results = {
                "analyzed_resumes": []
            }

            # Process each file
            for i, file in enumerate(files, 1):
                try:
                    print(f"\nProcessing {i}/{len(files)}: {file['name']}")
                    
                    # Download file
                    pdf_content = self.google_manager.download_file(file['id'])
                    
                    # Analyze resume
                    analysis = self.analyze_resume(pdf_content, file['name'])
                    results['analyzed_resumes'].append(analysis)
                    
                    print(f"✓ Analyzed {file['name']} (Match Score: {analysis['match_score']})")
                    
                except Exception as e:
                    print(f"Error processing {file['name']}: {e}")
                    continue

            # Update spreadsheet
            if results['analyzed_resumes']:
                self.google_manager.update_spreadsheet(self.spreadsheet_id, results)
                print("\n✓ Results updated in Google Sheets!")
            
        except Exception as e:
            print(f"\nError during resume processing: {e}")

    def run(self):
        """Main CLI interface."""
        print("\n=== Resume Analysis System ===")
        print("This tool will help you analyze resumes using AI and store results in Google Sheets.")
        
        # Step 1: Setup Google Services
        print("\nStep 1: Setting up Google Services...")
        if not self.setup_google_services():
            return
        
        # Step 2: Load Job Description
        print("\nStep 2: Loading Job Description...")
        if not self.load_job_description():
            return
        
        # Step 3: Setup Google Sheets
        print("\nStep 3: Setting up Google Sheets...")
        if not self.setup_spreadsheet():
            return
        
        # Step 4: Get Google Drive Folder ID
        if not self.folder_id:
            print("\nStep 4: Google Drive Setup")
            print("Please follow these steps to get your folder ID:")
            print("1. Go to Google Drive")
            print("2. Create a new folder or select existing folder with resumes")
            print("3. Open the folder")
            print("4. From the URL, copy the folder ID (long string after /folders/)")
            self.folder_id = input("\nEnter the folder ID: ").strip()
            
            # Save to .env file
            with open('.env', 'a') as f:
                f.write(f"\nGOOGLE_DRIVE_FOLDER_ID={self.folder_id}")
        
        # Step 5: Process Resumes
        print("\nStep 5: Resume Processing")
        input("Press Enter to start processing resumes...")
        self.process_resumes()
        
        print("\n=== Analysis Complete ===")
        print("You can now:")
        print("1. Check your Google Drive for the 'Resume Analysis Results' spreadsheet")
        print("2. Review the analysis results and match scores")
        print("3. Sort/filter the spreadsheet as needed")
        print("\nThank you for using the Resume Analysis System!")

if __name__ == "__main__":
    analyzer = CLIResumeAnalyzer()
    analyzer.run()
