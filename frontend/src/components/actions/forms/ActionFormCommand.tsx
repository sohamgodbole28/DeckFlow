import { useState } from 'react';

export default function ActionFormCommand({ action, onChange }: { action: any, onChange: (config: any) => void }) {
  const [config, setConfig] = useState(action.config || {});

  const updateField = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Shell</label>
        <select 
          value={config.shell || 'cmd'} 
          onChange={(e) => updateField('shell', e.target.value)}
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
        >
          <option value="cmd">Command Prompt (CMD)</option>
          <option value="powershell">PowerShell</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Command</label>
        <textarea 
          value={config.command || ''} 
          onChange={(e) => updateField('command', e.target.value)}
          placeholder="echo Hello World"
          rows={4}
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm resize-y"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Working Directory (Optional)</label>
        <input 
          type="text" 
          value={config.cwd || ''} 
          onChange={(e) => updateField('cwd', e.target.value)}
          placeholder="C:\Path\To\Dir"
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
        />
      </div>
    </div>
  );
}
