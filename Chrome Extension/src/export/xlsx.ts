import * as XLSX from 'xlsx';
import { Lead } from '../types/lead';
import { AVAILABLE_FIELDS } from './csv';

export function exportToXlsx(leads: Lead[], selectedFieldKeys: string[], filename: string) {
  const fields = AVAILABLE_FIELDS.filter(f => selectedFieldKeys.includes(f.key));

  // Map data to row objects with readable headers
  const data = leads.map(lead => {
    const row: Record<string, any> = {};
    for (const f of fields) {
      if (f.key === 'coordinates') {
        row[f.label] = lead.latitude && lead.longitude ? `${lead.latitude}, ${lead.longitude}` : '';
      } else {
        const val = lead[f.key as keyof Lead];
        row[f.label] = val !== undefined && val !== null ? val : '';
      }
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = fields.map(f => {
    const maxLen = Math.max(
      f.label.length,
      ...leads.map(lead => {
        const v = f.key === 'coordinates'
          ? (lead.latitude ? `${lead.latitude}, ${lead.longitude}` : '')
          : String(lead[f.key as keyof Lead] || '');
        return v.length;
      })
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  // Write and trigger download
  XLSX.writeFile(workbook, filename);
}
