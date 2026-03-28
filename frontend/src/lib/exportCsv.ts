/**
 * Utility to export data as CSV with proper UTF-8 BOM for Excel compatibility.
 */

type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => string | number;
};

export function exportCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[],
) {
  // BOM for UTF-8 so Excel reads Thai characters correctly
  const BOM = '\uFEFF';

  const headerRow = columns.map((c) => escapeCsvField(String(c.header))).join(',');

  const dataRows = data.map((row) =>
    columns.map((c) => escapeCsvField(String(c.accessor(row) ?? ''))).join(','),
  );

  const csvContent = BOM + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  // If the field contains comma, double-quote, or newline, wrap in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
