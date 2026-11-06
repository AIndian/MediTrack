const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createMenu } = require('./menu.cjs');

app.setName('MediTrack Desktop');
app.setPath('userData', process.env.MEDITRACK_USER_DATA || path.join(app.getPath('appData'), 'MediTrack Desktop'));
const entry = path.join(__dirname, '..', 'dist', 'index.html');
const entryURL = pathToFileURL(entry).href;
let window;
let dirty = false;

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.show();
      window.focus();
    }
  });
  ipcMain.on('desktop:dirty', (event, value) => {
    if (
      event.sender === window?.webContents &&
      event.senderFrame === window.webContents.mainFrame &&
      typeof value === 'boolean'
    )
      dirty = value;
  });
  app
    .whenReady()
    .then(() => {
      window = new BrowserWindow({
        title: 'MediTrack Desktop',
        width: 1440,
        height: 1000,
        minWidth: 800,
        minHeight: 600,
        show: true,
        backgroundColor: '#f6faf9',
        webPreferences: {
          preload: path.join(__dirname, 'preload.cjs'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });
      window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      window.webContents.on('will-navigate', (event, url) => {
        if (url.split('#')[0] !== entryURL) event.preventDefault();
      });
      window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
      window.on('close', (event) => {
        if (!dirty) return;
        const response = dialog.showMessageBoxSync(window, {
          type: 'warning',
          title: 'Unsaved changes',
          message: 'Leave without saving?',
          detail: 'Your draft or changes that could not be saved will be lost.',
          buttons: ['Keep working', 'Discard and close'],
          defaultId: 0,
          cancelId: 0,
          noLink: true,
        });
        if (response !== 1) event.preventDefault();
      });
      Menu.setApplicationMenu(
        Menu.buildFromTemplate(
          createMenu(
            (command) => window.webContents.send('desktop:command', command),
            () =>
              dialog.showMessageBox(window, {
                type: 'info',
                title: 'MediTrack Desktop',
                message: `MediTrack Desktop ${app.getVersion()}`,
                detail:
                  'SWEN 661 desktop prototype. Use sample information. Local storage is not encrypted. Reminders, sync and external sharing are unavailable.',
              }),
          ),
        ),
      );
      return window.loadFile(entry);
    })
    .catch((error) => {
      console.error(error);
      app.quit();
    });
  app.on('window-all-closed', () => app.quit());
}
