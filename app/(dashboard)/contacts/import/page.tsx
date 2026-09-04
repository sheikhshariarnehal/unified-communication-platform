"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
  RefreshCw,
  Layers,
  FileDown,
} from "lucide-react";

export default function ContactImportWizardPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Column mapping state
  const [mappings, setMappings] = useState({
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email Address",
    phone: "WhatsApp Mobile",
    company: "Company Name",
    country: "Country",
  });

  const handleFileDrop = (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setFileName("customer_leads_q3_2026.csv");
    setStep(2);
  };

  const handleStartImport = () => {
    setStep(4);
    setIsImporting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsImporting(false);
      }
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Wizard Header */}
      <div>
        <Link
          href="/contacts"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Contacts
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Import Audience Contacts
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Upload customer lists from CSV or Excel with automated field mapping and instant deduplication.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: "1. Upload File" },
          { num: 2, title: "2. Map Columns" },
          { num: 3, title: "3. Validation" },
          { num: 4, title: "4. Execution" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
              step === s.num
                ? "bg-primary/20 border-primary/40 text-primary shadow-sm"
                : step > s.num
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-secondary/60 border-border text-muted-foreground"
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Step 1: Upload File */}
      {step === 1 && (
        <div className="glass-panel p-8 rounded-2xl space-y-6 text-center">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-12 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-card/30"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Drag and drop your CSV or Excel file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv, .xlsx up to 50MB (1,000,000+ contacts)
              </p>
            </div>
            <label className="mt-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-md shadow-primary/20">
              Browse Files
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileDrop}
              />
            </label>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
            <span>Need a formatted sample template?</span>
            <button
              onClick={() => {
                const sample =
                  "First Name,Last Name,Email,Phone,Company,Country\nJohn,Doe,john@example.com,+15551234567,Acme Inc,United States\n";
                const blob = new Blob([sample], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "contacts_template.csv";
                a.click();
              }}
              className="text-primary hover:text-primary flex items-center gap-1 font-medium"
            >
              <FileDown className="h-3.5 w-3.5" /> Download CSV Template
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 2 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Column Mapping
              </h2>
              <p className="text-xs text-muted-foreground">
                Matched columns from <strong className="text-foreground">{fileName}</strong> to Unified Platform fields.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              6 Columns Detected
            </span>
          </div>

          <div className="space-y-3">
            {[
              { field: "First Name", key: "first_name", req: false },
              { field: "Last Name", key: "last_name", req: false },
              { field: "Email Address", key: "email", req: true },
              { field: "WhatsApp Mobile (E.164)", key: "phone", req: true },
              { field: "Company", key: "company", req: false },
              { field: "Country", key: "country", req: false },
            ].map((col) => (
              <div
                key={col.key}
                className="p-3 rounded-xl bg-secondary/60 border border-border flex items-center justify-between gap-4"
              >
                <div className="w-1/3">
                  <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    {col.field}
                    {col.req && (
                      <span className="text-[10px] text-amber-400 font-normal">
                        *required (email or phone)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-muted-foreground text-xs">→</div>

                <div className="w-1/2">
                  <select
                    value={mappings[col.key as keyof typeof mappings]}
                    onChange={(e) =>
                      setMappings({ ...mappings, [col.key]: e.target.value })
                    }
                    className="w-full bg-background border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                  >
                    <option value={mappings[col.key as keyof typeof mappings]}>
                      {mappings[col.key as keyof typeof mappings]} (Matched)
                    </option>
                    <option value="ignore">-- Do Not Import --</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
            >
              <span>Validate Records</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Validation Summary (PRD Section 17) */}
      {step === 3 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Validation & Quality Pre-Check
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Automated duplicate detection and formatting validation report.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground">Total Rows</span>
              <div className="text-2xl font-bold text-foreground mt-1">10,000</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-xs text-emerald-400">Valid & Clean</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">9,620</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <span className="text-xs text-amber-400">Duplicates Skipped</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">280</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-xs text-rose-400">Invalid Rows</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">100</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-foreground/90">
                100 rows had invalid phone or email syntax
              </span>
              <button className="text-primary hover:text-primary font-medium flex items-center gap-1">
                <Download className="h-3 w-3" /> Download Error Log CSV
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Invalid rows will be excluded from the database to preserve your sender domain reputation.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleStartImport}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold shadow-md shadow-emerald-600/25"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Proceed to Import 9,620 Contacts</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Execution Progress */}
      {step === 4 && (
        <div className="glass-panel p-8 rounded-2xl space-y-6 text-center">
          {isImporting ? (
            <div className="space-y-4 max-w-md mx-auto py-8">
              <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">
                Importing Contacts to Workspace...
              </h2>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Processed {Math.round((importProgress / 100) * 9620)} of 9,620 rows
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto py-6">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Import Completed Successfully!
              </h2>
              <p className="text-xs text-muted-foreground">
                <strong>9,620</strong> contacts have been imported and synchronized with your workspace directory.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <Link
                  href="/contacts"
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium"
                >
                  View Contacts Table
                </Link>
                <Link
                  href="/email/campaigns/new"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
                >
                  Launch Campaign
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
