import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google/drive";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings?error=auth_failed", req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
    }

    const driveService = getDriveService();
    const tokens = await driveService.getTokens(code);

    // Store tokens in secure cookie or session
    const response = NextResponse.redirect(
      new URL("/settings?success=true", req.url)
    );

    // Set secure cookie with tokens
    response.cookies.set({
      name: "google_tokens",
      value: JSON.stringify(tokens),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=auth_failed", req.url)
    );
  }
}

// Middleware to check and refresh tokens
export async function middleware(req: NextRequest) {
  const tokens = req.cookies.get("google_tokens");

  if (!tokens) {
    return NextResponse.next();
  }

  try {
    const parsedTokens = JSON.parse(tokens.value);
    const driveService = getDriveService();
    driveService.setCredentials(parsedTokens);

    return NextResponse.next();
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.next();
  }
}
