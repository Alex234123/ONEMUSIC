const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');
const fs = require('fs');

// GPU 硬件加速已启用（不调用 disableHardwareAcceleration）

let mainWindow = null;
let apiProcess = null;
let staticServer = null;

const STATIC_PORT = 5174;
const API_PORT = 3001;

function startStaticServer() {
  const distPath = path.join(__dirname, '../dist');
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  staticServer = http.createServer((req, res) => {
    // API 请求代理到后端
    if (req.url && req.url.startsWith('/api/')) {
      const proxyReq = http.request(
        {
          hostname: 'localhost',
          port: API_PORT,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        },
      );
      proxyReq.on('error', () => {
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'API server unavailable' }));
      });
      req.pipe(proxyReq);
      return;
    }

    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  staticServer.listen(STATIC_PORT);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#000000',
    icon: path.join(__dirname, '../ONEMUSIC.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadURL(`http://localhost:${STATIC_PORT}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);

app.on('browser-window-created', (_, win) => {
  win.on('maximize', () => win.webContents.send('window:maximized-changed', true));
  win.on('unmaximize', () => win.webContents.send('window:maximized-changed', false));
});

app.whenReady().then(() => {
  // 生产模式：启动静态服务器 + API 后端
  if (!process.env.VITE_DEV_SERVER_URL) {
    startStaticServer();

    // 读取 .env 文件，将配置作为环境变量传给后端子进程
    const envPath = path.join(__dirname, '../.env');
    let envVars = { ...process.env };
    try {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (key && val) envVars[key] = val;
      }
      console.log('[env] Loaded', Object.keys(envVars).filter(k => k.startsWith('NETEASE')).length, 'NETEASE vars from .env');
    } catch (err) {
      console.error('[env] Failed to read .env:', err.message);
    }

    // 设置 NODE_PATH 让后端能 require NeteaseCloudMusicApi
    // extraResources 将 NCM 复制到 resources/node_modules/ 下
    const ncmPath = path.join(__dirname, '../../node_modules/NeteaseCloudMusicApi');
    if (fs.existsSync(ncmPath)) {
      envVars.NODE_PATH = path.join(ncmPath, '..');
    }

    const apiPath = path.join(__dirname, '../dist-api/server.cjs');
    apiProcess = fork(apiPath, [], {
      stdio: 'pipe',
      env: envVars,
    });
    apiProcess.stdout?.on('data', (d) => {
      const msg = d.toString().trim();
      console.log('[api]', msg);
      // 后端启动成功后再创建窗口
      if (msg.includes('Server ready') && !mainWindow) {
        createWindow();
      }
    });
    apiProcess.stderr?.on('data', (d) => console.error('[api]', d.toString().trim()));
    apiProcess.on('exit', (code) => {
      console.log(`[api] exited with code ${code}`);
      apiProcess = null;
    });

    // 超时保底：5 秒后无论后端是否 ready 都创建窗口
    setTimeout(() => {
      if (!mainWindow) createWindow();
    }, 5000);
    return; // 不走下面的 createWindow
  }

  createWindow();
});

app.on('before-quit', () => {
  if (apiProcess) {
    apiProcess.kill();
    apiProcess = null;
  }
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
