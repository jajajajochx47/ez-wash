/**
 * Parse a CSV string into an array of objects using the header row as keys.
 * Handles quoted fields, BOM, and mixed line endings.
 */
export function parseCsv(csvText: string): Record<string, string>[] {
  // Strip BOM
  const text = csvText.replace(/^\uFEFF/, '');

  const rows = splitCsvRows(text);
  if (rows.length < 2) return [];

  const headers = parseCsvLine(rows[0]).map((h) => h.trim());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const line = rows[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = (values[idx] ?? '').trim();
    });
    result.push(obj);
  }

  return result;
}

function splitCsvRows(text: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      rows.push(current);
      current = '';
      if (ch === '\r' && text[i + 1] === '\n') i++; // skip \r\n
    } else {
      current += ch;
    }
  }
  if (current.trim()) rows.push(current);
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
