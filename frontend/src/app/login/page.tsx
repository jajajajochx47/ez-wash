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
    <div className="min-h-screen flex items-center justify-center bg-body p-4">
      {/* Login card */}
      <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-lg border border-border overflow-hidden relative z-10" style={{ padding: "40px" }}>
        <div>
          {/* Logo */}
          <div className="text-center flex flex-col items-center justify-center" style={{ marginBottom: "32px" }}>
            <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden bg-white border border-border shadow-sm mb-6 p-2 flex items-center justify-center">
              <img src="/logo.png" alt="Ma Der Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-bold text-text" style={{ fontSize: "26px", marginBottom: "8px" }}>เข้าสู่ระบบ Ma Der ซักผ้า</h1>
            <p className="text-text-secondary font-medium" style={{ fontSize: "14px" }}>ยินดีต้อนรับกลับเข้าสู่ระบบจัดการร้านสะดวกซัก</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "24px" }}>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-2">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@ezwash.com"
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

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-all" />
                <span className="text-[13px] text-text-secondary">Remember me</span>
              </label>
              <button type="button" className="text-[13px] font-medium text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary-dark active:scale-[0.98] shadow-md shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
