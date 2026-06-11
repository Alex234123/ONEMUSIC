import axios from 'axios';
import crypto from 'crypto';

const NETEASE_BASE = 'https://interface.music.163.com/api';

interface RequestParams {
  [key: string]: string | number | undefined;
}

function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

function rsaEncrypt(text: string, pubKey: string): string {
  const encrypted = crypto.publicEncrypt(
    {
      key: pubKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(text),
  );
  return encrypted.toString('base64');
}

export function buildSignedParams(
  path: string,
  params: RequestParams,
  appId: string,
  appSecret: string,
  pubKey: string,
  privateKey: string,
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2, 10);

  // 签名
  const signStr = `app_id=${appId}&app_secret=${appSecret}&nonce=${nonce}&path=${path}&timestamp=${timestamp}`;
  const sign = crypto.createSign('RSA-SHA256').update(signStr).sign(privateKey, 'base64');

  // 加密 appSecret
  const encryptedSecret = rsaEncrypt(appSecret, pubKey);

  return {
    app_id: appId,
    timestamp,
    nonce,
    sign,
    app_secret: encryptedSecret,
    ...params,
  };
}

export async function neteaseRequest(
  path: string,
  params: RequestParams = {},
  cookie?: string,
) {
  const appId = process.env.NETEASE_APP_ID || '';
  const appSecret = process.env.NETEASE_APP_SECRET || '';
  const pubKey = process.env.NETEASE_PUB_KEY || '';
  const privateKey = process.env.NETEASE_PRIVATE_KEY || '';

  if (!appId || !appSecret) {
    // 降级到公共 API
    const { data } = await axios.get(`${NETEASE_BASE}${path}`, { params });
    return data;
  }

  const signedParams = buildSignedParams(path, params, appId, appSecret, pubKey, privateKey);

  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(signedParams)) {
    if (val !== undefined) searchParams.append(key, String(val));
  }

  const { data } = await axios.post(`${NETEASE_BASE}${path}`, searchParams.toString(), { headers });
  return data;
}