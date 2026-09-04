import React, { useState } from 'react';
import { FolderGit2, History, Plus, Trash2, ArrowRight, CheckCircle2, Calendar, Search } from 'lucide-react';
import { Collection, CollectionHistory } from '../../types/lead';

interface CollectionsManagerProps {
  collections: Collection[];
  history: CollectionHistory[];
  onSelectCollection: (id: string) => void;
  onDeleteCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
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
    <div className="p-4 space-y-4 max-w-full">
      {/* Sub tabs: Collections / History */}
      <div className="flex p-1 bg-slate-200/70 rounded-xl">
        <button
          onClick={() => setActiveSubTab('collections')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'collections'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({collections.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'history'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({history.length})</span>
        </button>
      </div>

      {activeSubTab === 'collections' ? (
        <div className="space-y-3">
          {/* Create Collection Bar */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-3 bg-white border border-blue-200 rounded-xl shadow-xs space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-slate-700 block">New Collection Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g. Dentists in Chittagong"
                autoFocus
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Project
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center space-x-1.5 transition-colors bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Collection</span>
            </button>
          )}

          {/* Collection Cards */}
          {collections.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No collections yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Collections will be automatically created when you start collecting on Google Maps.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:border-blue-300 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {col.name}
                    </h4>
                    {col.searchQuery && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Query: {col.searchQuery}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {col.leadCount} {col.leadCount === 1 ? 'lead' : 'leads'}
                      </span>
                      <span>{new Date(col.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => onSelectCollection(col.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="View Leads in Database"
                    >
                      <span>Leads</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete collection "${col.name}" and all its leads?`)) {
                          onDeleteCollection(col.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* History Log View */
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
                <History className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No collection history yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Completed collection jobs will appear here.
              </p>
            </div>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                    {h.collectionName}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {h.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Search: <span className="font-medium text-slate-700">"{h.query}"</span>
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-600">+{h.leadsAdded} leads collected</span>
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
