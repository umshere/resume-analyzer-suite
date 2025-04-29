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
import { getDriveService } from "@/lib/google/drive";
import { getSheetsService } from "@/lib/google/sheets";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const [llmProvider, setLLMProvider] = React.useState(
    process.env.NEXT_PUBLIC_LLM_PROVIDER || "local"
  );
  const [isDriveConnected, setIsDriveConnected] = React.useState(false);
  const [isSheetsConnected, setIsSheetsConnected] = React.useState(false);
  const [driveFiles, setDriveFiles] = React.useState<any[]>([]);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    // Check Google services connection status
    const checkConnections = async () => {
      try {
        // Check Drive connection
        const driveResponse = await fetch("/api/drive");
        if (driveResponse.ok) {
          const data = await driveResponse.json();
          setDriveFiles(data.files || []);
          setIsDriveConnected(true);
        } else {
          setIsDriveConnected(false);
        }

        // Check Sheets connection
        const sheetsResponse = await fetch("/api/sheets");
        if (sheetsResponse.ok) {
          setIsSheetsConnected(true);
        } else {
          setIsSheetsConnected(false);
        }
      } catch (error) {
        console.error("Failed to check connections:", error);
        setIsDriveConnected(false);
        setIsSheetsConnected(false);
      }
    };

    checkConnections();

    // Show toast messages based on URL params
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      let description = "Failed to connect to Google service";
      if (error === "no_code") description = "Authorization code missing.";
      if (error === "auth_failed") description = "Authentication process failed.";
      if (error === "sheets_no_code") description = "Sheets authorization code missing.";
      if (error === "sheets_auth_failed") description = "Sheets authentication failed.";
      toast.error("Authentication Failed", { description });
    } else if (success) {
      if (success === "sheets_connected") {
        toast.success("Connected Successfully", {
          description: "Google Sheets integration is now active",
        });
      } else {
        toast.success("Connected Successfully", {
          description: "Google Drive integration is now active",
        });
      }
    }
  }, [searchParams]);

  const handleDriveConnect = async () => {
    try {
      const driveService = getDriveService();
      const authUrl = driveService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to start auth:", error);
      toast.error("Connection Failed", {
        description: "Could not initiate Google Drive connection",
      });
    }
  };

  const handleDriveDisconnect = async () => {
    try {
      document.cookie = "google_tokens=; Max-Age=0; path=/;";
      setIsDriveConnected(false);
      setDriveFiles([]);
      toast.info("Disconnected", {
        description: "Google Drive integration has been disabled",
      });
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Disconnection Failed", {
        description: "Could not disable Google Drive integration",
      });
    }
  };

  const handleLLMChange = async (value: string) => {
    setLLMProvider(value);
    toast.info("LLM Provider Updated", {
      description: `Now using ${value.toUpperCase()} as the LLM provider (UI only)`,
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
                Note: This setting currently only affects the UI display. Backend provider is set via environment variables.
              </p>
            </div>

            {llmProvider !== "local" && (
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key (not stored)"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Google Integrations */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Google Integrations</h2>
          
          {/* Google Drive */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Drive Integration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isDriveConnected
                      ? "Connected to Google Drive"
                      : "Not connected to Google Drive"}
                  </p>
                </div>
                <Button
                  variant={isDriveConnected ? "destructive" : "default"}
                  onClick={isDriveConnected ? handleDriveDisconnect : handleDriveConnect}
                >
                  {isDriveConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>

              {isDriveConnected && driveFiles.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Recent Files in Root Folder</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {driveFiles.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isDriveConnected && driveFiles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No files found in the configured Drive folder.
                </p>
              )}
            </div>
          </div>

          {/* Google Sheets */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sheets Integration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isSheetsConnected
                      ? "Connected to Google Sheets"
                      : "Not connected to Google Sheets"}
                  </p>
                </div>
                <Button
                  variant={isSheetsConnected ? "destructive" : "default"}
                  onClick={async () => {
                    if (isSheetsConnected) {
                      document.cookie = "google_sheets_tokens=; Max-Age=0; path=/;";
                      setIsSheetsConnected(false);
                      toast.info("Disconnected from Google Sheets");
                    } else {
                      try {
                        const sheetsService = getSheetsService();
                        const authUrl = sheetsService.getAuthUrl();
                        window.location.href = authUrl;
                      } catch (error) {
                        console.error("Failed to start sheets auth:", error);
                        toast.error("Could not initiate Google Sheets connection");
                      }
                    }
                  }}
                >
                  {isSheetsConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>

              {isSheetsConnected && (
                <div className="text-sm text-muted-foreground">
                  <p>Analysis results will be automatically saved to your configured Google Sheet.</p>
                  <p className="mt-2">Sheet ID: {process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || "Not configured"}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
