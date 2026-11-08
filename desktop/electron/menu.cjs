function createMenu(send, about, platform = process.platform) {
  const command = (id, label, accelerator) => ({ id, label, accelerator, click: () => send(id) });
  return [
    ...(platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    {
      label: '&File',
      submenu: [
        command('new', 'Add medicine', 'CmdOrCtrl+N'),
        command('symptom', 'Log symptom', 'CmdOrCtrl+Shift+L'),
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        command('find', 'Find medicine', 'CmdOrCtrl+F'),
        command('save', 'Review / save form', 'CmdOrCtrl+S'),
      ],
    },
    {
      label: '&View',
      submenu: [{ role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }, { role: 'togglefullscreen' }],
    },
    {
      label: '&Go',
      submenu: [
        ['today', 'Today'],
        ['medicines', 'Medicines'],
        ['history', 'History'],
        ['symptom', 'Symptoms'],
        ['summary', 'Appointment summary'],
        ['settings', 'Settings'],
      ].map(([id, label], index) => command(id, label, `CmdOrCtrl+${index + 1}`)),
    },
    {
      label: '&Help',
      submenu: [command('help', 'Keyboard shortcuts', 'F1'), { label: 'About MediTrack', click: about }],
    },
  ];
}
module.exports = { createMenu };
