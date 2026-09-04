"use client";

import { useState, useEffect } from "react";
import { Tag as TagIcon, Plus, Trash2, Edit2, Check } from "lucide-react";
import { mockTags, getTags } from "@/lib/contacts/service";
import { Tag } from "@/types/database";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getTags();
      if (data && data.length > 0) setTags(data);
    }
    load();
  }, []);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const created: Tag = {
      id: `tag-${Date.now()}`,
      workspace_id: "a0000000-0000-0000-0000-000000000001",
      name: newTagName,
      color: newTagColor,
      created_at: new Date().toISOString().split("T")[0],
    };

    setTags([...tags, created]);
    setNewTagName("");
    setIsAdding(false);
  };


  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <TagIcon className="h-6 w-6 text-primary" />
            Audience Tags
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Flexible labels to categorize, tag, and filter customer cohorts.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Tag</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddTag}
          className="glass-panel p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-150"
        >
          <input
            type="text"
            required
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name (e.g. VIP, Trial, Dhaka)"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          />

          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="h-8 w-10 bg-transparent border-none cursor-pointer"
          />

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="glass-panel p-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span
                style={{ backgroundColor: tag.color }}
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10"
              />
              <span className="text-sm font-medium text-foreground">{tag.name}</span>
            </div>

            <button
              onClick={() => setTags(tags.filter((t) => t.id !== tag.id))}
              className="text-muted-foreground hover:text-rose-400 p-1 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
