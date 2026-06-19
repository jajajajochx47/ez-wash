"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("เข้าสู่ระบบสำเร็จ");
    } catch {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-body p-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl" />

      {/* Login card */}
      <div className="w-full max-w-[460px] bg-white/90 backdrop-blur-xl rounded-[28px] shadow-[0_28px_80px_rgba(15,23,42,0.14)] border border-white/80 overflow-hidden relative z-10" style={{ padding: "40px" }}>
        <div>
          {/* Logo */}
          <div className="text-center flex flex-col items-center justify-center" style={{ marginBottom: "32px" }}>
            <div className="w-[132px] h-[132px] rounded-[28px] overflow-hidden bg-white border border-border shadow-md shadow-primary/10 mb-6 p-3 flex items-center justify-center">
              <img src="/logo.png" alt="Ma Der Logo" className="w-full h-full object-contain" />
            </div>
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary mb-4">
              Laundry Management
            </div>
            <h1 className="font-extrabold text-text tracking-tight" style={{ fontSize: "28px", marginBottom: "8px" }}>เข้าสู่ระบบ Ma Der ซักผ้า</h1>
            <p className="text-text-secondary font-medium leading-6" style={{ fontSize: "14px" }}>จัดการรายรับ รายจ่าย และรายงานร้านสะดวกซักได้ในที่เดียว</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "24px" }}>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-2">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ma-der.com"
                className="w-full px-4 py-3 rounded-xl bg-body/50 border border-border text-text placeholder-text-muted text-[14px] focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-body/50 border border-border text-text placeholder-text-muted text-[14px] focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-primary text-white text-[14px] font-bold hover:bg-primary-dark active:scale-[0.98] shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
