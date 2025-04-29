import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";
import os from "os";
import { createLLMProvider } from "@/lib/llm/provider";
import { getStorageService } from "@/lib/storage/local";

// Get API key from headers
function getApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req);
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jd = formData.get("jd") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create temp file with unique name
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    tempFilePath = path.join(os.tmpdir(), `resume-${uniqueSuffix}.pdf`);

    // Convert File to Buffer and write to temp file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, buffer);

    // Extract text using pdftotext
    const text = execSync(`pdftotext "${tempFilePath}" -`).toString();

    // Create prompt
    const prompt = `Compare this resume against our job requirements and output ONLY a JSON object containing:
- candidate_name: string
- education: object (degree, field, school)
- years_experience: string
- relevant_skills: array of strings
- experience_highlights: array of strings
- match_score: number (0-100)
- match_rationale: string

Job Description:
${jd}

Resume Text:
${text}`;

    // Use configured LLM provider from environment
    const llmProvider = createLLMProvider(process.env.NEXT_PUBLIC_LLM_PROVIDER);

    const analysis = await llmProvider.analyze(prompt);

    // Extract content from LLM response
    const llmContent = analysis.choices[0].message.content;
    const cleanContent = llmContent
      .replace("```json\n", "")
      .replace("\n```", "");
    const result = JSON.parse(cleanContent);

    // Add file metadata
    result.filename = file.name;
    result.analyzed_at = new Date().toISOString();
    result.provider = process.env.NEXT_PUBLIC_LLM_PROVIDER || "local";

    // Save to local storage
    try {
      const storage = getStorageService();
      await storage.saveResult(result);
    } catch (error) {
      console.error("Failed to save to local storage:", error);
      // Don't fail the request if storage fails
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        console.error("Error cleaning up temp file:", e);
      }
    }
  }
}
