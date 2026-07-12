import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { wsService } from '../services/ws';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight, Play, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Controller() {
  const { profiles, currentProfileId, pages, buttons, setPages, setButtons, serverConnected } = useStore();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const profile = profiles.find((p: any) => p.id === currentProfileId) || profiles[0];

  useEffect(() => {
    // If we land here, the App.tsx already loaded profiles and connected WS.
    if (!profile) return;

    const loadPageData = async () => {
      setLoading(true);
      try {
        const fetchedPages = await api.getPages(profile.id);
        setPages(fetchedPages);
        
        let targetPage = fetchedPages[0];
        if (profile.default_page_id) {
          const defaultPage = fetchedPages.find((p: any) => p.id === profile.default_page_id);
          if (defaultPage) targetPage = defaultPage;
        }

        if (targetPage) {
          const fetchedButtons = await api.getButtons(targetPage.id);
          setButtons(fetchedButtons);
          
          const idx = fetchedPages.findIndex((p: any) => p.id === targetPage.id);
          setCurrentPageIndex(idx !== -1 ? idx : 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadPageData();
  }, [profile?.id, setPages, setButtons]);

  const currentPage = pages[currentPageIndex];

  // Helper to load buttons for a page
  const loadPageButtons = async (pageId: number) => {
    try {
      const fetchedButtons = await api.getButtons(pageId);
      setButtons(fetchedButtons);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      const nextIdx = currentPageIndex + 1;
      setCurrentPageIndex(nextIdx);
      loadPageButtons(pages[nextIdx].id);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      const prevIdx = currentPageIndex - 1;
      setCurrentPageIndex(prevIdx);
      loadPageButtons(pages[prevIdx].id);
    }
  };

  const handleButtonPress = (buttonId: number) => {
    const btn = buttons.find(b => b.id === buttonId);
    if (!btn) return;

    
    const deviceId = useStore.getState().deviceId;
    wsService.send("button.press", { button_id: buttonId, device_id: deviceId });
    
    // Add micro-animation/haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Build grid layout
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const gridRows = profile?.grid_rows || 3;
  const gridCols = profile?.grid_cols || 5;

  const gridCells = useMemo(() => {
    const cells = Array(gridRows * gridCols).fill(null);
    buttons.forEach(btn => {
      // In V1, width and height are 1. We calculate index as y * cols + x.
      if (btn.x < gridCols && btn.y < gridRows) {
        const idx = btn.y * gridCols + btn.x;
        cells[idx] = btn;
      }
    });
    return cells;
  }, [buttons, gridRows, gridCols]);

  if (!profile) {
    return <div className="h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${serverConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-semibold">{profile.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-zinc-400 text-sm">
            {currentPage ? currentPage.name : 'No Pages'}
          </div>
          <button onClick={handleFullscreen} className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors">
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-zinc-950 relative touch-pan-y touch-pan-x">
        {loading ? (
          <div className="animate-pulse flex items-center justify-center text-zinc-500">Loading Page...</div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Swipe area wrapper (We'd use framer-motion drag or react-swipeable ideally, using buttons for desktop compatibility) */}
            <div 
              className="grid gap-2 p-2 sm:p-0 sm:gap-4"
              style={{
                width: `min(100%, (100vh - 120px) * (${gridCols} / ${gridRows}))`,
                aspectRatio: `${gridCols} / ${gridRows}`,
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`
              }}
            >
              {gridCells.map((btn, idx) => (
                <div key={idx} className="w-full h-full relative group">
                  {btn ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleButtonPress(btn.id)}
                      className={`w-full h-full rounded-2xl sm:rounded-3xl shadow-xl flex flex-col items-center justify-center transition-colors relative overflow-hidden focus:outline-none`}
                      style={{
                        backgroundColor: btn.background_color || '#27272a',
                        color: btn.text_color || '#ffffff'
                      }}
                    >
                      {/* Glassmorphism reflection */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                      
                      {btn.icon ? (
                        <div className="text-4xl sm:text-6xl mb-2" style={{ fontSize: btn.icon_size ? `${btn.icon_size}px` : undefined }}>
                          {/* Placeholder for icon rendering (lucide or image) - we'll use emoji for now since it's easy */}
                          {btn.emoji || <Play size={btn.icon_size || 40} />}
                        </div>
                      ) : btn.emoji ? (
                        <div className="text-4xl sm:text-6xl mb-2" style={{ fontSize: btn.icon_size ? `${btn.icon_size}px` : undefined }}>
                          {btn.emoji}
                        </div>
                      ) : null}
                      <span className="font-semibold text-sm sm:text-lg px-2 text-center break-words leading-tight w-full drop-shadow-md">
                        {btn.label}
                      </span>
                    </motion.button>
                  ) : (
                    <div className="w-full h-full rounded-2xl sm:rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 opacity-50" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Page Navigation Overlays */}
            {currentPageIndex > 0 && (
              <button onClick={handlePrevPage} className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-zinc-500 hover:text-white transition-colors h-full flex items-center bg-gradient-to-r from-black/50 to-transparent">
                <ChevronLeft size={48} />
              </button>
            )}
            {currentPageIndex < pages.length - 1 && (
              <button onClick={handleNextPage} className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-zinc-500 hover:text-white transition-colors h-full flex items-center bg-gradient-to-l from-black/50 to-transparent">
                <ChevronRight size={48} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
