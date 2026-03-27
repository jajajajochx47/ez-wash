/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineLocationMarker } from "react-icons/hi";

interface Repair { id: string; problem: string; repairCost?: number; repairDate?: string; status: string; createdAt: string; updatedAt?: string; machine?: { id: string; machineCode: string; machineType: string; status: string; branch?: { id: string; name: string } }; }

export default function RepairsPage() {
  const [items, setItems] = useState<Repair[]>([]);
  const [machines, setMachines] = useState<{ id: string; machineCode: string; machineType: string; status: string; branch: { name: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [form, setForm] = useState({ machineId: "", problem: "", repairCost: "", repairDate: "", status: "PENDING" });
  const [viewMode, setViewMode] = useState<"board" | "table">("board");

  const fetchAll = async () => {
    try {
      const [repRes, mRes] = await Promise.all([api.get("/repair"), api.get("/machine")]);
      let d = repRes.data; if (!Array.isArray(d)) d = d.data || [];
      setItems(d); setMachines(mRes.data);
    } catch { toast.error("โหลดข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm({ machineId: "", problem: "", repairCost: "", repairDate: "", status: "PENDING" }); setModalOpen(true); };
  const openEdit = (item: Repair) => { setEditing(item); setForm({ machineId: item.machine?.id || "", problem: item.problem, repairCost: item.repairCost ? String(item.repairCost) : "", repairDate: item.repairDate ? new Date(item.repairDate).toISOString().split("T")[0] : "", status: item.status }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { machineId: form.machineId, problem: form.problem, status: form.status };
      if (form.repairCost) payload.repairCost = Number(form.repairCost);
      if (form.repairDate) payload.repairDate = form.repairDate;
      if (editing) { await api.patch(`/repair/${editing.id}`, payload); toast.success("แก้ไขสำเร็จ"); }
      else { 
        await api.post("/repair", payload); 
        // Automatically set machine to MAINTENANCE if new repair
        await api.patch(`/machine/${form.machineId}`, { status: "MAINTENANCE" });
        toast.success("เพิ่มสำเร็จ เครื่องตั้งสถานะเป็นแจ้งซ่อมแล้ว"); 
      }
      setModalOpen(false); fetchAll();
    } catch { toast.error("บันทึกไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบ?")) return;
    try { await api.delete(`/repair/${id}`); toast.success("ลบสำเร็จ"); fetchAll(); } catch { toast.error("ลบไม่สำเร็จ"); }
  };

  const toggleMachineStatus = async (machineId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
      await api.patch(`/machine/${machineId}`, { status: newStatus });
      toast.success(newStatus === "MAINTENANCE" ? "ปิดใช้งานชั่วคราวแล้ว" : "เปิดใช้งานเครื่องแล้ว");
      fetchAll();
    } catch { toast.error("เปลี่ยนสถานะไม่สำเร็จ"); }
  };

  if (loading) return <LoadingSpinner />;

  const pendingRepairs = items.filter(r => r.status === "PENDING");
  const fixedRepairs = items.filter(r => r.status === "FIXED");

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">แจ้งซ่อม (Repairs)</h1>
          <p className="text-sm text-text-secondary mt-1">จัดการใบแจ้งซ่อมและสถานะเครื่อง</p>
        </div>
        <div className="flex gap-2 bg-body p-1 rounded-xl">
          <button onClick={() => setViewMode("board")} className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${viewMode === "board" ? "bg-white text-text shadow-sm" : "text-text-secondary hover:text-text"}`}>กระดานสถานะ</button>
          <button onClick={() => setViewMode("table")} className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${viewMode === "table" ? "bg-white text-text shadow-sm" : "text-text-secondary hover:text-text"}`}>ตารางข้อมูล</button>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white shadow-md shadow-red-600/20 text-[13px] font-semibold hover:bg-red-700 active:scale-[0.98] transition-all">
          <HiOutlinePlus className="w-4 h-4" /> แจ้งซ่อม
        </button>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Pending Column */}
          <div className="bg-body rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-text flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                รอดำเนินการซ่อม (Pending)
                <span className="bg-amber-100 text-amber-600 text-[11px] px-2 py-0.5 rounded-full ml-1">{pendingRepairs.length}</span>
              </h3>
            </div>
            <div className="space-y-3">
              {pendingRepairs.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm bg-white/50 rounded-xl border border-dashed border-border">ไม่มีรายการค้างซ่อม</div>
              ) : pendingRepairs.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border border-border shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-amber-300 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-amber-50 text-amber-600 text-[11px] font-bold px-2.5 py-1 rounded-md">{r.machine?.machineCode || "-"}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="p-1 rounded text-text-muted hover:text-primary hover:bg-primary/10"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1 rounded text-text-muted hover:text-red-500 hover:bg-red-50"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-[14px] font-medium text-text mb-3">{r.problem}</p>
                  
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                      <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                      {r.machine?.branch?.name}
                    </div>
                    {/* Out of service toggle */}
                    {r.machine?.status === "MAINTENANCE" ? (
                      <button onClick={() => toggleMachineStatus(r.machine!.id, r.machine!.status)} className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors">
                        ปิดใช้งานตู้ (OOS)
                      </button>
                    ) : (
                      <button onClick={() => toggleMachineStatus(r.machine!.id, r.machine!.status)} className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors">
                        เปิดใช้งานปกติ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed Column */}
          <div className="bg-body rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-text flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                ซ่อมเสร็จสิ้น (Fixed)
                <span className="bg-emerald-100 text-emerald-600 text-[11px] px-2 py-0.5 rounded-full ml-1">{fixedRepairs.length}</span>
              </h3>
            </div>
            <div className="space-y-3">
              {fixedRepairs.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm bg-white/50 rounded-xl border border-dashed border-border">ไม่มีรายการซ่อมเสร็จ</div>
              ) : fixedRepairs.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border border-border shadow-[0_2px_10px_rgb(0,0,0,0.02)] opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-body text-text-secondary border border-border text-[11px] font-bold px-2.5 py-1 rounded-md">{r.machine?.machineCode || "-"}</span>
                    {r.repairCost ? <span className="text-[12px] font-bold text-text">฿{r.repairCost.toLocaleString()}</span> : null}
                  </div>
                  <p className="text-[13px] text-text-secondary mb-3 line-through decoration-text-muted">{r.problem}</p>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[11px] text-text-muted">{new Date(r.updatedAt || r.createdAt).toLocaleDateString("th-TH")}</span>
                    <button onClick={() => toggleMachineStatus(r.machine!.id, "MAINTENANCE")} className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        พร้อมใช้งาน
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9fa]"><tr className="border-b border-border">
              <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">วันที่แจ้ง</th>
              <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">เครื่อง</th>
              <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">สถานะตู้</th>
              <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">ปัญหา</th>
              <th className="text-right px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">ค่าซ่อม</th>
              <th className="text-center px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">สถานะการซ่อม</th>
              <th className="text-center px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">จัดการ</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-muted">ไม่พบข้อมูล</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-body/50 transition-colors">
                  <td className="px-6 py-4 text-text">{new Date(item.createdAt).toLocaleDateString("th-TH")}</td>
                  <td className="px-6 py-4 text-text font-medium">{item.machine?.machineCode || "-"}</td>
                  <td className="px-6 py-4">
                    {item.machine?.status === "MAINTENANCE" ? (
                      <button onClick={() => toggleMachineStatus(item.machine!.id, item.machine!.status)} className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold hover:bg-red-100 transition-colors">ปิดตู้ (OOS)</button>
                    ) : (
                      <button onClick={() => toggleMachineStatus(item.machine!.id, item.machine!.status)} className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold hover:bg-emerald-100 transition-colors">เปิดใช้งาน</button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text max-w-[200px] truncate">{item.problem}</td>
                  <td className="px-6 py-4 text-right font-bold text-text">{item.repairCost ? `฿${Number(item.repairCost).toLocaleString()}` : "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                      item.status === "FIXED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {item.status === "FIXED" ? "ซ่อมแล้ว" : "รอดำเนินการ"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "อัปเดตงานซ่อม" : "แจ้งซ่อมตู้ / ปิดตู้"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 mb-4">
            <label className="block text-[13px] font-semibold text-text mb-1.5">เลือกรหัสเครื่องที่เสีย</label>
            <select value={form.machineId} onChange={e => setForm({...form, machineId: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20">
              <option value="">เลือกเครื่อง</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.machineCode} ({m.branch?.name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">อาการเสียเบื้องต้น</label>
            <textarea value={form.problem} onChange={e => setForm({...form, problem: e.target.value})} required rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" placeholder="เช่น น้ำไม่ไหล, เหรียญติด, ระบบไม่ทำงาน" />
          </div>
          {editing && (
            <div className="bg-body/50 p-4 rounded-xl border border-border grid grid-cols-2 gap-4">
              <div><label className="block text-[13px] font-semibold text-text mb-1.5">ค่าอะไหล่/ซ่อม (บาท)</label><input type="number" step="0.01" value={form.repairCost} onChange={e => setForm({...form, repairCost: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></div>
              <div><label className="block text-[13px] font-semibold text-text mb-1.5">สถานะงานซ่อม</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="PENDING">รอดำเนินการ (Pending)</option><option value="FIXED">ซ่อมเสร็จสิ้น (Fixed)</option></select></div>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-[14px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[14px] font-bold shadow-md shadow-red-600/20 hover:bg-red-700 transition-all">{editing ? "บันทึกข้อมูลซ่อม" : "แจ้งซ่อมทันที"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
