import { create } from 'zustand';

interface Profile {
  id: number;
  name: string;
  grid_rows: number;
  grid_cols: number;
  default_page_id: number | null;
}

interface Page {
  id: number;
  name: string;
  order_index: number;
}

interface Button {
  id: number;
  page_id: number;
  label: string | null;
  icon: string | null;
  emoji: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  background_color: string | null;
  text_color: string | null;
  icon_size: number | null;
}

interface AppState {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  
  currentProfileId: number | null;
  setCurrentProfileId: (id: number | null) => void;
  
  pages: Page[];
  setPages: (pages: Page[]) => void;
  
  currentPageId: number | null;
  setCurrentPageId: (id: number | null) => void;
  
  buttons: Button[];
  setButtons: (buttons: Button[]) => void;
  
  serverConnected: boolean;
  setServerConnected: (connected: boolean) => void;
  
  agentConnected: boolean;
  setAgentConnected: (connected: boolean) => void;
  
  deviceId: string | null;
  setDeviceId: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),
  
  currentProfileId: null,
  setCurrentProfileId: (currentProfileId) => set({ currentProfileId }),
  
  pages: [],
  setPages: (pages) => set({ pages }),
  
  currentPageId: null,
  setCurrentPageId: (currentPageId) => set({ currentPageId }),
  
  buttons: [],
  setButtons: (buttons) => set({ buttons }),
  
  serverConnected: false,
  setServerConnected: (serverConnected) => set({ serverConnected }),
  
  agentConnected: false,
  setAgentConnected: (agentConnected) => set({ agentConnected }),
  
  deviceId: localStorage.getItem('deckflow_device_id') || null,
  setDeviceId: (deviceId) => {
    localStorage.setItem('deckflow_device_id', deviceId);
    set({ deviceId });
  },
}));
