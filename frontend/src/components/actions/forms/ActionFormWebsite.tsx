import { useState } from 'react';

export default function ActionFormWebsite({ action, onChange }: { action: any, onChange: (config: any) => void }) {
  const [config, setConfig] = useState(action.config || {});

  const updateField = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">URL</label>
        <input 
          type="url" 
          value={config.target || ''} 
          onChange={(e) => updateField('target', e.target.value)}
          placeholder="https://google.com"
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Open Using</label>
        <select 
          value={config.browser || 'default'} 
          onChange={(e) => updateField('browser', e.target.value)}
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
        >
          <option value="default">Default Browser</option>
          <option value="chrome">Google Chrome</option>
          <option value="edge">Microsoft Edge</option>
          <option value="firefox">Mozilla Firefox</option>
        </select>
      </div>
    </div>
  );
}
