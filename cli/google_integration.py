import os
import json
import datetime
from typing import Dict, List, Any
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import logging

logger = logging.getLogger(__name__)

# If modifying these scopes, delete the file token.json.
SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
]

class GoogleServicesManager:
    def __init__(self, credentials_path: str = 'credentials.json'):
        self.credentials_path = credentials_path
        self.creds = None
        self.drive_service = None
        self.sheets_service = None
        
    def authenticate(self):
        """Authenticate with Google services."""
        if os.path.exists('token.json'):
            self.creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                self.creds = flow.run_local_server(port=0)
            
            with open('token.json', 'w') as token:
                token.write(self.creds.to_json())
        
        self.drive_service = build('drive', 'v3', credentials=self.creds)
        self.sheets_service = build('sheets', 'v4', credentials=self.creds)
        
    def watch_folder(self, folder_id: str) -> List[Dict]:
        """Get list of PDF files in the specified folder."""
        try:
            results = self.drive_service.files().list(
                q=f"'{folder_id}' in parents and mimeType='application/pdf'",
                fields="files(id, name, createdTime)"
            ).execute()
            return results.get('files', [])
        except Exception as e:
            logger.error(f"Error watching Google Drive folder: {e}")
            raise
            
    def download_file(self, file_id: str) -> str:
        """Download a file from Google Drive and return its content."""
        try:
            request = self.drive_service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            return file.getvalue()
        except Exception as e:
            logger.error(f"Error downloading file from Google Drive: {e}")
            raise
            
    def create_or_get_spreadsheet(self, spreadsheet_title: str) -> str:
        """Create a new spreadsheet or get existing one."""
        try:
            # Search for existing spreadsheet
            results = self.drive_service.files().list(
                q=f"name='{spreadsheet_title}' and mimeType='application/vnd.google-apps.spreadsheet'",
                fields="files(id)"
            ).execute()
            files = results.get('files', [])
            
            if files:
                return files[0]['id']
            
            # Create new spreadsheet
            spreadsheet = {
                'properties': {
                    'title': spreadsheet_title
                },
                'sheets': [
                    {
                        'properties': {
                            'title': 'Resume Analysis',
                            'gridProperties': {
                                'rowCount': 1000,
                                'columnCount': 10
                            }
                        }
                    }
                ]
            }
            
            spreadsheet = self.sheets_service.spreadsheets().create(
                body=spreadsheet,
                fields='spreadsheetId'
            ).execute()
            
            return spreadsheet.get('spreadsheetId')
            
        except Exception as e:
            logger.error(f"Error creating/getting spreadsheet: {e}")
            raise
            
    def update_spreadsheet(self, spreadsheet_id: str, analysis_results: Dict):
        """Update the spreadsheet with analysis results."""
        try:
            # Prepare headers
            headers = [
                'Timestamp',
                'Filename',
                'Candidate Name',
                'Match Score',
                'Years Experience',
                'Education',
                'Key Strengths',
                'Experience Highlights',
                'Match Rationale'
            ]
            
            # Get existing values
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range='Resume Analysis!A1:I1'
            ).execute()
            
            # Write headers if sheet is empty
            if 'values' not in result:
                self.sheets_service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range='Resume Analysis!A1:I1',
                    valueInputOption='RAW',
                    body={'values': [headers]}
                ).execute()
            
            # Prepare row data for each resume
            rows = []
            for resume in analysis_results['analyzed_resumes']:
                row = [
                    datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    resume.get('filename', ''),
                    resume.get('candidate_name', ''),
                    resume.get('match_score', ''),
                    resume.get('years_experience', ''),
                    json.dumps(resume.get('education', {})),
                    '\n'.join(resume.get('key_strengths', [])),
                    '\n'.join(resume.get('experience_highlights', [])),
                    resume.get('match_rationale', '')
                ]
                rows.append(row)
            
            # Append rows
            self.sheets_service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range='Resume Analysis!A2',
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body={'values': rows}
            ).execute()
            
            logger.info(f"Updated spreadsheet with {len(rows)} rows")
            
        except Exception as e:
            logger.error(f"Error updating spreadsheet: {e}")
            raise

    def format_spreadsheet(self, spreadsheet_id: str):
        """Apply formatting to the spreadsheet."""
        try:
            requests = [
                {
                    'repeatCell': {
                        'range': {
                            'sheetId': 0,
                            'startRowIndex': 0,
                            'endRowIndex': 1
                        },
                        'cell': {
                            'userEnteredFormat': {
                                'backgroundColor': {
                                    'red': 0.8,
                                    'green': 0.8,
                                    'blue': 0.8
                                },
                                'textFormat': {
                                    'bold': True
                                }
                            }
                        },
                        'fields': 'userEnteredFormat(backgroundColor,textFormat)'
                    }
                },
                {
                    'autoResizeDimensions': {
                        'dimensions': {
                            'sheetId': 0,
                            'dimension': 'COLUMNS',
                            'startIndex': 0,
                            'endIndex': 9
                        }
                    }
                }
            ]
            
            self.sheets_service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={'requests': requests}
            ).execute()
            
            logger.info("Applied formatting to spreadsheet")
            
        except Exception as e:
            logger.error(f"Error formatting spreadsheet: {e}")
            raise
