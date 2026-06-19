"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "ภาพรวมธุรกิจและประสิทธิภาพร้าน" },
  "/income": { title: "รายรับ", subtitle: "จัดการรายการรับเงินและยอดขาย" },
  "/expenses": { title: "รายจ่าย", subtitle: "ติดตามค่าใช้จ่ายของกิจการ" },
  "/reports": { title: "รายงาน", subtitle: "วิเคราะห์ข้อมูลและส่งออก CSV" },
  "/settings": { title: "ตั้งค่า", subtitle: "จัดการสาขา เครื่อง และหมวดหมู่" },
};

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "Ma Der ซักผ้า", subtitle: "ระบบจัดการร้านสะดวกซัก" };

  return (
    <header className="sticky top-0 z-30 bg-white/65 backdrop-blur-xl border-b border-white/70">
      <div className="flex items-center justify-between min-h-16 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="w-10 lg:hidden" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Ma Der Workspace</p>
            <h1 className="text-xl font-extrabold text-text tracking-tight">{page.title}</h1>
            <p className="hidden sm:block text-[13px] text-text-secondary mt-0.5">{page.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-text">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-text-muted">Signed in</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
