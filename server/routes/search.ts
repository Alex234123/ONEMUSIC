import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { mapSongs, mapPlaylists } from '../services/mapper.js';

function proxyUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/api/')) return url;
  return `/api/image?url=${encodeURIComponent(url)}`;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { keyword, type = '1', limit = '20' } = req.query;
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.cloudsearch({
      keywords: String(keyword),
      type: Number(type),
      limit: Number(limit),
      cookie,
    });
    const r = result?.body?.result || {};
    res.json({
      songs: mapSongs(r.songs),
      artists: (r.artists || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        picUrl: proxyUrl(a.picUrl || a.img1v1Url),
        alias: a.alias || [],
      })),
      albums: r.albums || [],
      playlists: mapPlaylists(r.playlists),
      songCount: r.songCount || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hot', async (_req: Request, res: Response) => {
  try {
    const result = await ncm.search_hot_detail({});
    res.json({ hots: result?.body?.data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/suggest', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    const result = await ncm.search_suggest({ keywords: String(keyword) });
    res.json(result?.body?.result || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;