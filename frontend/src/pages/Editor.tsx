import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { Plus, Trash2, LayoutTemplate, Layers } from 'lucide-react';
import PropertyPanel from '../components/properties/PropertyPanel';

export default function Editor() {
  const { profiles, currentProfileId, setCurrentProfileId, pages, setPages, currentPageId, setCurrentPageId, buttons, setButtons } = useStore();
  
  const [selectedButton, setSelectedButton] = useState<any>(null);
  const [selectedButtonActions, setSelectedButtonActions] = useState<any[]>([]);
  const actionSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Create Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const profile = profiles.find((p) => p.id === currentProfileId) || profiles[0];
  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];

  useEffect(() => {
    if (profile) {
      loadPages(profile.id);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (currentPage) {
      loadButtons(currentPage.id);
      setSelectedButton(null);
    }
  }, [currentPage?.id]);

  useEffect(() => {
    if (selectedButton) {
      api.getActions(selectedButton.id).then(setSelectedButtonActions).catch(console.error);
    } else {
      setSelectedButtonActions([]);
    }
  }, [selectedButton?.id]);

  const loadPages = async (pid: number) => {
    try {
      const pgs = await api.getPages(pid);
      setPages(pgs);
      if (pgs.length > 0 && (!currentPageId || !pgs.find((p: any) => p.id === currentPageId))) {
        setCurrentPageId(pgs[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadButtons = async (pageId: number) => {
    try {
      const btns = await api.getButtons(pageId);
      setButtons(btns);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName) return;
    try {
      const newProf = await api.createProfile({ name: newProfileName, grid_rows: 3, grid_cols: 5, is_default: false });
      useStore.getState().setProfiles([...profiles, newProf]);
      setCurrentProfileId(newProf.id);
      setShowProfileModal(false);
      setNewProfileName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePage = async () => {
    if (!profile) return;
    const name = prompt("Page Name:");
    if (!name) return;
    try {
      const newPage = await api.createPage(profile.id, { name, order_index: pages.length });
      setPages([...pages, newPage]);
      setCurrentPageId(newPage.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
    if (!confirm(`Delete profile '${profile.name}' and all its pages/buttons?`)) return;
    try {
      await api.deleteProfile(profile.id);
      const newProfiles = profiles.filter(p => p.id !== profile.id);
      useStore.getState().setProfiles(newProfiles);
      setCurrentProfileId(newProfiles.length > 0 ? newProfiles[0].id : null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePage = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this page?")) return;
    try {
      await api.deletePage(id);
      const newPages = pages.filter(p => p.id !== id);
      setPages(newPages);
      if (currentPageId === id) {
        setCurrentPageId(newPages.length > 0 ? newPages[0].id : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop support
  const handleDragStart = (e: React.DragEvent, btn: any) => {
    e.dataTransfer.setData("button_id", btn.id.toString());
  };

  const handleDrop = async (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    const btnId = e.dataTransfer.getData("button_id");
    if (!btnId) return;

    // Check if spot is occupied
    const existing = buttons.find(b => b.x === x && b.y === y);
    if (existing) {
      // For V1, don't allow swap, just alert
      alert("Space is occupied!");
      return;
    }

    try {
      const updatedBtn = await api.updateButton(parseInt(btnId), { x, y });
      setButtons(buttons.map(b => b.id === updatedBtn.id ? updatedBtn : b));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleCreateButton = async (x: number, y: number) => {
    if (!currentPage) return;
    try {
      const newBtn = await api.createButton(currentPage.id, {
        label: "New Button",
        x, y,
        background_color: "#27272a",
        text_color: "#ffffff"
      });
      setButtons([...buttons, newBtn]);
      setSelectedButton(newBtn);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteButton = async (id: number) => {
    if (!confirm("Delete button?")) return;
    try {
      await api.deleteButton(id);
      setButtons(buttons.filter(b => b.id !== id));
      if (selectedButton?.id === id) setSelectedButton(null);
    } catch (e) {
      console.error(e);
    }
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSelectedButton = (updates: any) => {
    if (!selectedButton) return;
    
    // Update local state immediately for responsive UI
    const updatedLocal = { ...selectedButton, ...updates };
    setButtons(useStore.getState().buttons.map(b => b.id === updatedLocal.id ? updatedLocal : b));
    setSelectedButton(updatedLocal);

    // Debounce API call
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateButton(updatedLocal.id, updates);
      } catch (e) {
        console.error("Failed to save button to backend:", e);
      }
    }, 400);
  };

  const handleAddAction = async (meta: any) => {
    if (!selectedButton) return;
    const newAction = {
      type: meta.id,
      config: meta.defaultConfig || {},
      order_index: selectedButtonActions.length
    };
    try {
      const created = await api.createAction(selectedButton.id, newAction);
      setSelectedButtonActions([...selectedButtonActions, created]);
    } catch (e) { console.error(e); }
  };

  const handleActionsChange = async (newActions: any[]) => {
    if (!selectedButton) return;
    
    // Determine deletions and reorders
    const existingIds = new Set(selectedButtonActions.map(a => a.id).filter(Boolean));
    const newIds = new Set(newActions.map(a => a.id).filter(Boolean));
    
    // Optimistic UI
    setSelectedButtonActions(newActions);

    // Deletions
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        await api.deleteAction(id).catch(console.error);
      }
    }
    
    // Creations (from duplicates in ActionList) & Updates (order)
    const savedActions = [];
    for (let i = 0; i < newActions.length; i++) {
      const a = newActions[i];
      if (a.id) {
        // Update order
        const updated = await api.updateAction(a.id, { order_index: i }).catch(console.error);
        if (updated) savedActions.push(updated);
      } else {
        // Create duplicate
        const created = await api.createAction(selectedButton.id, {
          type: a.type,
          config: a.config,
          order_index: i
        }).catch(console.error);
        if (created) savedActions.push(created);
      }
    }
    if (savedActions.length === newActions.length) {
      setSelectedButtonActions(savedActions);
    }
  };

  const handleUpdateActionConfig = (index: number, newConfig: any) => {
    const action = selectedButtonActions[index];
    if (!action) return;
    
    // Update local immediately
    const newActions = [...selectedButtonActions];
    newActions[index] = { ...action, config: newConfig };
    setSelectedButtonActions(newActions);

    // Debounce backend save
    if (actionSaveTimeoutRef.current) clearTimeout(actionSaveTimeoutRef.current);
    actionSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateAction(action.id, { config: newConfig });
        console.log("Saved action config:", newConfig);
      } catch (e) {
        console.error("Failed to save action config", e);
      }
    }, 500);
  };

  const gridRows = profile?.grid_rows || 3;
  const gridCols = profile?.grid_cols || 5;

  const gridCells = useMemo(() => {
    const cells = Array(gridRows * gridCols).fill(null);
    buttons.forEach(btn => {
      if (btn.x < gridCols && btn.y < gridRows) {
        cells[btn.y * gridCols + btn.x] = btn;
      }
    });
    return cells;
  }, [buttons, gridRows, gridCols]);

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Profiles & Pages */}
      <div className="w-64 bg-panel border-r border-border flex flex-col p-4 overflow-y-auto">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><LayoutTemplate size={20} className="text-primary"/> Profiles</h2>
          <div className="flex gap-1">
            <button onClick={() => setShowProfileModal(true)} className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
              <Plus size={16} />
            </button>
            <button onClick={handleDeleteProfile} className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors" title="Delete current profile">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <select 
          className="w-full bg-background border border-border rounded-lg p-2 mb-8 focus:outline-none focus:border-primary"
          value={currentProfileId || ''}
          onChange={(e) => setCurrentProfileId(parseInt(e.target.value))}
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><Layers size={20} className="text-primary"/> Pages</h2>
          <button onClick={handleCreatePage} className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {pages.map(p => (
            <div
              key={p.id}
              onClick={() => setCurrentPageId(p.id)}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-colors border cursor-pointer ${currentPageId === p.id ? 'bg-primary/10 border-primary text-primary' : 'border-transparent hover:bg-border/50 text-text'}`}
            >
              <span>{p.name}</span>
              <button 
                onClick={(e) => handleDeletePage(p.id, e)} 
                className="text-textMuted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {pages.length === 0 && <div className="text-textMuted text-sm text-center py-4">No pages found</div>}
        </div>
      </div>

      {/* Middle - Grid Editor */}
      <div className="flex-1 bg-background flex flex-col relative">
        <div className="p-4 border-b border-border flex justify-between items-center bg-panel">
          <h1 className="text-xl font-bold">Grid Editor</h1>
          <div className="text-textMuted text-sm flex gap-4">
            <span>Size: {gridCols}x{gridRows}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
          {!currentPage ? (
            <div className="text-textMuted">Select or create a page</div>
          ) : (
            <div 
              className="grid gap-3 p-4 bg-panel/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(80px, 120px))`,
                gridTemplateRows: `repeat(${gridRows}, minmax(80px, 120px))`
              }}
            >
              {Array.from({ length: gridRows * gridCols }).map((_, i) => {
                const x = i % gridCols;
                const y = Math.floor(i / gridCols);
                const btn = gridCells[i];

                return (
                  <div
                    key={i}
                    className="relative w-full h-full"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, x, y)}
                  >
                    {btn ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, btn)}
                        onClick={() => setSelectedButton(btn)}
                        className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all cursor-grab active:cursor-grabbing border-2 ${selectedButton?.id === btn.id ? 'border-primary scale-[1.02] shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent shadow-lg hover:brightness-110'}`}
                        style={{
                          backgroundColor: btn.background_color || '#27272a',
                          color: btn.text_color || '#ffffff'
                        }}
                      >
                        {btn.emoji && <div className="text-3xl mb-1">{btn.emoji}</div>}
                        <span className="text-xs font-semibold px-2 text-center break-words w-full">{btn.label || 'Unnamed'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCreateButton(x, y)}
                        className="w-full h-full rounded-2xl border-2 border-dashed border-border/50 bg-background/50 flex items-center justify-center text-border hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-[350px] border-l border-border bg-panel flex flex-col shrink-0">
        <PropertyPanel 
          button={selectedButton} 
          onUpdate={updateSelectedButton} 
          onDelete={() => handleDeleteButton(selectedButton.id)}
          actions={selectedButtonActions}
          onActionsChange={handleActionsChange}
          onAddAction={handleAddAction}
          onUpdateActionConfig={handleUpdateActionConfig}
        />
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-panel p-6 rounded-2xl border border-border w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create Profile</h2>
            <input 
              type="text" 
              placeholder="Profile Name" 
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              className="w-full bg-background border border-border rounded p-3 mb-6 focus:border-primary focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 rounded text-textMuted hover:bg-border/50">Cancel</button>
              <button onClick={handleCreateProfile} className="px-4 py-2 rounded bg-primary text-white hover:bg-primaryHover font-medium shadow-lg shadow-primary/30">Create</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
