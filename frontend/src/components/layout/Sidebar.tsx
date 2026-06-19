"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  HiOutlineViewGrid,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineDocumentReport,
  HiOutlineX,
  HiOutlineMenu,
  HiOutlineLogout,
} from "react-icons/hi";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: HiOutlineViewGrid },
  { label: "รายรับ", href: "/income", icon: HiOutlineCurrencyDollar },
  { label: "รายจ่าย", href: "/expenses", icon: HiOutlineCreditCard },
  { label: "รายงาน", href: "/reports", icon: HiOutlineDocumentReport },
];

const bottomNavItems = [
  { label: "ตั้งค่า", href: "/settings", icon: HiOutlineCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="sidebar-logo-padding">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
            <img src="/logo.png" alt="Ma Der Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="block text-lg font-extrabold text-text tracking-tight">Ma Der</span>
            <span className="block text-[11px] font-semibold text-text-muted uppercase tracking-[0.14em]">Laundry Admin</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${
                active
                  ? "bg-sidebar-active text-sidebar-active-text shadow-md shadow-primary/20"
                  : "text-text-secondary hover:bg-sidebar-hover hover:text-primary"
              }`}
            >
              <Icon className={`w-[20px] h-[20px] ${active ? "text-white" : "text-text-muted transition-colors group-hover:text-primary"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-6 mt-auto">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${
                active
                  ? "bg-sidebar-active text-sidebar-active-text shadow-md shadow-primary/20"
                  : "text-text-secondary hover:bg-sidebar-hover hover:text-primary"
              }`}
            >
              <Icon className={`w-[20px] h-[20px] ${active ? "text-white" : "text-text-muted transition-colors group-hover:text-primary"}`} />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-text-secondary hover:bg-red-50 hover:text-red-500 transition-all w-full mt-2"
        >
          <HiOutlineLogout className="w-[20px] h-[20px] text-text-muted transition-colors" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/90 backdrop-blur border border-border text-primary shadow-sm lg:hidden hover:bg-sidebar-hover transition-colors"
      >
        <HiOutlineMenu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-white/95 backdrop-blur-xl border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-6 right-4 p-2 rounded-lg text-text-muted hover:text-primary hover:bg-sidebar-hover transition-colors"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>
        {renderNavContent()}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg-sidebar-width lg:fixed lg:inset-y-0 bg-white/85 backdrop-blur-xl border-r border-white/70 z-40 shadow-[18px_0_50px_rgba(15,23,42,0.06)]">
        {renderNavContent()}
      </aside>
    </>
  );
}
