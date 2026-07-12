import { useState, useMemo } from 'react';
import { X, Search, Zap } from 'lucide-react';
import { ACTION_REGISTRY, ACTION_CATEGORIES } from './ActionRegistry';
import type { ActionMetadata } from './ActionRegistry';

interface Props {
  onClose: () => void;
  onSelectAction: (action: ActionMetadata) => void;
}

export default function ActionLibraryModal({ onClose, onSelectAction }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredActions = useMemo(() => {
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      return ACTION_REGISTRY.filter(a => 
        a.label.toLowerCase().includes(lowerQ) ||
        a.description.toLowerCase().includes(lowerQ) ||
        a.category.toLowerCase().includes(lowerQ) ||
        a.keywords.some(k => k.toLowerCase().includes(lowerQ))
      );
    }
    
    if (selectedCategory) {
      if (selectedCategory === 'Quick Actions') {
        return ACTION_REGISTRY.filter(a => a.isQuickAction);
      }
      return ACTION_REGISTRY.filter(a => a.category === selectedCategory);
    }
    
    // Default: Show all Quick Actions if no search and no category selected
    return ACTION_REGISTRY.filter(a => a.isQuickAction);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panel w-full max-w-4xl h-[80vh] rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-border bg-background flex flex-col gap-4 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Action Library</h2>
            <button onClick={onClose} className="p-2 rounded hover:bg-border/50 text-textMuted transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
            <input 
              type="text" 
              placeholder="Search actions, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-border rounded-lg pl-10 pr-4 py-3 focus:border-primary focus:outline-none transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-48 sm:w-64 border-r border-border bg-panel overflow-y-auto shrink-0 flex flex-col p-2 gap-1">
            <button 
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
              className={`text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${!selectedCategory && !searchQuery ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-text'}`}
            >
              <Zap size={16} /> Quick Actions
            </button>
            <div className="h-px bg-border my-2 mx-2" />
            {ACTION_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat && !searchQuery ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-text'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Action Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
            {searchQuery && (
              <h3 className="text-sm font-bold text-textMuted mb-4 uppercase tracking-wider">Search Results</h3>
            )}
            {!searchQuery && selectedCategory && (
              <h3 className="text-sm font-bold text-textMuted mb-4 uppercase tracking-wider">{selectedCategory}</h3>
            )}
            {!searchQuery && !selectedCategory && (
              <h3 className="text-sm font-bold text-textMuted mb-4 uppercase tracking-wider">Quick Actions</h3>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActions.map(action => (
                <button 
                  key={action.id}
                  onClick={() => onSelectAction(action)}
                  className="bg-panel border border-border p-4 rounded-xl flex items-start gap-4 hover:border-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all text-left group"
                >
                  <div className="p-3 bg-background rounded-lg border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <action.icon size={24} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold mb-1 truncate">{action.label}</span>
                    <span className="text-xs text-textMuted leading-relaxed line-clamp-2">{action.description}</span>
                  </div>
                </button>
              ))}
              {filteredActions.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-textMuted border-2 border-dashed border-border rounded-xl">
                  <Search size={32} className="mb-4 opacity-50" />
                  <p>No actions found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
