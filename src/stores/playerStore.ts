import { create } from 'zustand';
import type { Song, PlaybackMode, CoverVisualState, LyricLayoutMode } from '../types';

interface PlayerState {
  currentSong: Song | null;
  playlist: Song[];
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackMode: PlaybackMode;
  coverVisualState: CoverVisualState;
  lyricLayoutMode: LyricLayoutMode;

  playSong: (song: Song, list?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  setVolume: (vol: number) => void;
  cyclePlaybackMode: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCoverVisualState: (state: CoverVisualState) => void;
  setLyricLayoutMode: (mode: LyricLayoutMode) => void;
  toggleLyricMode: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  playlist: [],
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 70,
  playbackMode: 'sequence',
  coverVisualState: 'collapsed',
  lyricLayoutMode: 'centered-cover',

  playSong: (song, list) => {
    const state = get();
    const newPlaylist = list || state.playlist;
    set({
      currentSong: song,
      playlist: newPlaylist,
      queue: [],
      isPlaying: true,
      currentTime: 0,
      duration: song.duration / 1000,
      coverVisualState: 'expanded',
    });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { currentSong, playlist, playbackMode } = get();
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    let nextIdx: number;
    if (playbackMode === 'shuffle') {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= playlist.length) {
        nextIdx = playbackMode === 'repeat-all' ? 0 : idx;
      }
    }
    if (nextIdx !== idx) {
      set({ currentSong: playlist[nextIdx], isPlaying: true, currentTime: 0 });
    }
  },

  prev: () => {
    const { currentSong, playlist } = get();
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    if (idx > 0) {
      set({ currentSong: playlist[idx - 1], isPlaying: true, currentTime: 0 });
    }
  },

  seekTo: (time) => set({ currentTime: time }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (dur) => set({ duration: dur }),
  setVolume: (vol) => set({ volume: Math.max(0, Math.min(100, vol)) }),

  cyclePlaybackMode: () => {
    const modes: PlaybackMode[] = ['sequence', 'shuffle', 'repeat-one', 'repeat-all'];
    const current = get().playbackMode;
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    set({ playbackMode: modes[nextIdx] });
  },

  addToQueue: (song) => set((s) => ({ queue: [...s.queue, song] })),
  removeFromQueue: (index) => set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),
  clearQueue: () => set({ queue: [] }),

  setCoverVisualState: (state) => set({ coverVisualState: state }),
  setLyricLayoutMode: (mode) => set({ lyricLayoutMode: mode }),
  toggleLyricMode: () =>
    set((s) => ({
      lyricLayoutMode: s.lyricLayoutMode === 'centered-cover' ? 'split-lyrics' : 'centered-cover',
    })),
}));