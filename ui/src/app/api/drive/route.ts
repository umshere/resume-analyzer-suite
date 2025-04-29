import { NextRequest, NextResponse } from "next/server";
import { getDriveService, initGoogleDrive } from "@/lib/google/drive";

// Initialize Google Drive service
const driveConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/drive/callback",
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
};

try {
  initGoogleDrive(driveConfig);
} catch (error) {
  console.error("Failed to initialize Google Drive service:", error);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string;
    const mimeType = file.type;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveService = getDriveService();

    // Upload to Drive
    const result = await driveService.uploadFile(
      buffer,
      filename || file.name,
      mimeType
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Drive API error:", error);
    return NextResponse.json(
      { error: "Failed to upload to Google Drive" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const driveService = getDriveService();
    const files = await driveService.listFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Drive API error:", error);
    return NextResponse.json(
      { error: "Failed to list files from Google Drive" },
      { status: 500 }
    );
  }
}
