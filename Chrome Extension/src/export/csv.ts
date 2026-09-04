import { Lead } from '../types/lead';

export interface ExportFieldDefinition {
  key: keyof Lead | 'coordinates';
  label: string;
}

export const AVAILABLE_FIELDS: ExportFieldDefinition[] = [
  { key: 'businessName', label: 'Business Name' },
  { key: 'category', label: 'Category' },
  { key: 'phone', label: 'Phone' },
  { key: 'normalizedPhone', label: 'Normalized Phone' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviewCount', label: 'Reviews' },
  { key: 'address', label: 'Address' },
  { key: 'website', label: 'Website' },
  { key: 'businessStatus', label: 'Status' },
  { key: 'mapsUrl', label: 'Maps URL' },
  { key: 'coordinates', label: 'Coordinates' },
  { key: 'searchQuery', label: 'Search Query' },
  { key: 'collectedAt', label: 'Collected Date' }
];

function escapeCsvValue(val: any): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(leads: Lead[], selectedFieldKeys: string[]): string {
  const fields = AVAILABLE_FIELDS.filter(f => selectedFieldKeys.includes(f.key));
  
  // Headers
  const headerRow = fields.map(f => escapeCsvValue(f.label)).join(',');
  
  // Rows
  const rows = leads.map(lead => {
    return fields.map(f => {
      if (f.key === 'coordinates') {
        const coords = lead.latitude && lead.longitude ? `${lead.latitude}, ${lead.longitude}` : '';
        return escapeCsvValue(coords);
      }
      return escapeCsvValue(lead[f.key as keyof Lead]);
    }).join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) for Excel unicode compatibility
  return '\uFEFF' + [headerRow, ...rows].join('\r\n');
}

export function downloadFile(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
