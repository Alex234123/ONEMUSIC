import { create } from 'zustand';

interface UIState {
  isNowPlayingOpen: boolean;
  isSidebarCollapsed: boolean;
  isPlaylistPanelOpen: boolean;
  isSettingsOpen: boolean;
  homeGreeting: string;

  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  toggleNowPlaying: () => void;
  toggleSidebar: () => void;
  togglePlaylistPanel: () => void;
  toggleSettings: () => void;
  setHomeGreeting: (greeting: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

export const useUIStore = create<UIState>((set) => ({
  isNowPlayingOpen: false,
  isSidebarCollapsed: false,
  isPlaylistPanelOpen: false,
  isSettingsOpen: false,
  homeGreeting: getGreeting(),

  openNowPlaying: () => set({ isNowPlayingOpen: true }),
  closeNowPlaying: () => set({ isNowPlayingOpen: false }),
  toggleNowPlaying: () => set((s) => ({ isNowPlayingOpen: !s.isNowPlayingOpen })),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  togglePlaylistPanel: () => set((s) => ({ isPlaylistPanelOpen: !s.isPlaylistPanelOpen })),
  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
  setHomeGreeting: (greeting) => set({ homeGreeting: greeting }),
}));