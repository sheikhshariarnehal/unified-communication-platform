import React, { useState } from 'react';
import { FolderGit2, History, Plus, Trash2, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { Collection, CollectionHistory } from '../../types/lead';

interface CollectionsManagerProps {
  collections: Collection[];
  history: CollectionHistory[];
  onSelectCollection: (id: string) => void;
  onDeleteCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
}

function formatTitle(str?: string): string {
  if (!str) return 'Untitled Collection';
  return str
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

export const CollectionsManager: React.FC<CollectionsManagerProps> = ({
  collections,
  history,
  onSelectCollection,
  onDeleteCollection,
  onCreateCollection
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'collections' | 'history'>('collections');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="p-3.5 space-y-3.5 max-w-full bg-background animate-fade-in">
      {/* Sub tabs bar with integrated "+ New" trigger */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 flex p-1 bg-muted/50 rounded-xl border border-border">
          <button
            onClick={() => setActiveSubTab('collections')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              activeSubTab === 'collections'
                ? 'bg-card text-foreground shadow-2xs font-bold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects ({collections.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              activeSubTab === 'history'
                ? 'bg-card text-foreground shadow-2xs font-bold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {activeSubTab === 'collections' && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-2 rounded-xl bg-card border border-border hover:border-primary/60 text-foreground shadow-2xs transition-all active:scale-[0.98] shrink-0"
            title="Create New Project"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {activeSubTab === 'collections' ? (
        <div className="space-y-2.5">
          {/* Create Collection Inline Form */}
          {isCreating && (
            <form
              onSubmit={handleCreate}
              className="p-3 bg-card border border-primary/50 rounded-2xl shadow-2xs space-y-2.5 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground block">
                  New Project Name
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g. Dentists in Chittagong"
                autoFocus
                className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-semibold text-foreground"
              />
              <div className="flex justify-end pt-0.5">
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-[0.98]"
                >
                  Save Project
                </button>
              </div>
            </form>
          )}

          {/* Collection Cards */}
          {collections.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-2">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-foreground">No projects yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                Collections will be automatically created when you start collecting leads on Google Maps.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((col) => {
                const title = formatTitle(col.name);
                const hasDistinctQuery =
                  col.searchQuery &&
                  col.searchQuery.trim().toLowerCase() !== col.name.trim().toLowerCase();

                return (
                  <div
                    key={col.id}
                    className="p-3.5 bg-card border border-border rounded-2xl shadow-2xs hover:border-primary/50 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {title}
                        </h4>
                        {hasDistinctQuery && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            Query: {col.searchQuery}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${col.name}" and all its leads?`)) {
                            onDeleteCollection(col.id);
                          }
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full">
                          {col.leadCount} {col.leadCount === 1 ? 'lead' : 'leads'}
                        </span>
                        <span>{new Date(col.createdAt).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => onSelectCollection(col.id)}
                        className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-muted text-foreground border border-border font-bold flex items-center gap-1 transition-colors active:scale-[0.98]"
                        title="Inspect Leads"
                      >
                        <span>View Leads</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* History Log View */
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-2">
                <History className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-foreground">No collection history yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">
                Completed collection jobs will appear here automatically.
              </p>
            </div>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="p-3 bg-card border border-border rounded-2xl shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
                    {formatTitle(h.collectionName)}
                  </span>
                  <span className="text-[10px] font-bold text-whatsapp bg-whatsapp/10 border border-whatsapp/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {h.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Search: <span className="font-medium text-foreground">"{h.query}"</span>
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-border text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground">+{h.leadsAdded} leads added</span>
                  <span>{new Date(h.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
