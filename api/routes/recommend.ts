import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { mapPlaylists, mapSongs } from '../services/mapper.js';

const router = Router();

router.get('/playlist', async (req: Request, res: Response) => {
  try {
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.recommend_resource({ cookie });
    res.json({ playlists: mapPlaylists(result?.body?.recommend) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/songs', async (req: Request, res: Response) => {
  try {
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.recommend_songs({ cookie });
    res.json({ songs: mapSongs(result?.body?.data?.dailySongs) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;