import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Code2, CheckSquare, Square } from 'lucide-react';
import { Lead } from '../../types/lead';
import { AVAILABLE_FIELDS, generateCsv, downloadFile } from '../../export/csv';
import { exportToXlsx } from '../../export/xlsx';
import { exportToJson } from '../../export/json';

interface ExportModalProps {
  leads: Lead[];
  selectedLeadIds: string[];
  collectionName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export type ExportFormat = 'csv' | 'xlsx' | 'json';

export const ExportModal: React.FC<ExportModalProps> = ({
  leads,
  selectedLeadIds,
  collectionName,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [useSelectedOnly, setUseSelectedOnly] = useState(selectedLeadIds.length > 0);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    AVAILABLE_FIELDS.map(f => f.key)
  );
  const [filename, setFilename] = useState(
    `leadmap-${(collectionName || 'leads').toLowerCase().replace(/[^a-z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}`
  );
  const [isExporting, setIsExporting] = useState(false);

  // Determine export list
  const leadsToExport = useSelectedOnly && selectedLeadIds.length > 0
    ? leads.filter(l => selectedLeadIds.includes(l.id))
    : leads;

  const toggleField = (key: string) => {
    if (selectedFields.includes(key)) {
      if (selectedFields.length > 1) {
        setSelectedFields(selectedFields.filter(k => k !== key));
      }
    } else {
      setSelectedFields([...selectedFields, key]);
    }
  };

  const toggleAllFields = () => {
    if (selectedFields.length === AVAILABLE_FIELDS.length) {
      setSelectedFields(['businessName', 'phone', 'address']);
    } else {
      setSelectedFields(AVAILABLE_FIELDS.map(f => f.key));
    }
  };

  const handleExport = () => {
    if (leadsToExport.length === 0) return;
    setIsExporting(true);

    try {
      const cleanFilename = filename.trim() || 'leadmap-export';

      if (format === 'csv') {
        const csvContent = generateCsv(leadsToExport, selectedFields);
        downloadFile(csvContent, `${cleanFilename}.csv`, 'text/csv;charset=utf-8;');
      } else if (format === 'xlsx') {
        exportToXlsx(leadsToExport, selectedFields, `${cleanFilename}.xlsx`);
      } else if (format === 'json') {
        exportToJson(leadsToExport, selectedFields, `${cleanFilename}.json`);
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Export Leads</h2>
              <p className="text-[11px] text-slate-400">
                {leadsToExport.length} {leadsToExport.length === 1 ? 'lead' : 'leads'} ready for export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Export Scope */}
          {selectedLeadIds.length > 0 && (
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
              <span className="font-semibold text-blue-900 text-xs block">Export Scope</span>
              <div className="flex gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={useSelectedOnly}
                    onChange={() => setUseSelectedOnly(true)}
                    className="text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">
                    Selected Only ({selectedLeadIds.length})
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={!useSelectedOnly}
                    onChange={() => setUseSelectedOnly(false)}
                    className="text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">
                    All Leads ({leads.length})
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Format Picker */}
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-2">
              Select Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-bold text-xs">CSV</span>
                <span className="text-[10px] text-slate-400">Excel / Sheets</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-bold text-xs">Excel (XLSX)</span>
                <span className="text-[10px] text-slate-400">Native Workbook</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <Code2 className="w-5 h-5" />
                <span className="font-bold text-xs">JSON</span>
                <span className="text-[10px] text-slate-400">Developers / API</span>
              </button>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">
              File Name
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
            />
          </div>

          {/* Fields Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 text-xs">
                Fields to Include ({selectedFields.length})
              </label>
              <button
                type="button"
                onClick={toggleAllFields}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                {selectedFields.length === AVAILABLE_FIELDS.length ? 'Reset to Min' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 max-h-40 overflow-y-auto">
              {AVAILABLE_FIELDS.map((field) => {
                const isSelected = selectedFields.includes(field.key);
                return (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => toggleField(field.key)}
                    className="flex items-center space-x-2 text-left hover:bg-white p-1.5 rounded transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="text-[11px] font-medium text-slate-700 truncate">
                      {field.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || leadsToExport.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition-all active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : `Export ${leadsToExport.length} Leads`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
