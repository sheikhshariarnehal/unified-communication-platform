'use client';

import React from 'react';
import { Mail, MessageSquare, Plus, Clock, CheckCircle2, MoreVertical } from 'lucide-react';

export default function CampaignsPage() {
  const campaigns = [
    {
      id: '1',
      name: 'Winter Sale Launch',
      channel: 'email',
      status: 'Scheduled',
      scheduledFor: 'Today, 07:00 AM',
      audience: 'VIP Customers (5,420)',
      deliveryRate: '-',
    },
    {
      id: '2',
      name: 'New Arrivals WhatsApp Blast',
      channel: 'whatsapp',
      status: 'Scheduled',
      scheduledFor: 'Sun 8 Feb, 08:00 AM',
      audience: 'Active WhatsApp Subscribers (8,900)',
      deliveryRate: '-',
    },
    {
      id: '3',
      name: 'Black Friday Mega Deals',
      channel: 'unified',
      status: 'Completed',
      scheduledFor: 'Completed on Feb 3',
      audience: 'All Contacts (12,430)',
      deliveryRate: '98.4%',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, schedule, and track bulk communications across Email and WhatsApp.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    camp.channel === 'email'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : camp.channel === 'whatsapp'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {camp.channel === 'email' && <Mail className="w-3 h-3" />}
                  {camp.channel === 'whatsapp' && <MessageSquare className="w-3 h-3" />}
                  {camp.channel === 'unified' && (
                    <>
                      <Mail className="w-3 h-3" />
                      <MessageSquare className="w-3 h-3" />
                    </>
                  )}
                  <span className="capitalize">{camp.channel}</span>
                </span>

                <button 
                  aria-label="More options"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {camp.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Audience: {camp.audience}</p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                {camp.status === 'Scheduled' ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{camp.scheduledFor}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{camp.scheduledFor}</span>
                  </>
                )}
              </div>
              {camp.deliveryRate !== '-' && (
                <span className="font-semibold text-emerald-600">{camp.deliveryRate} delivered</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
