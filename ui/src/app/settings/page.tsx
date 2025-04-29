"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getStorageService } from "@/lib/storage/local";

export default function SettingsPage() {
  const [llmProvider, setLLMProvider] = React.useState("local");
  const [apiKey, setApiKey] = React.useState("");

  React.useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== "undefined") {
      const savedProvider = localStorage.getItem("llm_provider") || "local";
      const savedKey = localStorage.getItem("gemini_api_key");
      setLLMProvider(savedProvider);
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, []);

  const handleLLMChange = async (value: string) => {
    setLLMProvider(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("llm_provider", value);
    }
    toast.info("LLM Provider Updated", {
      description: `Now using ${value.toUpperCase()} as the LLM provider`,
    });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", newKey);
    }
    toast.success("API Key Updated", {
      description: "Your API key has been saved",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        {/* LLM Provider Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">LLM Provider</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="llm-provider">Select Provider</Label>
              <Select value={llmProvider} onValueChange={handleLLMChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select LLM provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local LLM</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select which LLM provider to use for resume analysis.
              </p>
            </div>

            {llmProvider !== "local" && (
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                />
              </div>
            )}
          </div>
        </Card>

          {/* Storage Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Storage Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Using local storage for analysis results
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const storage = getStorageService();
                    storage.clearResults();
                    toast.success("Storage cleared successfully");
                  }}
                >
                  Clear Storage
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Analysis results are stored locally in your browser.</p>
                <p className="mt-2">You can export results to JSON for backup.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const storage = getStorageService();
                    const data = storage.exportResults();
                    const blob = new Blob([data], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "resume-analysis-results.json";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Results
                </Button>
                <Input
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="import-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const storage = getStorageService();
                          storage.importResults(event.target?.result as string);
                          toast.success("Results imported successfully");
                        } catch (error) {
                          toast.error("Failed to import results");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    document.getElementById("import-file")?.click();
                  }}
                >
                  Import Results
                </Button>
              </div>
            </div>
          </Card>
      </div>
    </div>
  );
}
