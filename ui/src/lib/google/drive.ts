import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  folderId: string;
}

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: any;
  private folderId: string;

  constructor(config: GoogleDriveConfig) {
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
    this.folderId = config.folderId;
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string) {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: filename,
          mimeType: mimeType,
          parents: [this.folderId],
        },
        media: {
          mimeType: mimeType,
          body: file,
        },
      });

      // Make file viewable with link
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      // Get shareable link
      const fileData = await this.drive.files.get({
        fileId: response.data.id,
        fields: "webViewLink",
      });

      return {
        fileId: response.data.id,
        webViewLink: fileData.data.webViewLink,
      };
    } catch (error) {
      console.error("Error uploading to Google Drive:", error);
      throw error;
    }
  }

  async createFolder(folderName: string) {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [this.folderId],
        },
      });

      return response.data.id;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  async listFiles(folderId = this.folderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, webViewLink)",
      });

      return response.data.files;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.file"],
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
}

// Singleton instance
let driveService: GoogleDriveService | null = null;

export function initGoogleDrive(config: GoogleDriveConfig) {
  driveService = new GoogleDriveService(config);
  return driveService;
}

export function getDriveService(): GoogleDriveService {
  if (!driveService) {
    throw new Error("Google Drive service not initialized");
  }
  return driveService;
}
