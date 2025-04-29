export interface AnalysisResult {
  timestamp: string;
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
  filename: string;
}

class LocalStorageService {
  private readonly STORAGE_KEY = "resume-analysis-results";

  constructor() {
    // Initialize storage if it doesn't exist
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem(this.STORAGE_KEY)
    ) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  async saveResult(result: AnalysisResult): Promise<void> {
    if (typeof window === "undefined") return;

    const results = this.getResults();
    results.push(result);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(results));
  }

  getResults(limit: number = 100): AnalysisResult[] {
    if (typeof window === "undefined") return [];

    const results = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
    return results.slice(-limit);
  }

  clearResults(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
  }

  exportResults(): string {
    const results = this.getResults();
    return JSON.stringify(results, null, 2);
  }

  importResults(jsonData: string): void {
    try {
      const results = JSON.parse(jsonData);
      if (!Array.isArray(results)) {
        throw new Error("Invalid data format");
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(results));
    } catch (error) {
      console.error("Failed to import results:", error);
      throw error;
    }
  }
}

// Singleton instance
let storageService: LocalStorageService | null = null;

export function getStorageService(): LocalStorageService {
  if (!storageService) {
    storageService = new LocalStorageService();
  }
  return storageService;
}
