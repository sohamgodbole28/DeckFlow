import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { Settings as SettingsIcon, Smartphone, History, Download, Upload } from 'lucide-react';

export default function Settings() {
  const { deviceId, serverConnected, agentConnected } = useStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogsAndDevices = async () => {
      try {
        const resLogs = await fetch(`http://${window.location.hostname}:8000/api/v1/logs`);
        setLogs(await resLogs.json());
        
        const devs = await api.getDevices();
        setDevices(devs);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogsAndDevices();
    
    const interval = setInterval(fetchLogsAndDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveDevice = async (uuid: string) => {
    if (uuid) {
      await api.approveDevice(uuid);
      const devs = await api.getDevices();
      setDevices(devs);
    }
  };

  return (
    <div className="flex h-full w-full bg-background">
      <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <SettingsIcon className="text-primary" /> Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Status Panel */}
          <div className="bg-panel rounded-2xl p-6 border border-border shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Smartphone className="text-primary" size={20}/> Connection Status</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                <span className="text-textMuted">Server (FastAPI)</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${serverConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {serverConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                <span className="text-textMuted">Desktop Agent</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${agentConnected ? 'bg-green-500/20 text-green-500' : 'bg-zinc-500/20 text-zinc-400'}`}>
                  {/* Using server status as proxy or waiting for real ping */}
                  {serverConnected ? 'ONLINE' : 'OFFLINE'} 
                </span>
              </div>
            </div>
          </div>

          {/* Device Pairing */}
          <div className="bg-panel rounded-2xl p-6 border border-border shadow-lg flex flex-col">
            <h2 className="text-lg font-bold mb-4">Device Management</h2>
            <p className="text-sm text-textMuted mb-4">
              This browser's Device ID:<br/>
              <code className="text-primary bg-primary/10 px-2 py-1 rounded mt-1 block select-all">{deviceId}</code>
            </p>
            <div className="flex-1 overflow-auto max-h-48 mb-4 border border-border rounded-lg bg-background p-2 space-y-2">
              {devices.length === 0 ? <p className="text-sm text-textMuted text-center py-2">No devices found</p> : null}
              {devices.map(d => (
                <div key={d.id} className="flex justify-between items-center p-2 rounded bg-panel/50 border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono truncate w-32" title={d.uuid}>{d.uuid.substring(0, 8)}...</span>
                    <span className={`text-[10px] uppercase font-bold ${d.approved ? 'text-green-500' : 'text-yellow-500'}`}>{d.approved ? 'Approved' : 'Pending'}</span>
                  </div>
                  {!d.approved && (
                    <button onClick={() => handleApproveDevice(d.uuid)} className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primaryHover">
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <button onClick={() => { if (deviceId) handleApproveDevice(deviceId); }} className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 py-2 rounded-lg font-medium transition-colors">
                Auto-Approve This Browser
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Backup */}
        <div className="bg-panel rounded-2xl p-6 border border-border shadow-lg mb-8">
          <h2 className="text-lg font-bold mb-4">Configuration</h2>
          <div className="flex gap-4">
            <button className="flex-1 bg-background border border-border hover:border-primary text-text hover:text-primary py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Download size={18} /> Export Config
            </button>
            <button className="flex-1 bg-background border border-border hover:border-primary text-text hover:text-primary py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Upload size={18} /> Import Config
            </button>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="bg-panel rounded-2xl p-6 border border-border shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="text-primary" size={20}/> Execution Logs</h2>
          
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel border-b border-border text-textMuted">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Button ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Duration (ms)</th>
                  <th className="p-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-textMuted">No logs found</td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                      <td className="p-3">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3">#{log.button_id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{log.duration_ms}ms</td>
                      <td className="p-3 text-textMuted truncate max-w-xs">{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
