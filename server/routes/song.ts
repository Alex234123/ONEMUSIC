import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { mapSongs } from '../services/mapper.js';

const router = Router();

router.get('/detail', async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    const result = await ncm.song_detail({ ids: String(ids) });
    res.json({ songs: mapSongs(result?.body?.songs) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/url', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const cookie = (req as any).neteaseCookie || '';
    // 使用 higher 而非 exhigh，避免返回 FLAC 大文件
    const result = await ncm.song_url_v1({ id: Number(id), level: 'higher', cookie });
    res.json(result?.body || { data: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;