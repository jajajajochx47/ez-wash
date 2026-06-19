/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import Modal from "@/components/ui/Modal";
import CsvImportModal, { ColumnMapping } from "@/components/ui/CsvImportModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineFilter, HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";

interface Branch { id: string; name: string; }
interface Machine { id: string; machineCode: string; machineType: string; branch?: Branch; }
interface Income {
  id: string; amount: number; note?: string; incomeDate: string;
  machine?: Machine; branch?: Branch;
}

export default function IncomePage() {
  const [items, setItems] = useState<Income[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ machineId: "", branchId: "", amount: "", source: "เงินสด", note: "", incomeDate: "" });

  const fetchAll = async () => {
    try {
      const [incRes, brRes, mRes, dashRes] = await Promise.all([
        api.get("/income", { params: { limit: 100, branchId: filterBranch || undefined, date: filterDate || undefined } }),
        api.get("/branch"), 
        api.get("/machine"),
        api.get("/report/dashboard").catch(() => ({ data: { totalIncome: 0, totalExpense: 0, netProfit: 0 } }))
      ]);
      const d = incRes.data;
      setItems(Array.isArray(d) ? d : d.data || []);
      setBranches(brRes.data); 
      setMachines(mRes.data);
      setSummary({
        income: dashRes.data.totalIncome || 0,
        expense: dashRes.data.totalExpense || 0,
        profit: dashRes.data.netProfit || 0
      });
    } catch { toast.error("โหลดข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterBranch, filterDate]);

  const openAdd = () => { setEditing(null); setForm({ machineId: "", branchId: "", amount: "", source: "เงินสด", note: "", incomeDate: new Date().toISOString().split("T")[0] }); setModalOpen(true); };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Encode source into notes to avoid schema changes for now
      const finalNote = form.note ? `[${form.source}] ${form.note}` : `[${form.source}]`;
      const payload = { machineId: form.machineId, branchId: form.branchId, amount: Number(form.amount), note: finalNote, incomeDate: form.incomeDate };
      
      if (editing) { await api.patch(`/income/${editing.id}`, payload); toast.success("แก้ไขสำเร็จ"); }
      else { await api.post("/income", payload); toast.success("เพิ่มสำเร็จ"); }
      setModalOpen(false); fetchAll();
    } catch { toast.error("บันทึกไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบ?")) return;
    try { await api.delete(`/income/${id}`); toast.success("ลบสำเร็จ"); fetchAll(); } catch { toast.error("ลบไม่สำเร็จ"); }
  };

  const getSourceBadge = (note: string = "") => {
    if (note.includes("[QR]")) return <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[11px] font-bold">QR Code</span>;
    if (note.includes("[Coins]")) return <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[11px] font-bold">เหรียญ</span>;
    return <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[11px] font-bold">เงินสด</span>;
  };

  const cleanNote = (note: string = "") => note.replace(/\[.*?\]\s*/, "");

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="page-hero flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="relative z-10">
          <p className="page-eyebrow">Income Management</p>
          <h1 className="page-title">รายรับ</h1>
          <p className="page-subtitle">จัดการ ตรวจสอบ และนำเข้ารายรับของแต่ละสาขา</p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2">
          <button onClick={() => {
            exportCsv("income_report", [
              { header: "วันที่", accessor: (r: Income) => new Date(r.incomeDate).toLocaleDateString("th-TH") },
              { header: "สาขา", accessor: (r: Income) => r.branch?.name || "-" },
              { header: "เครื่อง", accessor: (r: Income) => r.machine?.machineCode || "-" },
              { header: "ประเภทเครื่อง", accessor: (r: Income) => r.machine?.machineType || "-" },
              { header: "จำนวนเงิน (บาท)", accessor: (r: Income) => Number(r.amount) },
              { header: "หมายเหตุ", accessor: (r: Income) => r.note || "-" },
            ], items);
            toast.success("ส่งออก CSV สำเร็จ");
          }} className="btn-secondary-modern flex items-center gap-2 px-4 py-2 text-[13px] transition-all">
            <HiOutlineDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setImportModalOpen(true)} className="btn-secondary-modern flex items-center gap-2 px-4 py-2 text-[13px] transition-all">
            <HiOutlineUpload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={openAdd} className="btn-primary-modern flex items-center gap-2 px-5 py-2 text-[13px] active:scale-[0.98] transition-all">
            <HiOutlinePlus className="w-4 h-4" /> เพิ่มรายรับ
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="soft-card p-5 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">รายรับรวม (Total Income)</p>
            <h3 className="text-2xl font-bold text-text mt-1">฿{summary.income.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
        </div>
        <div className="soft-card p-5 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">รายจ่ายรวม (Total Expense)</p>
            <h3 className="text-2xl font-bold text-text mt-1">฿{summary.expense.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </div>
        </div>
        <div className="soft-card p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">กำไรสุทธิ (Net Profit)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">฿{summary.profit.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="toolbar-panel p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 text-text-secondary mr-2">
          <HiOutlineFilter className="w-5 h-5" />
          <span className="text-[13px] font-medium text-text">ตัวกรอง:</span>
        </div>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] text-text focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20">
          <option value="">ทุกสาขา</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] text-text focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Data Table */}
      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9fa]">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">วันที่</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">สาขา</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">เครื่อง</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">แหล่งที่มา</th>
                <th className="text-right px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">จำนวนเงิน</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">หมายเหตุ</th>
                <th className="text-center px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-muted">ไม่พบข้อมูลรายรับ</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-body/50 transition-colors">
                  <td className="px-6 py-4 text-text">{new Date(item.incomeDate).toLocaleDateString("th-TH")}</td>
                  <td className="px-6 py-4 text-text font-medium">{item.branch?.name || "-"}</td>
                  <td className="px-6 py-4 text-text">{item.machine?.machineCode || "-"}</td>
                  <td className="px-6 py-4">{getSourceBadge(item.note)}</td>
                  <td className="px-6 py-4 text-right font-bold text-text">฿{Number(item.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-text-secondary">{cleanNote(item.note) || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditing(item); setForm({ machineId: item.machine?.id || "", branchId: item.branch?.id || "", amount: String(item.amount), source: "เงินสด", note: cleanNote(item.note), incomeDate: item.incomeDate ? new Date(item.incomeDate).toISOString().split("T")[0] : "" }); setModalOpen(true); }} className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "แก้ไขรายรับ" : "เพิ่มรายรับ"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">สาขา</label>
              <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">เลือกสาขา</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">เครื่อง</label>
              <select value={form.machineId} onChange={e => setForm({...form, machineId: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">เลือกเครื่อง</option>
                {machines.filter(m => !form.branchId || (m as any).branchId === form.branchId || m.branch?.id === form.branchId).map(m => <option key={m.id} value={m.id}>{m.machineCode} ({m.machineType === "WASHER" ? "ซัก" : "อบ"})</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">จำนวนเงิน (บาท)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">แหล่งที่มา</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="เงินสด">เงินสด (Cash)</option>
                <option value="QR">คิวอาร์ (QR Code)</option>
                <option value="Coins">เหรียญ (Coins)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">วันที่</label>
              <input type="date" value={form.incomeDate} onChange={e => setForm({...form, incomeDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">หมายเหตุเพิ่มติม</label>
              <input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all">{editing ? "บันทึกการแก้ไข" : "ยืนยันเพิ่มรายรับ"}</button>
          </div>
        </form>
      </Modal>

      <CsvImportModal<{ machineId: string; branchId: string; amount: number; note: string; incomeDate: string }>
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="นำเข้ารายรับจาก CSV"
        templateHeaders={["วันที่", "สาขา", "เครื่อง", "จำนวนเงิน", "หมายเหตุ"]}
        columns={[
          {
            field: "incomeDate", label: "วันที่", csvHeaders: ["วันที่", "date", "incomeDate"],
            required: true,
            transform: (v) => {
              // Try to parse various date formats → YYYY-MM-DD
              const d = new Date(v);
              return isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10);
            },
          },
          {
            field: "branchId", label: "สาขา", csvHeaders: ["สาขา", "branch", "branchName"],
            required: true,
            transform: (v) => {
              const found = branches.find((b) => b.name.toLowerCase() === v.toLowerCase());
              return found?.id || v;
            },
          },
          {
            field: "machineId", label: "เครื่อง", csvHeaders: ["เครื่อง", "machine", "machineCode"],
            required: true,
            transform: (v) => {
              const found = machines.find((m) => m.machineCode.toLowerCase() === v.toLowerCase());
              return found?.id || v;
            },
          },
          {
            field: "amount", label: "จำนวนเงิน", csvHeaders: ["จำนวนเงิน", "จำนวนเงิน (บาท)", "amount"],
            required: true,
            transform: (v) => Number(v.replace(/[^0-9.-]/g, "")) || 0,
          },
          {
            field: "note", label: "หมายเหตุ", csvHeaders: ["หมายเหตุ", "note", "notes"],
            transform: (v) => v,
          },
        ] as ColumnMapping<{ machineId: string; branchId: string; amount: number; note: string; incomeDate: string }>[]}
        onImport={async (rows) => {
          let success = 0;
          let fail = 0;
          for (const row of rows) {
            try {
              await api.post("/income", row);
              success++;
            } catch {
              fail++;
            }
          }
          if (fail > 0) toast.error(`นำเข้าสำเร็จ ${success} รายการ, ล้มเหลว ${fail} รายการ`);
          else toast.success(`นำเข้าสำเร็จทั้งหมด ${success} รายการ`);
          fetchAll();
        }}
      />
    </div>
  );
}
