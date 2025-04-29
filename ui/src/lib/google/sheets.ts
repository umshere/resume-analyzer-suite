import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export interface GoogleSheetsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  spreadsheetId: string;
}

export interface AnalysisResult {
  candidateName: string;
  matchScore: number;
  yearsExperience: string;
  education: {
    degree: string;
    field: string;
    school: string;
  };
  relevantSkills: string[];
  experienceHighlights: string[];
  matchRationale: string;
  analyzedAt: string;
  filename: string;
}

export class GoogleSheetsService {
  private oauth2Client: OAuth2Client;
  private sheets: any;
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.sheets = google.sheets({ version: "v4", auth: this.oauth2Client });
    this.spreadsheetId = config.spreadsheetId;
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async initializeSheet() {
    try {
      // Check if sheet exists and create if not
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      // Set up headers
      const headers = [
        "Timestamp",
        "Candidate Name",
        "Match Score",
        "Years Experience",
        "Education",
        "Relevant Skills",
        "Experience Highlights",
        "Match Rationale",
        "File Name",
        "Drive Link",
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "A1:J1",
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });

      // Format headers
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9,
                    },
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
              },
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: "gridProperties.frozenRowCount",
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error initializing sheet:", error);
      throw error;
    }
  }

  async appendResult(result: AnalysisResult, driveLink?: string) {
    try {
      const row = [
        new Date().toISOString(),
        result.candidateName,
        result.matchScore,
        result.yearsExperience,
        `${result.education.degree} in ${result.education.field} from ${result.education.school}`,
        result.relevantSkills.join(", "),
        result.experienceHighlights.join("\n"),
        result.matchRationale,
        result.filename,
        driveLink || "",
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "A2:J2",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [row],
        },
      });

      return true;
    } catch (error) {
      console.error("Error appending result:", error);
      throw error;
    }
  }

  async getResults(limit: number = 100) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "A2:J",
        majorDimension: "ROWS",
        valueRenderOption: "FORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      });

      const rows = response.data.values || [];
      return rows.slice(0, limit).map((row: string[]) => ({
        timestamp: row[0],
        candidateName: row[1],
        matchScore: parseFloat(row[2]),
        yearsExperience: row[3],
        education: row[4],
        relevantSkills: row[5].split(", "),
        experienceHighlights: row[6].split("\n"),
        matchRationale: row[7],
        filename: row[8],
        driveLink: row[9],
      }));
    } catch (error) {
      console.error("Error getting results:", error);
      throw error;
    }
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
}

// Singleton instance
let sheetsService: GoogleSheetsService | null = null;

export function initGoogleSheets(config: GoogleSheetsConfig) {
  sheetsService = new GoogleSheetsService(config);
  return sheetsService;
}

export function getSheetsService(): GoogleSheetsService {
  if (!sheetsService) {
    throw new Error("Google Sheets service not initialized");
  }
  return sheetsService;
}
