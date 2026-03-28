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
interface ExpenseCategory { id: string; name: string; }
interface Expense { id: string; amount: number; description?: string; expenseDate: string; branch?: Branch; category?: ExpenseCategory; }

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ branchId: "", categoryId: "", amount: "", description: "", expenseDate: "" });

  const fetchAll = async () => {
    try {
      const [expRes, brRes, catRes, dashRes] = await Promise.all([
        api.get("/expense", { params: { limit: 100, branchId: filterBranch || undefined, categoryId: filterCategory || undefined, date: filterDate || undefined } }),
        api.get("/branch"), 
        api.get("/expensecategory"),
        api.get("/report/dashboard").catch(() => ({ data: { totalIncome: 0, totalExpense: 0, netProfit: 0 } }))
      ]);
      const d = expRes.data;
      setItems(Array.isArray(d) ? d : d.data || []);
      setBranches(brRes.data); 
      setCategories(catRes.data);
      setSummary({
        income: dashRes.data.totalIncome || 0,
        expense: dashRes.data.totalExpense || 0,
        profit: dashRes.data.netProfit || 0
      });
    } catch { toast.error("โหลดข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, [filterBranch, filterCategory, filterDate]);

  const openAdd = () => { setEditing(null); setForm({ branchId: "", categoryId: "", amount: "", description: "", expenseDate: new Date().toISOString().split("T")[0] }); setModalOpen(true); };
  const openEdit = (item: Expense) => { setEditing(item); setForm({ branchId: item.branch?.id || "", categoryId: item.category?.id || "", amount: String(item.amount), description: item.description || "", expenseDate: new Date(item.expenseDate).toISOString().split("T")[0] }); setModalOpen(true); };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) { await api.patch(`/expense/${editing.id}`, payload); toast.success("แก้ไขสำเร็จ"); }
      else { await api.post("/expense", payload); toast.success("เพิ่มสำเร็จ"); }
      setModalOpen(false); fetchAll();
    } catch { toast.error("บันทึกไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบ?")) return;
    try { await api.delete(`/expense/${id}`); toast.success("ลบสำเร็จ"); fetchAll(); } catch { toast.error("ลบไม่สำเร็จ"); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">รายจ่าย (Expenses)</h1>
          <p className="text-sm text-text-secondary mt-1">บันทึกและตรวจสอบค่าใช้จ่ายต่างๆ ของกิจการ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            exportCsv("expense_report", [
              { header: "วันที่", accessor: (r: Expense) => new Date(r.expenseDate).toLocaleDateString("th-TH") },
              { header: "สาขา", accessor: (r: Expense) => r.branch?.name || "-" },
              { header: "หมวดหมู่", accessor: (r: Expense) => r.category?.name || "-" },
              { header: "จำนวนเงิน (บาท)", accessor: (r: Expense) => Number(r.amount) },
              { header: "รายละเอียด", accessor: (r: Expense) => r.description || "-" },
            ], items);
            toast.success("ส่งออก CSV สำเร็จ");
          }} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-text-secondary hover:text-text hover:bg-body transition-all text-[13px] font-medium shadow-sm">
            <HiOutlineDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-text-secondary hover:text-text hover:bg-body transition-all text-[13px] font-medium shadow-sm">
            <HiOutlineUpload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white shadow-md shadow-red-600/20 text-[13px] font-semibold hover:bg-red-700 active:scale-[0.98] transition-all">
            <HiOutlinePlus className="w-4 h-4" /> เพิ่มรายจ่าย
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">รายรับรวม (Total Income)</p>
            <h3 className="text-2xl font-bold text-text mt-1">฿{summary.income.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm flex items-center justify-between border-l-4 border-l-red-500 bg-red-50/20">
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">รายจ่ายรวม (Total Expense)</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">฿{summary.expense.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[13px] font-semibold text-text-secondary">กำไรสุทธิ (Net Profit)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">฿{summary.profit.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 text-text-secondary mr-2">
          <HiOutlineFilter className="w-5 h-5" />
          <span className="text-[13px] font-medium text-text">ตัวกรอง:</span>
        </div>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] text-text focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20">
          <option value="">ทุกสาขา</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] text-text focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20">
          <option value="">ทุกหมวดหมู่ค่าใช้จ่าย</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] text-text focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9fa]">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">วันที่</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">สาขา</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">หมวดหมู่</th>
                <th className="text-right px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">จำนวนเงิน</th>
                <th className="text-left px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">รายละเอียด</th>
                <th className="text-center px-6 py-4 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-muted">ไม่พบข้อมูลรายจ่าย</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-body/50 transition-colors">
                  <td className="px-6 py-4 text-text">{new Date(item.expenseDate).toLocaleDateString("th-TH")}</td>
                  <td className="px-6 py-4 text-text font-medium">{item.branch?.name || "-"}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-body rounded-full text-[12px] font-medium text-text-secondary border border-border">{item.category?.name || "-"}</span></td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">-฿{Number(item.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-text-secondary">{item.description || "-"}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่าย"}>
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
              <label className="block text-[13px] font-semibold text-text mb-1.5">หมวดหมู่</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">จำนวนเงิน (บาท)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">วันที่</label>
              <input type="date" value={form.expenseDate} onChange={e => setForm({...form, expenseDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">รายละเอียด</label>
            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/30 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="เช่น ค่าไฟเดือนนี้, ค่าเปลี่ยนอะไหล่" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-[13px] font-bold shadow-md shadow-red-600/20 hover:bg-red-700 transition-all">{editing ? "บันทึกการแก้ไข" : "ยืนยันเพิ่มรายจ่าย"}</button>
          </div>
        </form>
      </Modal>

      <CsvImportModal<{ branchId: string; categoryId: string; amount: number; description: string; expenseDate: string }>
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="นำเข้ารายจ่ายจาก CSV"
        templateHeaders={["วันที่", "สาขา", "หมวดหมู่", "จำนวนเงิน", "รายละเอียด"]}
        columns={[
          {
            field: "expenseDate", label: "วันที่", csvHeaders: ["วันที่", "date", "expenseDate"],
            required: true,
            transform: (v) => {
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
            field: "categoryId", label: "หมวดหมู่", csvHeaders: ["หมวดหมู่", "category", "categoryName"],
            required: true,
            transform: (v) => {
              const found = categories.find((c) => c.name.toLowerCase() === v.toLowerCase());
              return found?.id || v;
            },
          },
          {
            field: "amount", label: "จำนวนเงิน", csvHeaders: ["จำนวนเงิน", "จำนวนเงิน (บาท)", "amount"],
            required: true,
            transform: (v) => Number(v.replace(/[^0-9.-]/g, "")) || 0,
          },
          {
            field: "description", label: "รายละเอียด", csvHeaders: ["รายละเอียด", "description", "note"],
            transform: (v) => v,
          },
        ] as ColumnMapping<{ branchId: string; categoryId: string; amount: number; description: string; expenseDate: string }>[]}
        onImport={async (rows) => {
          let success = 0;
          let fail = 0;
          for (const row of rows) {
            try {
              await api.post("/expense", row);
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
