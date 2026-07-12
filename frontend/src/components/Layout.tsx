
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutGrid, Settings, MonitorPlay } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Layout() {
  const { serverConnected } = useStore();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-text">
      {/* Sidebar */}
      <div className="w-16 flex flex-col items-center py-6 bg-panel border-r border-border gap-6 z-10 shadow-lg relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 mb-4">
          D
        </div>
        
        <NavLink to="/editor" className={({isActive}) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-textMuted hover:text-text hover:bg-border/50'}`}>
          <LayoutGrid size={22} />
        </NavLink>
        
        <NavLink to="/settings" className={({isActive}) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-textMuted hover:text-text hover:bg-border/50'}`}>
          <Settings size={22} />
        </NavLink>

        <a href="/controller" target="_blank" rel="noreferrer" className="p-3 rounded-xl text-textMuted hover:text-text hover:bg-border/50 transition-all duration-300 mt-auto" title="Open Mobile Controller">
          <MonitorPlay size={22} />
        </a>

        {/* Status Indicators */}
        <div className="flex flex-col gap-3 mt-4 w-full items-center">
          <div className="relative group cursor-help">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${serverConnected ? 'bg-green-500 shadow-green-500/30' : 'bg-red-500 shadow-red-500/30'}`}></div>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-panel border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Server: {serverConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          {/* Note: In V1 we aren't tracking detailed agent state from UI easily, we could just show it green if server is connected for simplicity or implement it fully. 
              Let's track server connection for now. */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        <Outlet />
      </div>
    </div>
  );
}
