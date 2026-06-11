import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { mapPlaylists } from '../services/mapper.js';

const router = Router();

router.get('/playlist', async (req: Request, res: Response) => {
  try {
    const { uid } = req.query;
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.user_playlist({ uid: Number(uid), limit: 50, cookie });
    res.json({ playlist: mapPlaylists(result?.body?.playlist) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent', async (req: Request, res: Response) => {
  try {
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.record_recent_song({ limit: 50, cookie });
    const list = (result?.body?.data?.list || []).map((item: any) => ({
      ...item,
      data: item.data ? {
        id: item.data.id,
        name: item.data.name,
        ar: item.data.ar || item.data.artists || [],
        al: item.data.al || item.data.album || {},
        dt: item.data.dt || item.data.duration || 0,
      } : item,
    }));
    res.json({ list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;