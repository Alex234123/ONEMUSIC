import type { Request, Response, NextFunction } from 'express';

export function cookieInject(req: Request, _res: Response, next: NextFunction) {
  // 优先使用请求 Header 中的 cookie（前端扫码登录后的 cookie）
  const headerCookie = req.headers['x-netease-cookie'] as string;
  if (headerCookie) {
    (req as any).neteaseCookie = headerCookie;
  } else {
    // 降级到 .env 中的静态 cookie
    const envCookie = process.env.NETEASE_COOKIE;
    if (envCookie) {
      (req as any).neteaseCookie = envCookie;
    }
  }
  next();
}