"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
}

export default function StatCard({ title, value, trend, trendUp, highlight = false }: StatCardProps) {
  return (
    <div
      className={`relative rounded-[16px] p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        highlight
          ? "bg-white border-2 border-primary shadow-sm"
          : "bg-white border border-border shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[15px] font-medium text-text-secondary">{title}</p>
        <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14l-4-4H6a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
      <p className="text-[28px] font-bold text-text tracking-tight mb-3">{value}</p>
      {trend && (
        <div className="flex items-center gap-2 text-[12px]">
          <span className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
            trendUp ? "bg-accent-light text-accent-dark" : "bg-red-50 text-red-600"
          }`}>
            <span>{trendUp ? "↑" : "↓"}</span> {trend}
          </span>
          <span className="text-text-muted">vs last month</span>
        </div>
      )}
    </div>
  );
}
