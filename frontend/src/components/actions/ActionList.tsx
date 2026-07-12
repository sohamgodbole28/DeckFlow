import { useState, useEffect } from 'react';
import { GripVertical, Trash2, Copy, Check } from 'lucide-react';
import { ACTION_REGISTRY } from './ActionRegistry';

interface ActionListProps {
  actions: any[];
  onChange: (actions: any[]) => void;
  onEdit: (index: number) => void;
  activeEditIndex: number | null;
}

export default function ActionList({ actions, onChange, onEdit, activeEditIndex }: ActionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localActions, setLocalActions] = useState<any[]>(actions);

  // Sync local actions when props change
  useEffect(() => {
    setLocalActions(actions);
  }, [actions]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Simple swap
    const newActions = [...localActions];
    const item = newActions.splice(draggedIndex, 1)[0];
    newActions.splice(index, 0, item);
    
    // Update order indices
    newActions.forEach((a, i) => a.order_index = i);
    
    setDraggedIndex(index);
    setLocalActions(newActions);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onChange(localActions);
  };

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this action?")) {
      const newActions = [...localActions];
      newActions.splice(index, 1);
      // Update order indices
      newActions.forEach((a, i) => a.order_index = i);
      onChange(newActions);
    }
  };

  const handleDuplicate = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const actionToDup = localActions[index];
    const newAction = JSON.parse(JSON.stringify(actionToDup)); // Deep copy config
    delete newAction.id; // Remove DB id so it creates a new one
    
    const newActions = [...localActions];
    newActions.splice(index + 1, 0, newAction);
    newActions.forEach((a, i) => a.order_index = i);
    onChange(newActions);
  };

  const generateSummary = (action: any, meta: any) => {
    if (!action || !action.config) return "No configuration";
    
    const c = action.config;
    if (action.type === 'KEYBOARD_SHORTCUT') {
      const mods = [];
      if (c.ctrl) mods.push('Ctrl');
      if (c.shift) mods.push('Shift');
      if (c.alt) mods.push('Alt');
      if (c.win) mods.push('Win');
      if (c.key) mods.push(c.key);
      return mods.join(' + ') || "Unconfigured";
    }
    if (action.type === 'DELAY') return `${c.duration_ms || 0} ms`;
    if (c.target) return c.target.split('\\').pop()?.split('/').pop() || c.target;
    if (c.command) return c.command.split('\\').pop() || c.command;
    return meta?.description || "Action configured";
  };

  if (!localActions || localActions.length === 0) {
    return (
      <div className="text-sm text-textMuted text-center py-6 border border-dashed border-border rounded-lg">
        No actions configured.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {localActions.map((action, index) => {
        const meta = ACTION_REGISTRY.find(m => m.id === action.type);
        const isEditing = activeEditIndex === index;
        const Icon = meta?.icon || Check;

        return (
          <div 
            key={`${action.id || 'new'}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onEdit(isEditing ? -1 : index)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${isEditing ? 'bg-primary/5 border-primary shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-background border-border hover:border-textMuted'} ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="text-textMuted cursor-grab active:cursor-grabbing hover:text-white transition-colors" onPointerDown={e => e.stopPropagation()}>
              <GripVertical size={16} />
            </div>
            
            <div className={`p-2 rounded bg-panel border border-border shrink-0 ${isEditing ? 'text-primary border-primary/30' : 'text-textMuted'}`}>
              <Icon size={16} />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-sm truncate">{meta?.label || action.type}</span>
              <span className="text-xs text-textMuted truncate">{generateSummary(action, meta)}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={(e) => handleDuplicate(index, e)} className="p-1.5 rounded hover:bg-panel text-textMuted hover:text-white transition-colors" title="Duplicate">
                <Copy size={14} />
              </button>
              <button onClick={(e) => handleDelete(index, e)} className="p-1.5 rounded hover:bg-red-500/20 text-textMuted hover:text-red-500 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
