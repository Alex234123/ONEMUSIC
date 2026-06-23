// CJS 打包环境：从同目录下的 ncm/ 加载 NCM
// ESM 开发环境：从 node_modules 加载
let rawNcm: any;
try {
  rawNcm = require('./ncm/main.js');
} catch {
  rawNcm = require('NeteaseCloudMusicApi');
}

// 国内 IP — 绕过网易云"设备环境异常"检测
const REAL_IP = '116.25.146.47';

// Proxy 自动给所有 NCM 调用注入 realIP，无需改动各路由
const ncm = new Proxy(rawNcm, {
  get(target, prop: string) {
    const fn = target[prop];
    if (typeof fn !== 'function') return fn;
    return (args: Record<string, any> = {}) => fn({ ...args, realIP: REAL_IP });
  },
});

export default ncm;
