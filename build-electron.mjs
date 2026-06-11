import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await build({
    entryPoints: [
      path.join(__dirname, 'electron/main.ts'),
      path.join(__dirname, 'electron/preload.ts'),
    ],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outdir: path.join(__dirname, 'dist-electron'),
    format: 'esm',
    external: ['electron'],
    minify: true,
  });
  console.log('Electron main process built successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
