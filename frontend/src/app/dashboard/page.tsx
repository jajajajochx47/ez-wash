/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineReceiptTax } from "react-icons/hi";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

interface DashboardData {
  incomeToday: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  activeMachines: number;
  totalMachines: number;
  pendingJobs: number;
  alerts: number;
}

interface Activity {
  time: string;
  branch: string;
  id: string;
  type: string;
  amount: number;
  status: string;
  date?: string;
}

interface MachineTypeCount {
  label: string;
  count: number;
  percent: number;
  color: string;
}

const machineTypeLabels: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
  VENDING_MACHINE: "ตู้ขายผงซักฟอก",
  OTHER: "อื่นๆ",
};

const machineTypeColors: Record<string, string> = {
  WASHER: "#0052CC",
  DRYER: "#4C9AFF",
  VENDING_MACHINE: "#FFAB00",
  OTHER: "#6B778C",
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [dailyIncome, setDailyIncome] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [machineRatios, setMachineRatios] = useState<MachineTypeCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) fetchDashboard();
  }, [isAuthenticated, authLoading]);

  const fetchDashboard = async () => {
    try {
      const [dashRes, dailyRes, actRes, usageRes] = await Promise.all([
        api.get("/report/dashboard").catch(() => ({ data: {} })),
        api.get("/report/daily-income").catch(() => ({ data: [] })),
        api.get("/report/recent-activities").catch(() => ({ data: [] })),
        api.get("/report/machine-usage").catch(() => ({ data: [] })),
      ]);
      
      const d = dashRes.data;
      setData({
        incomeToday: d.incomeToday || 0,
        totalIncome: d.totalIncome || 0,
        totalExpense: d.totalExpense || 0,
        netProfit: d.netProfit || 0,
        activeMachines: d.activeMachines || 0,
        totalMachines: d.totalMachines || 0,
        pendingJobs: d.pendingJobs || 0,
        alerts: d.alerts || 0,
      });

      if (Array.isArray(dailyRes.data)) {
        setDailyIncome({
          labels: dailyRes.data.map((d: any) => {
            const dateStr = d.date || d.incomeDate || "";
            return dateStr ? new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "";
          }),
          data: dailyRes.data.map((d: any) => Number(d.totalIncome || d.total || d.amount || 0)),
        });
      }

      if (Array.isArray(actRes.data)) {
        setActivities(actRes.data.slice(0, 5).map((a: any) => {
          const dt = new Date(a.createdAt || a.incomeDate || a.collectedAt);
          const mType = a.machine?.machineType || "OTHER";
          return {
            time: dt.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }),
            date: dt.toLocaleDateString("th-TH", { day: 'numeric', month: 'short' }),
            branch: a.branch?.name || a.machine?.branch?.name || "-",
            id: a.machine?.machineCode || "-",
            type: machineTypeLabels[mType] || "อื่นๆ",
            amount: Number(a.amount || 0),
            status: "สำเร็จ"
          };
        }));
      }

      if (Array.isArray(usageRes.data)) {
        const counts: Record<string, number> = {};
        usageRes.data.forEach((m: any) => {
          const type = m.machineType || m.machine?.machineType || "OTHER";
          counts[type] = (counts[type] || 0) + 1;
        });

        const total = usageRes.data.length || 1;
        const ratios: MachineTypeCount[] = Object.entries(counts).map(([type, count]) => ({
          label: machineTypeLabels[type] || "อื่นๆ",
          count,
          percent: Math.round((count / total) * 100),
          color: machineTypeColors[type] || "#6B778C",
        })).sort((a,b) => b.count - a.count);
        
        setMachineRatios(ratios);
      }

    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Overview</h1>
          <p className="text-sm text-text-secondary mt-1">ภาพรวมการทำงานและรายได้ของกิจการ</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-lg border border-border p-1 shadow-sm">
          {["วันนี้", "7 วัน", "30 วัน", "ปีนี้"].map((period, i) => (
            <button
              key={period}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                i === 0
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text hover:bg-body"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-text-secondary">รายได้สะสมทั้งหมด</p>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="text-lg">฿</span>
            </div>
          </div>
          <h3 className="text-[28px] font-bold text-text">฿{fmt(data?.totalIncome || 0)}</h3>
          <div className="flex items-center gap-2 mt-2 text-[13px]">
            <span className="text-accent-dark bg-accent-light px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              วันนี้: ฿{fmt(data?.incomeToday || 0)}
            </span>
          </div>
        </div>

        {/* Machine Status */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-text-secondary">เครื่องที่กำลังทำงาน</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <h3 className="text-[28px] font-bold text-text">{data?.activeMachines || 0} <span className="text-[14px] text-text-muted font-normal">/ {data?.totalMachines || 0}</span></h3>
          <div className="w-full bg-border-light h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${data?.totalMachines ? ((data.activeMachines || 0) / data.totalMachines) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-text-secondary">ค่าใช้จ่ายสะสม (Total Expenses)</p>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <HiOutlineReceiptTax className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-bold text-text">฿{fmt(data?.totalExpense || 0)}</h3>
          <div className="mt-2 text-[13px] text-text-muted">
            ยอดรวมค่าใช้จ่ายทั้งหมด
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex flex-col justify-between bg-emerald-50/20 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-emerald-600">กำไรสุทธิ (Net Profit)</p>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <HiOutlineTrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-bold text-emerald-600">฿{fmt(data?.netProfit || 0)}</h3>
          <div className="mt-2 text-[13px] text-emerald-500 font-medium">
             (รายได้ - ค่าใช้จ่าย)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-text">Trend รายได้รายสัปดาห์</h3>
          </div>
          <div className="h-[250px]">
            {dailyIncome.labels.length > 0 ? (
              <Line
                data={{
                  labels: dailyIncome.labels,
                  datasets: [
                    {
                      label: "รายได้ (บาท)",
                      data: dailyIncome.data,
                      borderColor: "#0052CC",
                      backgroundColor: "rgba(0, 82, 204, 0.1)",
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "#0052CC",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "#f4f5f7" }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">ยังไม่มีข้อมูลรายได้</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-base font-bold text-text mb-6">สัดส่วนประเภทเครื่อง</h3>
          <div className="h-[200px] relative flex justify-center mt-2">
            {machineRatios.length > 0 ? (
              <Doughnut
                data={{
                  labels: machineRatios.map(r => r.label),
                  datasets: [
                    {
                      data: machineRatios.map(r => r.count),
                      backgroundColor: machineRatios.map(r => r.color),
                      borderWidth: 0,
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "75%",
                  plugins: { legend: { display: false } },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full rounded-full border-8 border-body"></div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-[28px] font-bold text-text tracking-tight">{fmt(data?.totalMachines || 0)}</span>
              <span className="text-[12px] text-text-secondary">เครื่องทั้งหมด</span>
            </div>
          </div>
          <div className="mt-8 space-y-3 px-2">
            {machineRatios.map((ratio, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ratio.color }}></div>
                  <span className="text-text-secondary font-medium">{ratio.label}</span>
                </div>
                <span className="font-bold text-text">{ratio.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-white">
          <h3 className="text-base font-bold text-text">รายการล่าสุด (Recent Activities)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] text-text-secondary text-[12px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">วัน/เวลา</th>
                <th className="px-6 py-4 font-semibold">สาขา</th>
                <th className="px-6 py-4 font-semibold">รหัสเครื่อง</th>
                <th className="px-6 py-4 font-semibold">ประเภทเครื่อง</th>
                <th className="px-6 py-4 font-semibold text-right">ยอดเงิน</th>
                <th className="px-6 py-4 font-semibold text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {activities.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted italic">ไม่มีความเคลื่อนไหวล่าสุด</td></tr>
              ) : activities.map((act, i) => (
                <tr key={i} className="hover:bg-body/30 transition-colors">
                  <td className="px-6 py-4 text-text-secondary"><span className="text-text font-medium">{act.date}</span> <span className="text-[11px] opacity-60 ml-1">{act.time}</span></td>
                  <td className="px-6 py-4 font-medium text-text">{act.branch}</td>
                  <td className="px-6 py-4 text-primary font-medium font-mono">{act.id}</td>
                  <td className="px-6 py-4 text-text-secondary">{act.type}</td>
                  <td className="px-6 py-4 text-right font-semibold text-text">฿{fmt(act.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-accent-light text-accent-dark">
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
