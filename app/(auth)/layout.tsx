import React from "react";
import Link from "next/link";
import { Radio, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Ambient background glow effects */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-foreground shadow-sm group-hover:bg-primary/30 transition-all">
            <Radio className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span>Unified Platform</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-medium">
                Enterprise
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Email &amp; WhatsApp Communication Hub
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 border-t border-border/40 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between max-w-6xl w-full mx-auto gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Enterprise-Grade TLS Encryption &amp; Supabase RLS Protected</span>
        </div>
        <div className="text-[11px]">
          © {new Date().getFullYear()} Unified Platform Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
