/**
 * 将 NCM API 返回的歌曲字段映射为前端 Song 类型
 * 所有外部图片 URL 统一走 /api/image 代理，避免跨域 ERR_ABORTED
 */

/** 将外部 URL 转为同源代理 URL */
function proxyUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/api/')) return url; // 已经是代理地址
  return `/api/image?url=${encodeURIComponent(url)}`;
}

export function mapSong(raw: any) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    artists: (raw.ar || raw.artists || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      picUrl: proxyUrl(a.picUrl || a.img1v1Url),
      alias: a.alias || [],
    })),
    album: {
      id: raw.al?.id || raw.album?.id || 0,
      name: raw.al?.name || raw.album?.name || '',
      picUrl: proxyUrl(raw.al?.picUrl || raw.album?.picUrl || raw.album?.blurPicUrl),
      publishTime: raw.al?.publishTime || raw.album?.publishTime || 0,
      company: raw.al?.company || raw.album?.company || '',
    },
    duration: raw.dt || raw.duration || 0,
    url: raw.url || '',
    privilege: raw.privilege ? { st: raw.privilege.st, flag: raw.privilege.flag } : undefined,
  };
}

export function mapSongs(raws: any[]) {
  if (!raws) return [];
  return raws.map(mapSong).filter(Boolean);
}

export function mapPlaylist(raw: any) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    coverImgUrl: proxyUrl(raw.coverImgUrl || raw.picUrl),
    description: raw.description || '',
    trackCount: raw.trackCount || raw.tracks?.length || 0,
    playCount: raw.playCount || 0,
    tracks: mapSongs(raw.tracks),
    creator: raw.creator
      ? { nickname: raw.creator.nickname, avatarUrl: proxyUrl(raw.creator.avatarUrl) }
      : { nickname: '', avatarUrl: '' },
    tags: raw.tags || [],
  };
}

export function mapPlaylists(raws: any[]) {
  if (!raws) return [];
  return raws.map(mapPlaylist).filter(Boolean);
}

export function mapAlbum(raw: any) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    picUrl: proxyUrl(raw.picUrl || raw.blurPicUrl),
    publishTime: raw.publishTime || 0,
    company: raw.company || '',
  };
}
