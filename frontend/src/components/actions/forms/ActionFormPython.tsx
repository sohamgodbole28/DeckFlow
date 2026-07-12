import { useState } from 'react';

export default function ActionFormPython({ action, onChange }: { action: any, onChange: (config: any) => void }) {
  const [config, setConfig] = useState(action.config || {});

  const updateField = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const handleBrowse = async () => {
    const path = prompt("Enter the absolute path to the Python script (.py):");
    if (path) {
      updateField('command', path);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Python Script</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={config.command || ''} 
            onChange={(e) => updateField('command', e.target.value)}
            placeholder="C:\Scripts\automation.py"
            className="flex-1 bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
          />
          <button onClick={handleBrowse} className="px-4 py-2 bg-panel border border-border rounded hover:border-primary transition-colors text-sm">
            Browse...
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Working Directory (Optional)</label>
        <input 
          type="text" 
          value={config.cwd || ''} 
          onChange={(e) => updateField('cwd', e.target.value)}
          placeholder="C:\Scripts\"
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
        />
      </div>
    </div>
  );
}
