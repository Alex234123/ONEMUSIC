import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { mapPlaylists, mapSongs } from '../services/mapper.js';

const router = Router();

router.get('/playlist', async (req: Request, res: Response) => {
  try {
    const { cat = '全部', limit = '20' } = req.query;
    const result = await ncm.top_playlist({ cat: String(cat), limit: Number(limit), order: 'hot' });
    res.json({ playlists: mapPlaylists(result?.body?.playlists) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/album', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;
    const result = await ncm.top_album({ limit: Number(limit) });
    const albums = (result?.body?.albums || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      picUrl: a.picUrl || a.blurPicUrl || '',
      publishTime: a.publishTime || 0,
      company: a.company || '',
    }));
    res.json({ albums });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (_req: Request, res: Response) => {
  try {
    const result = await ncm.toplist({});
    res.json({ list: result?.body?.list || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/songs', async (req: Request, res: Response) => {
  try {
    const { type = '0' } = req.query;
    const result = await ncm.top_song({ type: Number(type) });
    res.json({ songs: mapSongs(result?.body?.data) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;