const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createMenu } = require('../../electron/menu.cjs');

test('desktop menu routes every custom command and retains native editing roles', () => {
  const sent = [];
  let about = false;
  const menu = createMenu(
    (command) => sent.push(command),
    () => {
      about = true;
    },
    'win32',
  );
  assert.deepEqual(
    menu.map((item) => item.label),
    ['&File', '&Edit', '&View', '&Go', '&Help'],
  );
  const items = menu.flatMap((item) => item.submenu);
  for (const item of items.filter((item) => item.id)) item.click();
  assert.deepEqual(sent, [
    'new',
    'symptom',
    'find',
    'save',
    'today',
    'medicines',
    'history',
    'symptom',
    'summary',
    'settings',
    'help',
  ]);
  const keys = items.filter((item) => item.accelerator).map((item) => item.accelerator);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(
    items.filter((item) => item.accelerator).map(({ id, accelerator }) => [id, accelerator]),
    [
      ['new', 'CmdOrCtrl+N'],
      ['symptom', 'CmdOrCtrl+Shift+L'],
      ['find', 'CmdOrCtrl+F'],
      ['save', 'CmdOrCtrl+S'],
      ['today', 'CmdOrCtrl+1'],
      ['medicines', 'CmdOrCtrl+2'],
      ['history', 'CmdOrCtrl+3'],
      ['symptom', 'CmdOrCtrl+4'],
      ['summary', 'CmdOrCtrl+5'],
      ['settings', 'CmdOrCtrl+6'],
      ['help', 'F1'],
    ],
  );
  for (const role of ['undo', 'redo', 'cut', 'copy', 'paste', 'selectAll', 'zoomIn', 'zoomOut', 'resetZoom', 'close'])
    assert(items.some((item) => item.role === role));
  items.find((item) => item.label === 'About MediTrack').click();
  assert.equal(about, true);
});
test('macOS receives the platform application menu', () => {
  assert.equal(
    createMenu(
      () => {},
      () => {},
      'darwin',
    )[0].role,
    'appMenu',
  );
});
