// === 歌曲 ===
export interface Song {
  id: number;
  name: string;
  artists: Artist[];
  album: Album;
  duration: number;
  url?: string;
  privilege?: {
    st: number;
    flag: number;
  };
}

// === 歌手 ===
export interface Artist {
  id: number;
  name: string;
  picUrl?: string;
  alias?: string[];
}

// === 专辑 ===
export interface Album {
  id: number;
  name: string;
  picUrl: string;
  publishTime: number;
  company?: string;
}

// === 歌单 ===
export interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string;
  description: string;
  trackCount: number;
  playCount: number;
  tracks: Song[];
  creator: { nickname: string; avatarUrl: string };
  tags: string[];
}

// === 歌词 ===
export interface LyricData {
  lrc: LrcLine[];
  yrc?: YrcLine[];
  tlyric?: LrcLine[];
}

export interface LrcLine {
  time: number;
  text: string;
}

/** YRC 逐字歌词行（保留行级分组） */
export interface YrcLine {
  time: number;
  duration: number;
  words: YrcWord[];
}

export interface YrcWord {
  time: number;
  duration: number;
  text: string;
}

// === 播放模式 ===
export type PlaybackMode = 'sequence' | 'shuffle' | 'repeat-one' | 'repeat-all';
export type CoverVisualState = 'expanded' | 'collapsed';
export type LyricLayoutMode = 'centered-cover' | 'split-lyrics';

// === 搜索结果 ===
export interface SearchResult {
  songs?: Song[];
  artists?: Artist[];
  albums?: Album[];
  playlists?: Playlist[];
  songCount?: number;
}