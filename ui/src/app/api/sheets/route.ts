import { NextRequest, NextResponse } from "next/server";
import { getSheetsService, initGoogleSheets } from "@/lib/google/sheets";

// Initialize Google Sheets service
const sheetsConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/sheets/callback",
  spreadsheetId: process.env.GOOGLE_SHEETS_ID || "",
};

try {
  initGoogleSheets(sheetsConfig);
} catch (error) {
  console.error("Failed to initialize Google Sheets service:", error);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const sheetsService = getSheetsService();

    if (data.action === "initialize") {
      await sheetsService.initializeSheet();
      return NextResponse.json({ message: "Sheet initialized successfully" });
    }

    if (data.action === "append") {
      const { result, driveLink } = data;
      await sheetsService.appendResult(result, driveLink);
      return NextResponse.json({ message: "Result appended successfully" });
    }

    return NextResponse.json(
      { error: "Invalid action specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Sheets API error:", error);
    return NextResponse.json(
      { error: "Failed to perform sheets operation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const sheetsService = getSheetsService();
    const results = await sheetsService.getResults(limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Sheets API error:", error);
    return NextResponse.json(
      { error: "Failed to get results from sheet" },
      { status: 500 }
    );
  }
}
