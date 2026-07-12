import { useState } from 'react';

export default function ActionFormDelay({ action, onChange }: { action: any, onChange: (config: any) => void }) {
  const [config, setConfig] = useState(action.config || {});

  const updateField = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Delay (Milliseconds)</label>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="0" 
            max="10000" 
            step="100"
            value={config.duration_ms || 0} 
            onChange={(e) => updateField('duration_ms', parseInt(e.target.value))}
            className="flex-1 accent-primary"
          />
          <input 
            type="number" 
            value={config.duration_ms || 0} 
            onChange={(e) => updateField('duration_ms', parseInt(e.target.value))}
            className="w-24 bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm text-center"
          />
          <span className="text-sm text-textMuted">ms</span>
        </div>
      </div>
    </div>
  );
}
