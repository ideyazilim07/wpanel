const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Uygulama veri dizini
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'wpanel.db');
const uploadsPath = path.join(userDataPath, 'uploads');

// Uploads dizini oluştur
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'WPanel - WhatsApp Müşteri İletişim Paneli',
    show: false
  });

  // Splash screen
  const splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, '../assets/icon.png')
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));

  // Backend server'ı başlat
  startServer().then(() => {
    // Ana sayfayı yükle
    mainWindow.loadURL('http://localhost:3000');
    
    mainWindow.once('ready-to-show', () => {
      splash.close();
      mainWindow.show();
    });
  }).catch(err => {
    console.error('Server başlatılamadı:', err);
    dialog.showErrorBox('Hata', 'Uygulama sunucusu başlatılamadı.');
    splash.close();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopServer();
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    // Python/Node server'ı başlat
    const serverScript = path.join(__dirname, 'server', 'app.js');
    
    serverProcess = spawn('node', [serverScript], {
      env: {
        ...process.env,
        DB_PATH: dbPath,
        UPLOADS_PATH: uploadsPath,
        PORT: '3000',
        NODE_ENV: 'production'
      },
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('Server running')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('error', (err) => {
      reject(err);
    });

    // Timeout
    setTimeout(() => {
      if (!serverProcess.killed) {
        resolve(); // Varsayalım ki çalışıyor
      }
    }, 5000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// App eventleri
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-db-path', () => {
  return dbPath;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});
