import { Lead } from '../types/lead';
import { downloadFile } from './csv';

export function exportToJson(leads: Lead[], selectedFieldKeys: string[], filename: string) {
  const filteredData = leads.map(lead => {
    const obj: Record<string, any> = {};
    for (const key of selectedFieldKeys) {
      if (key === 'coordinates') {
        obj.latitude = lead.latitude;
        obj.longitude = lead.longitude;
      } else {
        obj[key] = lead[key as keyof Lead];
      }
    }
    return obj;
  });

  const jsonString = JSON.stringify(filteredData, null, 2);
  downloadFile(jsonString, filename, 'application/json;charset=utf-8');
}
