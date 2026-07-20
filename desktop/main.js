const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 800,
    minWidth: 480,
    minHeight: 640,
    title: 'StudyQuest',
    icon: path.join(__dirname, 'app', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
    }
  });

  // Remove default top menu bar
  win.setMenuBarVisibility(false);

  // Load the built frontend index.html
  const indexPath = path.join(__dirname, 'app', 'index.html');


  // Check if we are running in dev mode or loaded from files
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(indexPath).catch(err => {
      console.error('Failed to load local HTML file:', err);
      // Fallback message if frontend isn't built yet
      win.loadURL('data:text/html,<html><body><h3 style="font-family:sans-serif;text-align:center;margin-top:20%;">Please build the frontend using `npm run build` in the frontend folder first!</h3></body></html>');
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
