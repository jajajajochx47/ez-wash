/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineDownload, HiOutlineCalculator } from "react-icons/hi";

interface Collection {
  id: string; amount: number; collectedAt: string;
  machine?: { id: string; machineCode: string; machineType: string; branch?: { id: string; name: string } };
  collectedBy?: { id: string; name: string };
}

export default function CollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [machines, setMachines] = useState<{ id: string; machineCode: string; machineType: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ machineId: "", collectedById: "", amount: "", expectedAmount: "0" });

  const fetchAll = async () => {
    try {
      const [colRes, mRes] = await Promise.all([api.get("/collection", { params: { limit: 100 } }), api.get("/machine")]);
      const d = colRes.data;
      setItems(Array.isArray(d) ? d : d.data || []);
      setMachines(mRes.data);
      try { const uRes = await api.get("/users"); setUsers(uRes.data); } catch {}
    } catch { toast.error("โหลดข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleMachineChange = (machineId: string) => {
    // Removed random expected amount generator
    setForm({...form, machineId, expectedAmount: "0"});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      await api.post("/collection", { machineId: form.machineId, collectedById: form.collectedById, amount: Number(form.amount) }); 
      toast.success("บันทึกรับเงินเรียบร้อย"); 
      setModalOpen(false); 
      fetchAll(); 
    } catch { toast.error("บันทึกไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบประวัติการไขตู้ทิ้งใช่หรือไม่?")) return;
    try { await api.delete(`/collection/${id}`); toast.success("ลบสำเร็จ"); fetchAll(); } catch { toast.error("ลบไม่สำเร็จ"); }
  };

  if (loading) return <LoadingSpinner />;

  const totalCollected = items.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">จดบันทึกไขตู้เก็บเงิน (Collections)</h1>
          <p className="text-sm text-text-secondary mt-1">บันทึกยอดเงินจริงจากการไขตู้ (Reconciliation)</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-text-secondary hover:text-text hover:bg-body transition-all text-[13px] font-medium shadow-sm">
            <HiOutlineDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { setForm({ machineId: "", collectedById: "", amount: "", expectedAmount: "0" }); setModalOpen(true); }} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white shadow-md shadow-primary/20 text-[13px] font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all">
            <HiOutlinePlus className="w-4 h-4" /> บันทึกการเก็บเงิน
          </button>
        </div>
      </div>

      {/* Summary highlight */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 font-medium text-sm">ยอดเก็บเงินรวมทั้งหมดวันนี้</p>
            <h2 className="text-3xl font-bold mt-1">฿{totalCollected.toLocaleString()}</h2>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-blue-200 text-xs mb-1">จำนวนครั้งที่ไขตู้</p>
              <p className="text-xl font-bold">{items.length} <span className="text-sm font-normal">ตู้</span></p>
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-blue-200 text-xs mb-1">ยอดรวมรายการ</p>
              <p className="text-xl font-bold">฿{totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <HiOutlineCalculator className="absolute -right-6 -bottom-10 w-48 h-48 text-white/5 pointer-events-none transform -rotate-12" />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-white">
          <h3 className="text-base font-bold text-text">ประวัติการเก็บเงิน (History Log)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9fa]">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">วันที่ไขตู้</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">เวลาไขตู้</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">สาขา</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">ผู้เก็บเงิน</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">รหัสเครื่อง</th>
                <th className="text-right px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">ยอดรับจริง</th>
                <th className="text-center px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">สถานะ</th>
                <th className="text-center px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-muted">ยังไม่มีประวัติการเก็บเงิน</td></tr>
              ) : items.map(item => {
                const date = new Date(item.collectedAt);
                return (
                  <tr key={item.id} className="hover:bg-body/50 transition-colors">
                    <td className="px-6 py-4 text-text">{date.toLocaleDateString("th-TH")}</td>
                    <td className="px-6 py-4 text-text-secondary">{date.toLocaleTimeString("th-TH", {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="px-6 py-4 text-text font-medium">{item.machine?.branch?.name || "-"}</td>
                    <td className="px-6 py-4 text-text font-medium">{item.collectedBy?.name || "-"}</td>
                    <td className="px-6 py-4 text-text">
                      <span className="bg-body border border-border px-2 py-1 rounded text-xs font-bold font-mono">
                        {item.machine?.machineCode || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-accent-dark text-[14px]">฿{Number(item.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">สำเร็จ</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="บันทึกและตรวจสอบยอดเงิน (Reconciliation)">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-body/50 p-4 rounded-xl border border-border mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-text mb-1.5">เครื่องซัก/อบ</label>
                <select value={form.machineId} onChange={e => handleMachineChange(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="">เลือกเครื่อง</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.machineCode} ({
                        m.machineType === "WASHER" ? "ซัก" : 
                        m.machineType === "DRYER" ? "อบ" : 
                        m.machineType === "VENDING_MACHINE" ? "ตู้ขายผง" : "อื่นๆ"
                      })
                    </option>
                  ))}
                </select>
              </div>
              {users.length > 0 && (
                <div>
                  <label className="block text-[13px] font-semibold text-text mb-1.5">ผู้เก็บเงิน</label>
                  <select value={form.collectedById} onChange={e => setForm({...form, collectedById: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option value="">เลือกพนักงาน</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-body/30 p-4 rounded-xl border border-border">
            <label className="block text-[13px] font-bold text-text mb-2">ยอดเงินไขตู้จริง (Actual Amount)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-secondary">฿</span>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white text-[16px] font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="0.00" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-[14px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" disabled={!form.machineId || !form.amount} className="flex-1 py-3 rounded-xl bg-primary text-white text-[14px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed">ยืนยันยอดเงินเก็บ</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
