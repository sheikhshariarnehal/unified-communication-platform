import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Unified - Email & WhatsApp Communication Platform',
  description: 'One audience. Two channels. One centralized premium communication platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#070a13] text-slate-100 relative selection:bg-blue-500 selection:text-white">
        {/* Ambient Dark Nebula Backdrop */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Deep dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070a13] via-[#0b1020] to-[#070a13]" />
          
          {/* Subtle luminous neon orbs */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
          <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] rounded-full bg-indigo-600/10 blur-[150px]" />
          <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-cyan-500/8 blur-[160px]" />
          
          {/* Subtle grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }} 
          />
        </div>

        {/* App Frame */}
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
