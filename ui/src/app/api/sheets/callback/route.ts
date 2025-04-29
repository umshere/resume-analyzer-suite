import { NextRequest, NextResponse } from "next/server";
import { getSheetsService } from "@/lib/google/sheets";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings?error=sheets_auth_failed", req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings?error=sheets_no_code", req.url)
      );
    }

    const sheetsService = getSheetsService();
    const tokens = await sheetsService.getTokens(code);

    // Store tokens in secure cookie
    const response = NextResponse.redirect(
      new URL("/settings?success=sheets_connected", req.url)
    );

    response.cookies.set({
      name: "google_sheets_tokens",
      value: JSON.stringify(tokens),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Initialize the sheet after successful authentication
    await sheetsService.initializeSheet();

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=sheets_auth_failed", req.url)
    );
  }
}

// Middleware to check and refresh tokens
export async function middleware(req: NextRequest) {
  const tokens = req.cookies.get("google_sheets_tokens");

  if (!tokens) {
    return NextResponse.next();
  }

  try {
    const parsedTokens = JSON.parse(tokens.value);
    const sheetsService = getSheetsService();
    sheetsService.setCredentials(parsedTokens);

    return NextResponse.next();
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.next();
  }
}
