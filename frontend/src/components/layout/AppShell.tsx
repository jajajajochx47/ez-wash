"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-body">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary animate-pulse" />
          <p className="text-text-muted text-sm">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-body w-full">
      <Sidebar />
      <div className="flex flex-col min-h-screen transition-all duration-300 lg-content-margin">
        <Header />
        <main className="main-content-padding mt-2 mx-auto w-full max-w-[1400px] overflow-x-hidden md:overflow-x-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
