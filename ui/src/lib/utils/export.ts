interface AnalysisResult {
  candidate_name: string;
  match_score: number;
  years_experience: string;
  education: {
    degree: string;
    field: string;
    school: string;
  };
  relevant_skills: string[];
  experience_highlights: string[];
  match_rationale: string;
  filename: string;
  driveLink?: string;
}

export function generateCSV(results: AnalysisResult[]): string {
  // Define CSV headers
  const headers = [
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

  // Convert results to CSV rows
  const rows = results.map((result) => [
    result.candidate_name,
    result.match_score.toString(),
    result.years_experience,
    `${result.education.degree} in ${result.education.field} from ${result.education.school}`,
    result.relevant_skills.join("; "),
    result.experience_highlights.join("; "),
    result.match_rationale,
    result.filename,
    result.driveLink || "",
  ]);

  // Escape and quote CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Join headers and rows
  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
