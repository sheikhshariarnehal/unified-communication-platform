'use client';

import React, { useState } from 'react';
import { Search, Filter, ArrowDownToLine, Plus, Tag, CheckCircle2, AlertCircle, MoreHorizontal } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Subscribed' | 'Unsubscribed' | 'Bounced';
  tags: string[];
  lastActivity: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    status: 'Subscribed',
    tags: ['VIP', 'Customer'],
    lastActivity: 'Opened Email (2 hrs ago)',
  },
  {
    id: '2',
    name: 'Michael Chang',
    email: 'm.chang@enterprise.io',
    phone: '+1 (555) 876-5432',
    status: 'Subscribed',
    tags: ['Lead', 'Webinar'],
    lastActivity: 'WhatsApp Read (Yesterday)',
  },
  {
    id: '3',
    name: 'Emma Watson',
    email: 'emma.w@creative.co',
    phone: '+44 7700 900077',
    status: 'Subscribed',
    tags: ['VIP', 'High Value'],
    lastActivity: 'Clicked Offer (3 days ago)',
  },
  {
    id: '4',
    name: 'David Miller',
    email: 'david.m@outlook.com',
    phone: '+1 (555) 345-6789',
    status: 'Bounced',
    tags: ['Newsletter'],
    lastActivity: 'Hard Bounce (5 days ago)',
  },
  {
    id: '5',
    name: 'Amina Rahman',
    email: 'amina.r@globaltech.bd',
    phone: '+880 1711 000000',
    status: 'Subscribed',
    tags: ['Customer', 'Dhaka'],
    lastActivity: 'Replied WhatsApp (1 hr ago)',
  },
];

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audience & Contacts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your unified contact database across Email and WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel hover:bg-white text-xs font-semibold text-slate-700 shadow-xs transition-all">
            <ArrowDownToLine className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all">
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/70 border border-slate-200/70 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-xs font-medium text-slate-600">
            <Tag className="w-3.5 h-3.5" />
            <span>Tags</span>
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Tags</th>
                <th className="py-3.5 px-5">Recent Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/40">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div>
                      <span className="font-semibold text-slate-900 block">{contact.name}</span>
                      <span className="text-slate-400 text-[11px]">{contact.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600">
                    {contact.phone}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        contact.status === 'Subscribed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                      }`}
                    >
                      {contact.status === 'Subscribed' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                      )}
                      {contact.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                    {contact.lastActivity}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      aria-label="Actions"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
