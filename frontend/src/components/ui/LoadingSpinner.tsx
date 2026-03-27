"use client";

import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-3 border-border-light border-t-primary animate-spin" />
    </div>
  );
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-border-light rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
