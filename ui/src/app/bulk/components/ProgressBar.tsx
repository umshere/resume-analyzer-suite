"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  total: number;
  className?: string;
}

export function ProgressBar({ value, total, className }: ProgressBarProps) {
  const percentage = Math.round((value / total) * 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Processing resumes...</span>
        <span>{value} of {total}</span>
      </div>
      <Progress value={percentage} className="h-2">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </Progress>
      <div className="text-center text-sm text-muted-foreground">
        {percentage}% complete
      </div>
    </div>
  );
}
