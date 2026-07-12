import { useState, useEffect } from 'react';

export default function ActionFormKeyboard({ action, onChange }: { action: any, onChange: (config: any) => void }) {
  const [config, setConfig] = useState(action.config || {});
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (capturing) {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        
        // Ignore standalone modifier presses until a primary key is pressed
        const isModifierOnly = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
        if (isModifierOnly) return;
        
        let primaryKey = e.key;
        if (primaryKey === " ") primaryKey = "Space";
        
        const newConfig = {
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          alt: e.altKey,
          win: e.metaKey,
          key: primaryKey.length === 1 ? primaryKey.toUpperCase() : primaryKey
        };
        
        setConfig(newConfig);
        onChange(newConfig);
        setCapturing(false);
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [capturing, onChange]);

  const updateField = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const keys = [
    ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)),
    ...Array.from({length: 10}, (_, i) => String(i)),
    ...Array.from({length: 24}, (_, i) => `F${i + 1}`),
    'Enter', 'Escape', 'Tab', 'Space', 'Backspace', 'Delete', 'Insert', 'Home', 'End', 'PageUp', 'PageDown',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button 
          className={`flex-1 py-2 rounded font-medium border transition-colors ${capturing ? 'bg-primary text-white border-primary animate-pulse' : 'bg-panel border-border hover:border-primary text-text'}`}
          onClick={() => setCapturing(!capturing)}
        >
          {capturing ? 'Press Shortcut Now...' : 'Capture Shortcut'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Modifiers</label>
        <div className="flex gap-4">
          {['ctrl', 'shift', 'alt', 'win'].map(mod => (
            <label key={mod} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={!!config[mod]} 
                onChange={(e) => updateField(mod, e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm capitalize">{mod}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Primary Key</label>
        <select 
          value={config.key || ''} 
          onChange={(e) => updateField('key', e.target.value)}
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
        >
          <option value="">Select Key...</option>
          {keys.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
