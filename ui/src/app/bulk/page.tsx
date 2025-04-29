"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, RefreshCcw, FileText, Check, X, CloudUpload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ProgressBar } from "./components/ProgressBar";
import { toast } from "sonner";
import { generateCSV, downloadCSV } from "@/lib/utils/export";

interface AnalysisProgress {
  [key: string]: {
    status: "waiting" | "processing" | "completed" | "error";
    result?: any;
    error?: string;
    driveLink?: string;
  };
}

export default function BulkAnalysisPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [jd, setJd] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [progress, setProgress] = React.useState<AnalysisProgress>({});
  const [error, setError] = React.useState<string | null>(null);
  const [isDriveEnabled, setIsDriveEnabled] = React.useState(false);
  const [isSheetsEnabled, setIsSheetsEnabled] = React.useState(false);

  React.useEffect(() => {
    // Check Google integrations status
    const checkIntegrations = async () => {
      try {
        const [driveRes, sheetsRes] = await Promise.all([
          fetch("/api/drive"),
          fetch("/api/sheets"),
        ]);
        setIsDriveEnabled(driveRes.ok);
        setIsSheetsEnabled(sheetsRes.ok);
      } catch (error) {
        console.error("Failed to check integrations:", error);
      }
    };

    checkIntegrations();
  }, []);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (!jd.trim()) {
      setError("Please enter a job description first");
      return;
    }

    if (files.length === 0) {
      setError("Please add at least one resume");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Initialize progress for all files
    const initialProgress: AnalysisProgress = {};
    files.forEach((file) => {
      initialProgress[file.name] = { status: "waiting" };
    });
    setProgress(initialProgress);

    // Process files sequentially
    for (const file of files) {
      try {
        // Update status to processing
        setProgress((prev) => ({
          ...prev,
          [file.name]: { status: "processing" },
        }));

        // Upload to Drive if enabled
        let driveLink: string | undefined;
        if (isDriveEnabled) {
          const driveFormData = new FormData();
          driveFormData.append("file", file);
          const driveRes = await fetch("/api/drive", {
            method: "POST",
            body: driveFormData,
          });
          if (driveRes.ok) {
            const { webViewLink } = await driveRes.json();
            driveLink = webViewLink;
          }
        }

        // Analyze resume
        const formData = new FormData();
        formData.append("file", file);
        formData.append("jd", jd);
        if (driveLink) {
          formData.append("driveLink", driveLink);
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const result = await response.json();

        // Update status to completed with result
        setProgress((prev) => ({
          ...prev,
          [file.name]: { status: "completed", result, driveLink },
        }));

        // Show success toast with Drive/Sheets status
        const integrations = [];
        if (driveLink) integrations.push("saved to Drive");
        if (isSheetsEnabled) integrations.push("recorded in Sheets");
        
        if (integrations.length > 0) {
          toast.success(`Analysis complete and ${integrations.join(", ")}`);
        } else {
          toast.success("Analysis complete");
        }
      } catch (error) {
        console.error(`Error analyzing ${file.name}:`, error);
        setProgress((prev) => ({
          ...prev,
          [file.name]: {
            status: "error",
            error: "Failed to analyze resume",
          },
        }));
        toast.error(`Failed to analyze ${file.name}`);
      }
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bulk Resume Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - JD Input */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <textarea
            className="w-full h-[300px] p-2 border rounded-md bg-background"
            placeholder="Paste job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </Card>

        {/* Right Column - Resume Upload */}
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Resume Upload</h2>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/10" : "border-muted",
                error ? "border-destructive" : ""
              )}
            >
              <input {...getInputProps()} />
              <AnimatePresence>
                {isDragActive ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-4 text-primary" />
                    <p>Drop the resumes here...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-4" />
                    <p>Drag & drop resumes, or click to select</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supports multiple PDF files
                    </p>
                    {(isDriveEnabled || isSheetsEnabled) && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                        {isDriveEnabled && (
                          <span className="flex items-center gap-1">
                            <CloudUpload className="w-4 h-4" />
                            Auto-upload to Drive
                          </span>
                        )}
                        {isSheetsEnabled && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Record in Sheets
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          </Card>

          {/* File List and Progress */}
          {files.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-4">Selected Files</h3>
              <div className="space-y-2 mb-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md",
                      progress[file.name]?.status === "processing" && "bg-muted",
                      progress[file.name]?.status === "completed" && "bg-primary/10",
                      progress[file.name]?.status === "error" && "bg-destructive/10"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {progress[file.name]?.status === "completed" && (
                        <>
                          <Check className="w-4 h-4 text-primary" />
                          {progress[file.name]?.driveLink && (
                            <a
                              href={progress[file.name].driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <CloudUpload className="w-4 h-4" />
                            </a>
                          )}
                        </>
                      )}
                      {progress[file.name]?.status === "error" && (
                        <X className="w-4 h-4 text-destructive" />
                      )}
                      {progress[file.name]?.status === "processing" && (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isAnalyzing}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Controls */}
              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Start Analysis"
                  )}
                </Button>

                {isAnalyzing && (
                  <ProgressBar
                    value={Object.values(progress).filter(
                      (p) => p.status === "completed" || p.status === "error"
                    ).length}
                    total={files.length}
                  />
                )}
              </div>
            </Card>
          )}

          {/* Results Summary */}
          {Object.entries(progress).filter(([_, p]) => p.status === "completed").length > 0 && (
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Analysis Results</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const results = Object.entries(progress)
                      .filter(([_, p]) => p.status === "completed")
                      .map(([_, p]) => ({
                        ...p.result,
                        driveLink: p.driveLink,
                      }));
                    const csv = generateCSV(results);
                    downloadCSV(csv, `resume-analysis-${new Date().toISOString().split('T')[0]}.csv`);
                    toast.success("Analysis results exported to CSV");
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="space-y-4">
                {Object.entries(progress)
                  .filter(([_, p]) => p.status === "completed")
                  .sort((a, b) => (b[1].result?.match_score || 0) - (a[1].result?.match_score || 0))
                  .map(([filename, p]) => (
                    <div key={filename} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{p.result.candidate_name}</h4>
                        <div className="flex items-center gap-2">
                          {p.driveLink && (
                            <a
                              href={p.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <CloudUpload className="w-4 h-4" />
                            </a>
                          )}
                          <span className="text-xl font-bold text-primary">
                            {p.result.match_score}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {p.result.years_experience} | {p.result.education.degree}
                      </p>
                      <div className="text-sm">
                        <strong>Key Strengths:</strong>{" "}
                        {p.result.relevant_skills.slice(0, 3).join(", ")}
                        {p.result.relevant_skills.length > 3 && "..."}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
