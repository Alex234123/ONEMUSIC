import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';
import { mapPlaylist, mapSongs } from '../services/mapper.js';

const router = Router();

router.get('/detail', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.playlist_detail({ id: Number(id), cookie });
    const raw = result?.body?.playlist || null;

    if (raw && (!raw.tracks || raw.tracks.length === 0) && raw.trackIds?.length > 0) {
      const trackResult = await ncm.playlist_track_all({ id: Number(id), cookie, limit: 50 });
      if (trackResult?.body?.songs) {
        raw.tracks = trackResult.body.songs;
      }
    }

    res.json({ playlist: mapPlaylist(raw) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;