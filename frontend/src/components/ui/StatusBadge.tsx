"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "machine" | "repair";
}

const variants: Record<string, Record<string, string>> = {
  default: {
    ACTIVE: "bg-accent-light text-accent-dark",
    INACTIVE: "bg-body text-text-secondary",
  },
  machine: {
    ACTIVE: "bg-accent-light text-accent-dark",
    MAINTENANCE: "bg-amber-50 text-amber-700",
    DISABLED: "bg-red-50 text-red-600",
  },
  repair: {
    PENDING: "bg-amber-50 text-amber-700",
    FIXED: "bg-accent-light text-accent-dark",
  },
};

const labels: Record<string, string> = {
  ACTIVE: "ใช้งาน",
  MAINTENANCE: "ซ่อมบำรุง",
  DISABLED: "ปิดใช้งาน",
  PENDING: "รอดำเนินการ",
  FIXED: "ซ่อมแล้ว",
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
  VENDING_MACHINE: "ตู้ขายผงซักฟอก",
  OTHER: "อื่นๆ",
};

export default function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const colorClass = variants[variant]?.[status] || "bg-body text-text-secondary";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${colorClass}`}>
      {labels[status] || status}
    </span>
  );
}
