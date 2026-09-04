"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Users,
  Search,
  Filter,
  Trash2,
  Sparkles,
  ArrowRight,
  SendHorizontal,
} from "lucide-react";
import { mockSegments, getSegments } from "@/lib/contacts/service";
import { Segment } from "@/types/database";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(mockSegments);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSegments();
      if (data && data.length > 0) setSegments(data);
    }
    load();
  }, []);


  // New Segment Builder state
  const [segmentName, setSegmentName] = useState("");
  const [segmentDesc, setSegmentDesc] = useState("");
  const [conditions, setConditions] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([{ field: "tags", operator: "contains", value: "VIP" }]);

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { field: "country", operator: "equals", value: "United States" },
    ]);
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segmentName.trim()) return;

    const created: Segment = {
      id: `seg-${Date.now()}`,
      workspace_id: "ws-1",
      name: segmentName,
      description: segmentDesc,
      rules: {
        conditions: conditions.map((c) => ({
          field: c.field,
          operator: c.operator as any,
          value: c.value,
        })),
      },
      contact_count: Math.floor(Math.random() * 3000) + 500,
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0],
    };

    setSegments([created, ...segments]);
    setSegmentName("");
    setSegmentDesc("");
    setIsBuilderOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-primary" />
            Dynamic Audience Segments
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Automated dynamic customer segments that update continuously based on behavioral and demographic filters.
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Segment</span>
        </button>
      </div>

      {/* Segments Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {seg.name}
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {seg.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSegments(segments.filter((s) => s.id !== seg.id))
                  }
                  className="text-muted-foreground hover:text-rose-400 p-1 rounded transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Conditions representation */}
              <div className="mt-4 p-3 rounded-xl bg-card border border-border space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Filter Rules
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {seg.rules.conditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-secondary border border-border text-[11px] text-foreground/90 font-mono"
                    >
                      {cond.field} <span className="text-primary font-sans">{cond.operator}</span> {Array.isArray(cond.value) ? cond.value.join(", ") : String(cond.value)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-foreground text-base">
                  {seg.contact_count?.toLocaleString()}
                </span>
                <span className="text-muted-foreground">matching contacts</span>
              </div>

              <Link
                href="/email/campaigns/new"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary"
              >
                <span>Blast to Segment</span>
                <SendHorizontal className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Segment Rule Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <h2 className="text-sm font-semibold text-foreground">
              Create Dynamic Segment
            </h2>

            <form onSubmit={handleCreateSegment} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Segment Name
                </label>
                <input
                  type="text"
                  required
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="e.g. VIP Customers in Dhaka"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={segmentDesc}
                  onChange={(e) => setSegmentDesc(e.target.value)}
                  placeholder="Targeting VIPs with recent interaction"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Conditions List */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground/90">
                  Filter Conditions (AND)
                </label>
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={cond.field}
                      onChange={(e) => {
                        const updated = [...conditions];
                        updated[idx].field = e.target.value;
                        setConditions(updated);
                      }}
                      className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5"
                    >
                      <option value="tags">Tags</option>
                      <option value="country">Country</option>
                      <option value="status">Status</option>
                      <option value="phone">Phone</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const updated = [...conditions];
                        updated[idx].operator = e.target.value;
                        setConditions(updated);
                      }}
                      className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5"
                    >
                      <option value="equals">equals</option>
                      <option value="not_equals">not equals</option>
                      <option value="contains">contains</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => {
                        const updated = [...conditions];
                        updated[idx].value = e.target.value;
                        setConditions(updated);
                      }}
                      className="flex-1 bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5"
                    />

                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setConditions(conditions.filter((_, i) => i !== idx))
                        }
                        className="text-muted-foreground hover:text-rose-400 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="text-xs text-primary hover:text-primary font-medium pt-1 block"
                >
                  + Add Condition
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
