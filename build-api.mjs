import { build } from 'esbuild';
import { cpSync, rmSync, existsSync } from 'fs';

build({
  entryPoints: ['api/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist-api/server.cjs',
  external: ['@vercel/node', 'NeteaseCloudMusicApi'],
  banner: {
    js: `process.env.NODE_ENV = process.env.NODE_ENV || "production";\n`,
  },
  logLevel: 'info',
}).then(() => {
  const ncmDest = 'dist-api/ncm';
  // 先清理旧目录
  if (existsSync(ncmDest)) {
    try { rmSync(ncmDest, { recursive: true, force: true }); } catch {}
  }
  cpSync('node_modules/NeteaseCloudMusicApi', ncmDest, { recursive: true });
  console.log('API bundled + NCM copied');
});
