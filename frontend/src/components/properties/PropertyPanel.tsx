import { useState, useEffect } from 'react';
import { Settings, MousePointerClick, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import ActionList from '../actions/ActionList';
import ActionLibraryModal from '../actions/ActionLibraryModal';
import { ACTION_REGISTRY } from '../actions/ActionRegistry';
import type { ActionMetadata } from '../actions/ActionRegistry';

interface PropertyPanelProps {
  button: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  actions: any[];
  onActionsChange: (newActions: any[]) => void;
  onAddAction: (meta: ActionMetadata) => void;
  onUpdateActionConfig: (index: number, newConfig: any) => void;
}

export default function PropertyPanel({ 
  button, 
  onUpdate, 
  onDelete,
  actions,
  onActionsChange,
  onAddAction,
  onUpdateActionConfig
}: PropertyPanelProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  // Local state for General properties to prevent API spam on every keystroke
  const [localLabel, setLocalLabel] = useState(button?.label || '');
  const [localEmoji, setLocalEmoji] = useState(button?.emoji || '');

  useEffect(() => {
    if (button) {
      setActiveEditIndex(null);
      setLocalLabel(button.label || '');
      setLocalEmoji(button.emoji || '');
    }
  }, [button?.id]);

  const handleAddAction = (meta: ActionMetadata) => {
    setShowLibrary(false);
    onAddAction(meta);
  };

  if (!button) {
    return (
      <div className="flex-1 flex items-center justify-center text-textMuted text-sm p-8 text-center">
        Select a button on the grid to edit its properties.
      </div>
    );
  }

  const activeAction = activeEditIndex !== null ? actions[activeEditIndex] : null;
  const ActiveFormComponent = activeAction ? ACTION_REGISTRY.find(m => m.id === activeAction.type)?.component : null;

  return (
    <div className="flex flex-col h-full bg-panel">
      <div className="p-4 border-b border-border bg-background shrink-0">
        <h2 className="font-bold text-lg flex items-center gap-2"><Settings size={20} className="text-primary"/> Properties</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-24">
        
        {/* GENERAL SECTION */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
            <Settings size={14} /> General
          </h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-textMuted">Label</label>
            <input 
              type="text" 
              value={localLabel} 
              onChange={(e) => setLocalLabel(e.target.value)}
              onBlur={() => onUpdate({ label: localLabel })}
              onKeyDown={(e) => e.key === 'Enter' && onUpdate({ label: localLabel })}
              placeholder="e.g., Mute Discord"
              className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-textMuted">Emoji</label>
            <input 
              type="text" 
              value={localEmoji} 
              onChange={(e) => setLocalEmoji(e.target.value)}
              onBlur={() => onUpdate({ emoji: localEmoji })}
              onKeyDown={(e) => e.key === 'Enter' && onUpdate({ emoji: localEmoji })}
              placeholder="e.g., 🎙️"
              className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none text-xl"
            />
          </div>
        </div>

        {/* APPEARANCE SECTION */}
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={14} /> Appearance
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-textMuted">Bg Color</label>
              <input 
                type="color" 
                value={button.background_color || '#27272a'} 
                onChange={(e) => onUpdate({ background_color: e.target.value })}
                className="w-full h-10 rounded border border-border cursor-pointer bg-background"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-textMuted">Text Color</label>
              <input 
                type="color" 
                value={button.text_color || '#ffffff'} 
                onChange={(e) => onUpdate({ text_color: e.target.value })}
                className="w-full h-10 rounded border border-border cursor-pointer bg-background"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <MousePointerClick size={14} /> Actions
            </h3>
            <button 
              onClick={() => setShowLibrary(true)}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors font-bold"
            >
              + ADD
            </button>
          </div>

          <ActionList 
            actions={actions} 
            onChange={onActionsChange} 
            onEdit={(idx) => setActiveEditIndex(idx)}
            activeEditIndex={activeEditIndex}
          />

          {/* Configuration Form for Active Action */}
          {activeAction && ActiveFormComponent && (
            <div className="mt-2 p-4 bg-background border border-border rounded-xl shadow-inner relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                Configure {ACTION_REGISTRY.find(m => m.id === activeAction.type)?.label}
              </h4>
              
              <div className="flex-1">
                <ActiveFormComponent 
                  action={activeAction} 
                  onChange={(newConfig: any) => onUpdateActionConfig(activeEditIndex!, newConfig)} 
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border">
                <button 
                  onClick={() => setActiveEditIndex(null)}
                  className="px-4 py-2 bg-panel border border-border text-text rounded hover:bg-background transition-colors text-sm font-medium"
                >
                  Close Editor
                </button>
              </div>
            </div>
          )}
          
          {activeAction && !ActiveFormComponent && (
            <div className="mt-2 p-4 bg-background border border-border rounded-xl text-sm text-textMuted italic text-center">
              No configuration required for this action.
            </div>
          )}
        </div>

        {/* ADVANCED SECTION */}
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={14} /> Advanced
          </h3>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-background transition-colors">
              <input 
                type="checkbox" 
                checked={!!button.requires_confirmation} 
                onChange={(e) => onUpdate({ requires_confirmation: e.target.checked })}
                className="accent-primary w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Require Confirmation</span>
                <span className="text-xs text-textMuted">Ask before executing actions</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-background transition-colors">
              <input 
                type="checkbox" 
                checked={button.is_enabled !== false} 
                onChange={(e) => onUpdate({ is_enabled: e.target.checked })}
                className="accent-primary w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Button Enabled</span>
                <span className="text-xs text-textMuted">Allow button to be pressed</span>
              </div>
            </label>
          </div>
          
          <button 
            onClick={onDelete}
            className="w-full mt-2 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-bold text-sm"
          >
            Delete Button
          </button>
        </div>

      </div>

      {showLibrary && (
        <ActionLibraryModal 
          onClose={() => setShowLibrary(false)} 
          onSelectAction={handleAddAction}
        />
      )}
    </div>
  );
}
