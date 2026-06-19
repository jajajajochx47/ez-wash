/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { HiOutlineDownload, HiOutlineChartBar } from "react-icons/hi";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// Blue Corporate Palette for charts
const chartColors = ["#0052CC", "#4C9AFF", "#0040A5", "#B3D4FF", "#002B70", "#00875A", "#FFAB00", "#DE350B", "#172B4D", "#5E6C84"];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [filterBranch, setFilterBranch] = useState("");
  const [incomeByBranch, setIncomeByBranch] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [incomeByMachine, setIncomeByMachine] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [monthlyIncome, setMonthlyIncome] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [expenseSummary, setExpenseSummary] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [profitSummary, setProfitSummary] = useState<{ income: number; expense: number; profit: number }>({ income: 0, expense: 0, profit: 0 });
  const [topMachines, setTopMachines] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  const params = { startDate: startDate || undefined, endDate: endDate || undefined, branchId: filterBranch || undefined };
  const isAllDateRange = !startDate && !endDate;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [brRes, ibRes, imRes, miRes, esRes, psRes, tmRes] = await Promise.all([
        api.get("/branch"), api.get("/report/income-per-branch", { params }), api.get("/report/income-per-machine", { params }),
        api.get("/report/monthly-income", { params }), api.get("/report/expense-summary", { params }),
        api.get("/report/profit-summary", { params }), api.get("/report/top-machine", { params: { ...params, limit: 10 } }),
      ]);
      setBranches(brRes.data);
      const parse = (arr: any[], nk: string, vk: string) => ({ labels: (arr || []).map((i: any) => String(i[nk] || "")), data: (arr || []).map((i: any) => Number(i[vk] || i._sum?.amount || 0)) });
      if (Array.isArray(ibRes.data)) setIncomeByBranch(parse(ibRes.data, "branchName", "totalIncome"));
      if (Array.isArray(imRes.data)) setIncomeByMachine(parse(imRes.data, "machineCode", "totalIncome"));
      if (Array.isArray(miRes.data)) setMonthlyIncome({ labels: miRes.data.map((d: any) => String(d.month || d.label || "")), data: miRes.data.map((d: any) => Number(d.totalIncome || d.total || 0)) });
      if (Array.isArray(esRes.data)) setExpenseSummary(parse(esRes.data, "categoryName", "totalExpense"));
      if (psRes.data) setProfitSummary({ income: Number(psRes.data.totalIncome || 0), expense: Number(psRes.data.totalExpense || 0), profit: Number(psRes.data.netProfit || psRes.data.profit || 0) });
      if (Array.isArray(tmRes.data)) setTopMachines(parse(tmRes.data, "machineCode", "totalIncome"));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [startDate, endDate, filterBranch]);
  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { minimumFractionDigits: 0 }).format(n);

  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "#f4f5f7" }, border: { display: false }, ticks: { color: "#5E6C84", font: { size: 11 } } }, x: { grid: { display: false }, border: { display: false }, ticks: { color: "#5E6C84", font: { size: 11 } } } },
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="page-hero flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="relative z-10">
          <p className="page-eyebrow">Analytics & Export</p>
          <h1 className="page-title flex items-center gap-2"><HiOutlineChartBar className="w-7 h-7 text-primary" /> รายงาน</h1>
          <p className="page-subtitle">วิเคราะห์ข้อมูลประสิทธิภาพของสาขา เครื่อง และภาพรวมกำไร</p>
        </div>
        <button onClick={() => {
          // Build a combined summary report
          type Row = { section: string; label: string; value: number };
          const rows: Row[] = [];

          // Profit summary
          rows.push({ section: "สรุปภาพรวม", label: "รายรับรวม", value: profitSummary.income });
          rows.push({ section: "สรุปภาพรวม", label: "รายจ่ายรวม", value: profitSummary.expense });
          rows.push({ section: "สรุปภาพรวม", label: "กำไรสุทธิ", value: profitSummary.profit });

          // Income by branch
          incomeByBranch.labels.forEach((label, i) => {
            rows.push({ section: "รายได้แต่ละสาขา", label, value: incomeByBranch.data[i] });
          });

          // Monthly income
          monthlyIncome.labels.forEach((label, i) => {
            rows.push({ section: "รายได้รายเดือน", label, value: monthlyIncome.data[i] });
          });

          // Expense summary
          expenseSummary.labels.forEach((label, i) => {
            rows.push({ section: "ค่าใช้จ่ายตามหมวดหมู่", label, value: expenseSummary.data[i] });
          });

          // Top machines
          topMachines.labels.forEach((label, i) => {
            rows.push({ section: "เครื่องทำเงินสูงสุด", label, value: topMachines.data[i] });
          });

          exportCsv("full_report", [
            { header: "หมวด", accessor: (r: Row) => r.section },
            { header: "รายการ", accessor: (r: Row) => r.label },
            { header: "จำนวนเงิน (บาท)", accessor: (r: Row) => r.value },
          ], rows);
          toast.success("ส่งออก CSV สำเร็จ");
        }} className="relative z-10 btn-primary-modern flex items-center gap-2 px-6 py-2.5 text-[13px] active:scale-[0.98] transition-all">
          <HiOutlineDownload className="w-4 h-4" /> Export Report (CSV)
        </button>
      </div>

      <div className="toolbar-panel flex flex-col sm:flex-row gap-3 p-5 items-center">
        <label className="text-[13px] font-bold text-text whitespace-nowrap hidden sm:block">ตั้งค่าตัวกรอง:</label>
        <button
          type="button"
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${
            isAllDateRange
              ? "bg-primary text-white border-primary shadow-sm"
              : "border-border bg-body/50 text-text-secondary hover:text-text hover:bg-white"
          }`}
        >
          ทั้งหมด
        </button>
        <div className="flex items-center gap-2 text-[13px] text-text-secondary w-full sm:w-auto">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
          <span className="font-medium text-text">ถึง</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="h-6 w-px bg-border hidden sm:block mx-2"></div>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-body/50 text-[13px] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20">
          <option value="">รวมทุกสาขา (All Branches)</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="soft-card p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <p className="text-[13px] font-bold text-text-secondary">รายรับรวมทั้งหมด</p>
              <h3 className="text-[32px] font-bold text-text mt-1 tracking-tight">฿{fmt(profitSummary.income)}</h3>
              <p className="text-[12px] text-primary font-medium mt-2">คำนวณจากช่วงเวลาที่เลือก</p>
            </div>
            <div className="soft-card p-6 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <p className="text-[13px] font-bold text-text-secondary">รายจ่ายรวม</p>
              <h3 className="text-[32px] font-bold text-red-600 mt-1 tracking-tight">฿{fmt(profitSummary.expense)}</h3>
              <p className="text-[12px] text-text-muted mt-2">ค่าใช้จ่ายผันแปรและคงที่</p>
            </div>
            <div className="soft-card p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
              <p className="text-[13px] font-bold text-emerald-800">กำไรสุทธิ</p>
              <h3 className="text-[32px] font-bold text-emerald-600 mt-1 tracking-tight">฿{fmt(profitSummary.profit)}</h3>
              <p className="text-[12px] text-emerald-600 font-medium mt-2">สุทธิหลังหักลบรายจ่าย</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="surface-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-bold text-text">เปรียบเทียบรายได้แต่ละสาขา</h3>
              </div>
              <div className="h-[250px]">
                <Bar data={{ labels: incomeByBranch.labels, datasets: [{ label: "บาท", data: incomeByBranch.data, backgroundColor: incomeByBranch.data.map((_, i) => i === 0 ? "#0052CC" : "#4C9AFF"), borderRadius: 4, barPercentage: 0.5 }] }} options={baseOpts as any} />
              </div>
            </div>
            
            <div className="surface-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-bold text-text">แนวโน้มรายได้รายเดือน</h3>
              </div>
              <div className="h-[250px]">
                <Line data={{ labels: monthlyIncome.labels, datasets: [{ label: "บาท", data: monthlyIncome.data, borderColor: "#0052CC", backgroundColor: "rgba(0,82,204,0.1)", fill: true, tension: 0.4, pointBackgroundColor: "#0052CC", pointBorderColor: "#fff", pointBorderWidth: 2, pointRadius: 4, borderWidth: 3 }] }} options={baseOpts as any} />
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-bold text-text">สัดส่วนค่าใช้จ่ายตามหมวดหมู่</h3>
              </div>
              <div className="h-[280px] flex items-center justify-center">
                <Pie data={{ labels: expenseSummary.labels, datasets: [{ data: expenseSummary.data, backgroundColor: chartColors, borderWidth: 3, borderColor: "#fff" }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" as const, labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 12, family: "'Inter', sans-serif" } } } } }} />
              </div>
            </div>

            <div className="surface-panel p-6 lg:row-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-bold text-text">จัดอันดับเครื่องทำเงินสูงสุด (Top 10)</h3>
              </div>
              <div className="h-[600px]">
                <Bar data={{ labels: topMachines.labels, datasets: [{ label: "บาท", data: topMachines.data, backgroundColor: "#0052CC", borderRadius: 4 }] }} options={{ ...baseOpts, indexAxis: "y" as const, maintainAspectRatio: false } as any} />
              </div>
            </div>
            
            <div className="surface-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-bold text-text">รายรับแยกตามเครื่องซัก/อบรวม</h3>
              </div>
              <div className="h-[250px]">
                <Bar data={{ labels: incomeByMachine.labels, datasets: [{ label: "บาท", data: incomeByMachine.data, backgroundColor: "#4C9AFF", borderRadius: 4, barPercentage: 0.5 }] }} options={baseOpts as any} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
