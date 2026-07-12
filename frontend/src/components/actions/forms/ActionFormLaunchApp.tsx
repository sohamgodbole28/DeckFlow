import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export default function ActionFormLaunchApp({ action, onChange }: { action: any, onChange: (config: any) => void }) {
  const [config, setConfig] = useState(action.config || {});

  const updateField = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const [apps, setApps] = useState<{name: string, path: string}[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      setLoadingApps(true);
      try {
        const data = await api.getSystemApps();
        setApps(data);
      } catch (e) {
        console.error("Failed to load apps", e);
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();
  }, []);

  const handleBrowse = async () => {
    const path = prompt("Enter the absolute path to the executable:");
    if (path) {
      updateField('target', path);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Application Path / Target</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            list="installed-apps"
            value={config.target || ''} 
            onChange={(e) => updateField('target', e.target.value)}
            placeholder={loadingApps ? "Loading apps..." : "Select app or type C:\\Windows\\System32\\calc.exe"}
            className="flex-1 bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
          />
          <datalist id="installed-apps">
            {apps.map((app, idx) => (
              <option key={idx} value={app.path}>{app.name}</option>
            ))}
          </datalist>
          <button onClick={handleBrowse} className="px-4 py-2 bg-panel border border-border rounded hover:border-primary transition-colors text-sm">
            Browse...
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Arguments (Optional)</label>
        <input 
          type="text" 
          value={config.arguments || ''} 
          onChange={(e) => updateField('arguments', e.target.value)}
          placeholder="-fullscreen --profile default"
          className="bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
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

      <div className="flex items-center gap-2 mt-2 cursor-pointer" onClick={() => updateField('runAsAdmin', !config.runAsAdmin)}>
        <input 
          type="checkbox" 
          checked={!!config.runAsAdmin} 
          readOnly
          className="accent-primary"
        />
        <span className="text-sm">Run As Administrator</span>
      </div>
    </div>
  );
}
