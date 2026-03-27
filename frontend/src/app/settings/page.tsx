/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCog } from "react-icons/hi";

interface Branch { id: string; name: string; location?: string; }
interface Machine { id: string; machineCode: string; machineType: string; pricePerUse: number; status: string; branchId: string; branch?: Branch; }
interface ExpenseCategory { id: string; name: string; }
type SettingsTab = "branches" | "machines" | "categories";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("branches");
  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "branches", label: "ข้อมูลสาขา" },
    { key: "machines", label: "เครื่องซัก/อบ (Machines)" },
    { key: "categories", label: "หมวดหมู่ค่าใช้จ่าย" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2"><HiOutlineCog className="w-6 h-6 text-primary" /> ตั้งค่าระบบ (Settings)</h1>
        <p className="text-sm text-text-secondary mt-1">จัดการสาขา เครื่องซักผ้า และหมวดหมู่ต่างๆ ของระบบ</p>
      </div>

      <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-border shadow-sm overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[140px] px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              activeTab === tab.key ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text hover:bg-body"
            }`}>{tab.label}</button>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl p-6 border border-border shadow-sm min-h-[500px]">
        {activeTab === "branches" && <BranchesTab />}
        {activeTab === "machines" && <MachinesTab />}
        {activeTab === "categories" && <CategoriesTab />}
      </div>
    </div>
  );
}

function BranchesTab() {
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", location: "" });

  const fetchAll = async () => { try { const res = await api.get("/branch"); setItems(res.data); } catch { toast.error("โหลดไม่สำเร็จ"); } finally { setLoading(false); } };
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", location: "" }); setModalOpen(true); };
  const openEdit = (item: Branch) => { setEditing(item); setForm({ name: item.name, location: item.location || "" }); setModalOpen(true); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { if (editing) { await api.patch(`/branch/${editing.id}`, form); } else { await api.post("/branch", form); } toast.success("สำเร็จ"); setModalOpen(false); fetchAll(); } catch { toast.error("ไม่สำเร็จ"); } };
  const handleDelete = async (id: string) => { if (!confirm("ลบสาขานี้ใช่หรือไม่? ข้อมูลเครื่องและรายรับจะถูกลบไปด้วย")) return; try { await api.delete(`/branch/${id}`); toast.success("ลบสำเร็จ"); fetchAll(); } catch { toast.error("ลบไม่สำเร็จ กรุณาตรวจสอบข้อมูลที่ผูกอยู่"); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text">จัดการสาขา</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white shadow-md shadow-primary/20 text-[13px] font-semibold hover:bg-primary-dark transition-all"><HiOutlinePlus className="w-4 h-4" /> เพิ่มสาขาใหม่</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => (
          <div key={item.id} className="bg-body/30 rounded-xl p-5 border border-border hover:border-primary/40 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-text">{item.name}</h4>
                <p className="text-[13px] text-text-secondary mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {item.location || "ไม่ระบุที่ตั้ง"}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-text-muted col-span-full text-center py-12 text-[14px]">ยังไม่มีสาขาในระบบ</p>}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "แก้ไขสาขา" : "เพิ่มสาขา"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-[13px] font-bold text-text mb-1.5">ชื่อสาขา</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="เช่น สาขาลาดพร้าว 71" /></div>
          <div><label className="block text-[13px] font-bold text-text mb-1.5">ที่ตั้ง (Location)</label><input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="เช่น ปากซอยลาดพร้าว" /></div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all">{editing ? "บันทึก" : "เพิ่มสาขา"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MachinesTab() {
  const [items, setItems] = useState<Machine[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [filterBranch, setFilterBranch] = useState("");
  const [form, setForm] = useState({ machineCode: "", machineType: "WASHER", pricePerUse: "", branchId: "", status: "ACTIVE" });

  const typeInfo: Record<string, { label: string; icon: string; bg: string; border: string }> = {
    WASHER: { label: "เครื่องซักผ้า", icon: "🫧", bg: "bg-blue-50", border: "border-blue-100" },
    DRYER: { label: "เครื่องอบผ้า", icon: "🔥", bg: "bg-amber-50", border: "border-amber-100" },
    VENDING_MACHINE: { label: "ตู้ขายผงซักฟอก", icon: "🛒", bg: "bg-orange-50", border: "border-orange-100" },
    OTHER: { label: "อื่นๆ", icon: "📦", bg: "bg-gray-50", border: "border-gray-100" },
  };

  const fetchAll = async () => { 
    try { 
      const [m, b] = await Promise.all([api.get("/machine"), api.get("/branch")]); 
      let d = Array.isArray(m.data) ? m.data : []; 
      if (filterBranch) d = d.filter((x: Machine) => x.branchId === filterBranch || x.branch?.id === filterBranch); 
      setItems(d); 
      setBranches(b.data); 
    } catch { 
      toast.error("โหลดไม่สำเร็จ"); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  useEffect(() => { fetchAll(); }, [filterBranch]);

  const openAdd = () => { setEditing(null); setForm({ machineCode: "", machineType: "WASHER", pricePerUse: "", branchId: "", status: "ACTIVE" }); setModalOpen(true); };
  const openEdit = (item: Machine) => { setEditing(item); setForm({ machineCode: item.machineCode, machineType: item.machineType, pricePerUse: String(item.pricePerUse), branchId: item.branchId || item.branch?.id || "", status: item.status }); setModalOpen(true); };
  
  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      const p = { ...form, pricePerUse: Number(form.pricePerUse) }; 
      if (editing) { await api.patch(`/machine/${editing.id}`, p); } 
      else { await api.post("/machine", p); } 
      toast.success("สำเร็จ"); 
      setModalOpen(false); 
      fetchAll(); 
    } catch { 
      toast.error("ไม่สำเร็จ"); 
    } 
  };

  const handleDelete = async (id: string) => { 
    if (!confirm("ลบเครื่องนี้ใช่หรือไม่? ข้อมูลประวัติรายรับจะหายไปด้วย")) return; 
    try { 
      await api.delete(`/machine/${id}`); 
      toast.success("ลบสำเร็จ"); 
      fetchAll(); 
    } catch { 
      toast.error("ลบไม่สำเร็จ กรุณาตรวจสอบข้อมูลที่ผูกอยู่"); 
    } 
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text">จัดการเครื่องซัก/อบ และเครื่องจำหน่าย</h2>
          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-body/50 text-[13px] text-text font-medium focus:outline-none focus:bg-white focus:border-primary/50">
            <option value="">ทุกสาขา</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white shadow-md shadow-primary/20 text-[13px] font-semibold hover:bg-primary-dark transition-all">
          <HiOutlinePlus className="w-4 h-4" /> เพิ่มเครื่องใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map(item => {
          const info = typeInfo[item.machineType] || typeInfo.OTHER;
          return (
            <div key={item.id} className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${info.bg} ${info.border}`}>{info.icon}</div>
                  <div>
                    <h4 className="text-[16px] font-bold text-text">{item.machineCode}</h4>
                    <p className="text-[12px] font-medium text-text-secondary">{info.label}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} variant="machine" />
              </div>
              
              <div className="bg-body/50 p-3 rounded-lg flex items-center justify-between mb-4">
                 <div>
                   <p className="text-[11px] text-text-secondary">สาขาประจำ</p>
                   <p className="text-[13px] font-bold text-text mt-0.5">{item.branch?.name || "-"}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[11px] text-text-secondary">ราคาเริ่มต้น</p>
                   <p className="text-[14px] font-bold text-primary mt-0.5">฿{Number(item.pricePerUse).toLocaleString()}</p>
                 </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button onClick={() => openEdit(item)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-text-secondary bg-body border border-border hover:text-primary hover:border-primary/30 transition-colors">ตั้งค่าเครื่อง</button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors ml-2"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-text-muted col-span-full text-center py-12 text-[14px]">ยังไม่มีเครื่องในระบบ</p>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "แก้ไขเครื่อง" : "เพิ่มเครื่องใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[13px] font-bold text-text mb-1.5">รหัสเครื่อง (Code)</label><input type="text" value={form.machineCode} onChange={e => setForm({...form, machineCode: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="เช่น W-01" /></div>
            <div><label className="block text-[13px] font-bold text-text mb-1.5">สาขา</label><select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="">เลือกสาขา</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[13px] font-bold text-text mb-1.5">ประเภทเครื่อง</label><select value={form.machineType} onChange={e => setForm({...form, machineType: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="WASHER">เครื่องซักผ้า (Washer)</option><option value="DRYER">เครื่องอบผ้า (Dryer)</option><option value="VENDING_MACHINE">ตู้ขายผงซักฟอก (Vending Machine)</option><option value="OTHER">อื่นๆ (Other)</option></select></div>
            <div><label className="block text-[13px] font-bold text-text mb-1.5">ราคาต่อรอบ (บาท)</label><input type="number" step="0.01" value={form.pricePerUse} onChange={e => setForm({...form, pricePerUse: e.target.value})} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] font-bold focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" /></div>
          </div>
          
          {editing && (
            <div>
              <label className="block text-[13px] font-bold text-text mb-1.5">สถานะเครื่อง</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] font-bold focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="ACTIVE" className="text-emerald-600">ใช้งานปกติ (Active)</option>
                <option value="MAINTENANCE" className="text-amber-600">ซ่อมบำรุง (Maintenance)</option>
                <option value="DISABLED" className="text-red-600">ปิดใช้งาน (Disabled)</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all">{editing ? "บันทึก" : "เพิ่มเครื่อง"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CategoriesTab() {
  const [items, setItems] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState({ name: "" });

  const fetchAll = async () => { try { const res = await api.get("/expensecategory"); setItems(res.data); } catch { toast.error("โหลดไม่สำเร็จ"); } finally { setLoading(false); } };
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { if (editing) { await api.patch(`/expensecategory/${editing.id}`, form); } else { await api.post("/expensecategory", form); } toast.success("สำเร็จ"); setModalOpen(false); fetchAll(); } catch { toast.error("ไม่สำเร็จ"); } };
  const handleDelete = async (id: string) => { if (!confirm("ลบหมวดหมู่นี้ใช่หรือไม่?")) return; try { await api.delete(`/expensecategory/${id}`); toast.success("ลบสำเร็จ"); fetchAll(); } catch { toast.error("ลบไม่สำเร็จ"); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text">หมวดหมู่ค่าใช้จ่าย</h2>
        <button onClick={() => { setEditing(null); setForm({ name: "" }); setModalOpen(true); }} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white shadow-md shadow-primary/20 text-[13px] font-semibold hover:bg-primary-dark transition-all"><HiOutlinePlus className="w-4 h-4" /> เพิ่มหมวดหมู่</button>
      </div>
      
      <div className="bg-white rounded-xl border shadow-sm border-border overflow-hidden">
        <div className="divide-y divide-border">
          {items.length === 0 ? <p className="text-text-muted text-center py-12 text-[13px]">ยังไม่มีหมวดหมู่ค่าใช้จ่าย</p> : items.map(item => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-body/50 transition-colors">
              <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[14px] font-bold text-text">{item.name}</span></div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing(item); setForm({ name: item.name }); setModalOpen(true); }} className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-text-secondary bg-body border border-border hover:text-primary hover:border-primary/30 transition-colors">แก้ไข</button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-[13px] font-bold text-text mb-1.5">ชื่อหมวดหมู่</label><input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="เช่น ค่าไฟฟ้า, ค่าเช่าที่ดิน" /></div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors">ยกเลิก</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all">{editing ? "บันทึก" : "เพิ่มหมวดหมู่"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
