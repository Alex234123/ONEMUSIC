// CJS 打包环境：从同目录下的 ncm/ 加载 NCM
// ESM 开发环境：从 node_modules 加载
let ncm: any;
try {
  ncm = require('./ncm/main.js');
} catch {
  ncm = require('NeteaseCloudMusicApi');
}

export default ncm;
