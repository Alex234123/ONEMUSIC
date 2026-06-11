import axios from 'axios';
import type { Song, Album, Playlist, LyricData, SearchResult } from '../types';

const api = axios.create({ baseURL: '/api' });

// 请求拦截器：自动注入 cookie
api.interceptors.request.use((config) => {
  try {
    const cookie = localStorage.getItem('netease_cookie');
    if (cookie) {
      config.headers['x-netease-cookie'] = cookie;
    }
  } catch {
    // localStorage 不可用
  }
  return config;
});

// === 搜索 ===
export async function searchByType(keyword: string, type: number, limit = 20) {
  const { data } = await api.get('/search', { params: { keyword, type, limit } });
  return data as SearchResult;
}

export async function searchAll(keyword: string, limit = 6) {
  const [songs, artists, playlists] = await Promise.all([
    searchByType(keyword, 1, limit).catch(() => ({ songs: [] })),
    searchByType(keyword, 100, limit).catch(() => ({ artists: [] })),
    searchByType(keyword, 1000, limit).catch(() => ({ playlists: [] })),
  ]);
  return {
    songs: songs.songs || [],
    artists: artists.artists || [],
    playlists: playlists.playlists || [],
  } as SearchResult;
}

export async function searchHot() {
  const { data } = await api.get('/search/hot');
  return data as { hots: { searchWord: string; first?: string }[] };
}

export async function searchSuggest(keyword: string) {
  const { data } = await api.get('/search/suggest', { params: { keyword } });
  return data;
}

// === 歌单 / 专辑 ===
export async function getPlaylistDetail(id: number) {
  const { data } = await api.get('/playlist/detail', { params: { id } });
  return data as { playlist: Playlist };
}

export async function getAlbumDetail(id: number) {
  const { data } = await api.get('/album', { params: { id } });
  return data as { album: Album; songs: Song[] };
}

// === 歌曲 ===
export async function getSongDetail(ids: number[]) {
  const { data } = await api.get('/song/detail', { params: { ids: ids.join(',') } });
  return data as { songs: Song[] };
}

export async function getSongUrl(id: number) {
  const { data } = await api.get('/song/url', { params: { id } });
  return data as { data: { url: string }[] };
}

// === 歌词 ===
export async function getLyric(id: number) {
  const { data } = await api.get('/lyric', { params: { id } });
  return data as LyricData;
}

// === 推荐（需 Cookie）===
export async function getRecommendPlaylist() {
  const { data } = await api.get('/recommend/playlist');
  return data as { playlists: Playlist[] };
}

export async function getRecommendSongs() {
  const { data } = await api.get('/recommend/songs');
  return data as { songs: Song[] };
}

// === 排行榜 / 分类 ===
export async function getTopPlaylists(cat = '全部', limit = 20) {
  const { data } = await api.get('/top/playlist', { params: { cat, limit } });
  return data as { playlists: Playlist[] };
}

export async function getTopAlbums(limit = 20) {
  const { data } = await api.get('/top/album', { params: { limit } });
  return data as { albums: Album[] };
}

// === 用户私有 ===
export async function getUserPlaylists(uid: number) {
  const { data } = await api.get('/user/playlist', { params: { uid } });
  return data as { playlist: Playlist[] };
}

export async function getRecentPlays() {
  const { data } = await api.get('/user/recent');
  return data as { list: Playlist[] };
}