/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { parseCsv } from "@/lib/parseCsv";
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineX, HiOutlineCheck, HiOutlineExclamationCircle } from "react-icons/hi";

export type ColumnMapping<T> = {
  /** The key in the final payload */
  field: keyof T;
  /** Display label shown in the preview table */
  label: string;
  /** Possible CSV header names that map to this field (case-insensitive) */
  csvHeaders: string[];
  /** If true, the field is required and rows without it will be flagged */
  required?: boolean;
  /** Transform the raw CSV string value into the final payload value */
  transform?: (value: string) => any;
};

type Props<T> = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Column mapping config */
  columns: ColumnMapping<T>[];
  /** Called with the parsed and valid rows when user confirms */
  onImport: (rows: T[]) => Promise<void>;
  /** Template headers for a downloadable sample CSV */
  templateHeaders?: string[];
};

export default function CsvImportModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  columns,
  onImport,
  templateHeaders,
}: Props<T>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mappedRows, setMappedRows] = useState<{ data: Partial<T>; errors: string[] }[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const reset = () => {
    setFileName("");
    setRawRows([]);
    setMappedRows([]);
    setStep("upload");
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      setRawRows(parsed);

      // Map CSV rows to target fields
      const mapped = parsed.map((row) => {
        const data: Record<string, any> = {};
        const errors: string[] = [];

        const csvKeys = Object.keys(row);

        columns.forEach((col) => {
          // Find the matching CSV header (case-insensitive)
          const matchedKey = csvKeys.find((k) =>
            col.csvHeaders.some((h) => h.toLowerCase() === k.toLowerCase()),
          );

          const rawValue = matchedKey ? row[matchedKey] : "";

          if (!rawValue && col.required) {
            errors.push(`${col.label} ไม่พบข้อมูล`);
          }

          if (rawValue) {
            data[col.field as string] = col.transform
              ? col.transform(rawValue)
              : rawValue;
          }
        });

        return { data: data as Partial<T>, errors };
      });

      setMappedRows(mapped);
      setStep("preview");
    };
    reader.readAsText(file, "utf-8");
  };

  const validRows = mappedRows.filter((r) => r.errors.length === 0);
  const errorRows = mappedRows.filter((r) => r.errors.length > 0);

  const handleImport = async () => {
    setImporting(true);
    try {
      await onImport(validRows.map((r) => r.data as T));
      handleClose();
    } catch {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    if (!templateHeaders) return;
    const BOM = "\uFEFF";
    const csv = BOM + templateHeaders.join(",") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {step === "upload" && (
        <div className="space-y-5">
          {/* Drop zone */}
          <label
            htmlFor="csv-upload"
            className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <HiOutlineUpload className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold text-text">คลิกเพื่อเลือกไฟล์ CSV</p>
              <p className="text-[12px] text-text-muted mt-1">รองรับไฟล์ .csv เท่านั้น</p>
            </div>
            <input
              ref={fileRef}
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
            />
          </label>

          {/* Template download */}
          {templateHeaders && (
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-[13px] text-primary font-medium hover:underline mx-auto"
            >
              <HiOutlineDocumentText className="w-4 h-4" />
              ดาวน์โหลดตัวอย่างไฟล์ CSV
            </button>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 bg-body rounded-xl border border-border">
            <HiOutlineDocumentText className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-text truncate">{fileName}</p>
              <p className="text-[12px] text-text-muted">{rawRows.length} แถว</p>
            </div>
            <button onClick={reset} className="p-1 rounded hover:bg-border transition-colors">
              <HiOutlineX className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Summary badges */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[12px] font-bold">
              <HiOutlineCheck className="w-4 h-4" />
              พร้อมนำเข้า: {validRows.length} แถว
            </div>
            {errorRows.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[12px] font-bold">
                <HiOutlineExclamationCircle className="w-4 h-4" />
                มีปัญหา: {errorRows.length} แถว
              </div>
            )}
          </div>

          {/* Preview table */}
          <div className="max-h-[300px] overflow-auto border border-border rounded-xl">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f8f9fa] sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-text-secondary font-semibold text-[11px]">#</th>
                  {columns.map((col) => (
                    <th key={String(col.field)} className="px-3 py-2 text-left text-text-secondary font-semibold text-[11px]">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-text-secondary font-semibold text-[11px]">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mappedRows.slice(0, 50).map((row, i) => (
                  <tr key={i} className={row.errors.length > 0 ? "bg-red-50/50" : ""}>
                    <td className="px-3 py-2 text-text-muted">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={String(col.field)} className="px-3 py-2 text-text max-w-[150px] truncate">
                        {String(row.data[col.field] ?? "-")}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {row.errors.length > 0 ? (
                        <span className="text-red-500 text-[11px]" title={row.errors.join(", ")}>
                          <HiOutlineExclamationCircle className="w-4 h-4 inline" /> {row.errors[0]}
                        </span>
                      ) : (
                        <span className="text-emerald-600"><HiOutlineCheck className="w-4 h-4 inline" /></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mappedRows.length > 50 && (
            <p className="text-[12px] text-text-muted text-center">แสดง 50 แถวแรก จากทั้งหมด {mappedRows.length} แถว</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-[13px] font-bold hover:bg-body transition-colors"
            >
              เลือกไฟล์ใหม่
            </button>
            <button
              onClick={handleImport}
              disabled={validRows.length === 0 || importing}
              className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลังนำเข้า...
                </>
              ) : (
                <>
                  <HiOutlineUpload className="w-4 h-4" />
                  นำเข้า {validRows.length} รายการ
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
