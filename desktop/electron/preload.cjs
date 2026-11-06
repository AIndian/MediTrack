const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mediTrackDesktop', {
  onCommand(callback) {
    const listener = (_event, command) => {
      if (typeof command === 'string') callback(command);
    };
    ipcRenderer.on('desktop:command', listener);
    return () => ipcRenderer.removeListener('desktop:command', listener);
  },
});
