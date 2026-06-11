import { Router, type Request, type Response } from 'express';
import ncm from '../services/ncm.js';

const router = Router();

router.get('/qr/key', async (_req: Request, res: Response) => {
  try {
    const result = await ncm.login_qr_key({});
    res.json({ success: true, unikey: result?.body?.data?.unikey || '' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/qr/create', async (req: Request, res: Response) => {
  try {
    const { key, qrimg = 'true' } = req.query;
    if (!key) { res.status(400).json({ success: false, error: 'key is required' }); return; }
    const result = await ncm.login_qr_create({ key: String(key), qrimg: String(qrimg) });
    res.json({
      success: true,
      qrurl: result?.body?.data?.qrurl || '',
      qrimg: result?.body?.data?.qrimg || '',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/qr/check', async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    if (!key) { res.status(400).json({ success: false, error: 'key is required' }); return; }
    const result = await ncm.login_qr_check({ key: String(key) });
    const code = result?.body?.code || 800;
    const cookie = result?.body?.cookie || '';
    // 800=过期 801=等待扫码 802=已扫码待确认 803=授权成功
    res.json({
      code,
      message:
        code === 801 ? '等待扫码' :
        code === 802 ? '已扫码待确认' :
        code === 803 ? '授权登录成功' :
        '二维码已过期',
      cookie: code === 803 ? cookie : '',
    });
  } catch (err: any) {
    res.status(500).json({ code: 800, error: err.message });
  }
});

router.get('/status', (req: Request, res: Response) => {
  const neteaseCookie = (req as any).neteaseCookie;
  res.json({ loggedIn: !!neteaseCookie });
});

// 获取当前登录用户信息
router.get('/account', async (req: Request, res: Response) => {
  try {
    const cookie = (req as any).neteaseCookie || '';
    if (!cookie) { res.json({ success: false, account: null, profile: null }); return; }
    const result = await ncm.user_account({ cookie });
    const account = result?.body?.account || null;
    const profile = result?.body?.profile || null;
    res.json({ success: true, account, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;