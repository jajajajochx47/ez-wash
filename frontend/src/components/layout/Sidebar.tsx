"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  HiOutlineViewGrid,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineCollection,
  HiOutlineCog,
  HiOutlineDocumentReport,
  HiOutlineX,
  HiOutlineMenu,
  HiOutlineLogout,
} from "react-icons/hi";
import { MdOutlineHandyman } from "react-icons/md";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: HiOutlineViewGrid },
  { label: "รายรับ", href: "/income", icon: HiOutlineCurrencyDollar },
  { label: "รายจ่าย", href: "/expenses", icon: HiOutlineCreditCard },
  // { label: "เก็บเงิน", href: "/collections", icon: HiOutlineCollection },
  // { label: "ซ่อมบำรุง", href: "/repairs", icon: MdOutlineHandyman },
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-border shadow-sm">
            <img src="/logo.png" alt="Ma Der Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">Ma Der ซักผ้า</span>
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
                  ? "bg-sidebar-active text-sidebar-active-text"
                  : "text-text-secondary hover:bg-sidebar-hover hover:text-text"
              }`}
            >
              <Icon className={`w-[20px] h-[20px] ${active ? "text-primary" : "text-text-muted transition-colors group-hover:text-text"}`} />
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
                  ? "bg-sidebar-active text-sidebar-active-text"
                  : "text-text-secondary hover:bg-sidebar-hover hover:text-text"
              }`}
            >
              <Icon className={`w-[20px] h-[20px] ${active ? "text-primary" : "text-text-muted transition-colors group-hover:text-text"}`} />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:bg-sidebar-hover hover:text-red-500 transition-all w-full mt-2"
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
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white border border-border text-primary lg:hidden hover:bg-sidebar-hover transition-colors"
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
        className={`fixed top-0 left-0 h-full w-[260px] bg-sidebar-bg border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
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
      <aside className="hidden lg:flex lg:flex-col lg-sidebar-width lg:fixed lg:inset-y-0 bg-sidebar-bg border-r border-border z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {renderNavContent()}
      </aside>
    </>
  );
}
