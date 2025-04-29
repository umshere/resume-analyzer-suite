# Resume Analysis System - CLI Version

This command-line tool helps analyze resumes using AI and store results in Google Sheets. It's designed to be easy to use for non-technical users.

## Prerequisites

1. Python 3.8 or higher
2. Google Cloud Project with Drive and Sheets APIs enabled
3. Local LLM server or OpenAI API access
4. `pdftotext` utility installed

## Setup Instructions

### 1. Install Required Software

#### Install Python:

- Download from [python.org](https://www.python.org/downloads/)
- During installation, check "Add Python to PATH"

#### Install pdftotext:

- **Windows**: Download from [xpdfreader.com](https://www.xpdfreader.com/download.html)
- **macOS**: Run `brew install poppler`
- **Ubuntu**: Run `sudo apt-get install poppler-utils`

### 2. Setup Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable these APIs:
   - Google Drive API
   - Google Sheets API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" section
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop Application"
   - Download the client configuration file
   - Rename it to `credentials.json`

### 3. Install Python Dependencies

1. Open Terminal/Command Prompt
2. Navigate to the project directory
3. Run: `pip install -r requirements.txt`

### 4. Prepare Job Description

Create a file named `jd_analysis.json` with your job requirements:

```json
{
  "title": "Associate Product Manager",
  "required_skills": ["product management", "data analysis"],
  "preferred_skills": ["SQL", "Python"],
  "minimum_experience": "2 years",
  "education": "Bachelor's degree",
  "key_responsibilities": ["Product strategy", "Feature development"]
}
```

### 5. Setup Environment

Create a file named `.env` with your configuration:

```
LLM_ENDPOINT=http://localhost:1234
```

## Usage Instructions

1. **Prepare Resumes**:

   - Create a folder in Google Drive
   - Upload PDF resumes to this folder
   - Copy the folder ID from the URL (the long string after /folders/)

2. **Run the Analysis**:

   - Open Terminal/Command Prompt
   - Navigate to the project directory
   - Run: `python cli_resume_analyzer.py`
   - Follow the step-by-step prompts

3. **View Results**:
   - Open Google Drive
   - Find the "Resume Analysis Results" spreadsheet
   - Review candidate scores and analysis

## Troubleshooting

### Common Issues:

1. **"credentials.json not found"**

   - Make sure you've downloaded and renamed the OAuth client configuration file
   - Place it in the same directory as the script

2. **"pdftotext not found"**

   - Make sure you've installed the pdftotext utility for your operating system
   - For Windows: Add xpdf to your system PATH

3. **"Error during Google authentication"**

   - Ensure you've enabled the necessary Google APIs
   - Check that your credentials.json is valid
   - Try deleting token.json (if it exists) and re-authenticate

4. **"No PDF files found"**
   - Verify you've entered the correct Google Drive folder ID
   - Ensure the folder contains PDF files
   - Check that your Google account has access to the folder

### Need Help?

If you encounter any issues:

1. Check the error message carefully
2. Follow the on-screen instructions
3. Ensure all prerequisites are installed
4. Try running the script again

## Security Notes

- Keep your credentials.json and token.json files secure
- Don't share these files with others
- The script stores authentication tokens locally
- Only upload resumes you have permission to analyze
