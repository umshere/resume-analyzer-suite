"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PlaygroundPage() {
  const [jd, setJd] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (!jd.trim()) {
        setError("Please enter a job description first");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setIsAnalyzing(true);
        setError(null);
        
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("jd", jd);

          const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Analysis failed");
          }

          const data = await response.json();
          setResult(data);
        } catch (error) {
          setError("Failed to analyze resume. Please try again.");
          console.error("Analysis error:", error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    },
    [jd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Resume Analysis Playground</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - JD Input */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <textarea
            className="w-full h-[400px] p-2 border rounded-md bg-background"
            placeholder="Paste job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </Card>

        {/* Right Column - Resume Drop */}
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
                    <p>Drop the resume here...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-4" />
                    <p>Drag & drop a resume, or click to select</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supports PDF format
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          </Card>

          {/* Analysis Results */}
          <AnimatePresence>
            {isAnalyzing ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCcw className="animate-spin" />
                    <span>Analyzing resume...</span>
                  </div>
                </Card>
              </motion.div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Match Score</h3>
                      <div className="text-3xl font-bold text-primary">
                        {result.match_score}%
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Candidate</h3>
                      <p>{result.candidate_name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Experience</h3>
                      <p>{result.years_experience}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Education</h3>
                      <p>
                        {result.education.degree} in {result.education.field}
                        <br />
                        {result.education.school}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Key Strengths</h3>
                      <ul className="list-disc list-inside">
                        {result.relevant_skills.map((skill: string, i: number) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium">Experience Highlights</h3>
                      <ul className="list-disc list-inside">
                        {result.experience_highlights.map(
                          (highlight: string, i: number) => (
                            <li key={i}>{highlight}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium">Match Rationale</h3>
                      <p className="text-muted-foreground">
                        {result.match_rationale}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
