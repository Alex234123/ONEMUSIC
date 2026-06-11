import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { parseLrc, parseYrc } from '../middleware/lyricParser.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await ncm.lyric_new({ id: Number(id) });

    const lrcRaw = result?.body?.lrc?.lyric || '';
    const yrcRaw = result?.body?.yrc?.lyric || '';
    const tlyricRaw = result?.body?.tlyric?.lyric || '';

    const lrc = parseLrc(lrcRaw);
    const yrc = yrcRaw ? parseYrc(yrcRaw) : undefined;
    const tlyric = tlyricRaw ? parseLrc(tlyricRaw) : undefined;

    res.json({ lrc, yrc, tlyric });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;