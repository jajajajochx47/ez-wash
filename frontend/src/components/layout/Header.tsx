"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { HiOutlineSearch } from "react-icons/hi";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/income": "รายรับ",
  "/expenses": "รายจ่าย",
  // "/collections": "เก็บเงินจากเครื่อง",
  "/repairs": "ซ่อมบำรุง",
  "/reports": "รายงาน",
  "/settings": "ตั้งค่า",
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();


  return (
    <header className="sticky top-0 z-30 bg-body">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <div className="w-10 lg:hidden" />
          <div>
            <h2 className="text-[20px] font-bold text-text tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
            </h2>
            <p className="text-[13px] text-text-secondary mt-0.5">
              It is the best time to manage your business
            </p>
          </div>
        </div>

        {/* Right: Search + Avatar */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-body transition-colors">
            <HiOutlineSearch className="w-5 h-5" />
          </button>
          
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-body transition-colors relative">
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-text">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-text-secondary">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
