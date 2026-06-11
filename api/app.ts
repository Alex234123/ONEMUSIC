/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { cookieInject } from './middleware/auth.js';

import searchRoutes from './routes/search.js';
import playlistRoutes from './routes/playlist.js';
import songRoutes from './routes/song.js';
import lyricRoutes from './routes/lyric.js';
import recommendRoutes from './routes/recommend.js';
import topRoutes from './routes/top.js';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';

// CJS 打包时 __dirname 由 Node.js 提供；ESM 开发时从 import.meta 推导
declare const __import_meta_url: string | undefined;
const __dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(__import_meta_url ?? import.meta.url));

// load env — 指定从项目根目录加载 .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie 注入中间件
app.use('/api', cookieInject);

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/song', songRoutes);
app.use('/api/lyric', lyricRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/top', topRoutes);
app.use('/api/user', userRoutes);

// 专辑详情
app.get('/api/album', async (req: Request, res: Response) => {
  try {
    const ncm = (await import('./services/ncm.js')).default;
    const { mapSongs, mapAlbum } = await import('./services/mapper.js');
    const { id } = req.query;
    const cookie = (req as any).neteaseCookie || '';
    const result = await ncm.album({ id: Number(id), cookie });
    res.json({ album: mapAlbum(result?.body?.album), songs: mapSongs(result?.body?.songs) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 图片代理 — 绕开网易云 CDN 跨域限制，让 Canvas 能正常取色
 */
app.get('/api/image', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'url required' });
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'invalid url' });
    }
    const fetchResp = await fetch(url);
    if (!fetchResp.ok) return res.status(404).json({ error: 'image not found' });
    const buffer = Buffer.from(await fetchResp.arrayBuffer());
    const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 音频代理 — 服务端流式转发，支持 Range 请求
 * 避免 CDN Referer 检查导致的跨域问题
 */
app.get('/api/audio', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'url required' });
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'invalid url' });
    }

    // 转发 Range 头
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://music.163.com/',
    };
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const fetchResp = await fetch(url, { headers });

    if (!fetchResp.ok && fetchResp.status !== 206) {
      return res.status(fetchResp.status).json({ error: 'audio fetch failed' });
    }

    // 透传关键响应头
    const h = fetchResp.headers;
    res.setHeader('Content-Type', h.get('content-type') || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    // CORS 头：允许 Web Audio API 的 createMediaElementSource 访问音频数据
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (h.get('content-length')) res.setHeader('Content-Length', h.get('content-length')!);
    if (h.get('content-range')) {
      res.setHeader('Content-Range', h.get('content-range')!);
      res.status(206);
    }

    // 流式转发
    const reader = fetchResp.body?.getReader();
    if (!reader) return res.status(500).end();

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.write(value)) {
            await new Promise<void>((resolve) => res.once('drain', resolve));
          }
        }
      } catch {
        // 客户端断开
      } finally {
        res.end();
      }
    };

    pump();
    req.on('close', () => { reader.cancel().catch(() => {}); });
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

/**
 * health
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'ok' });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error.message);
  res.status(500).json({ success: false, error: 'Server internal error' });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API not found' });
});

export default app;