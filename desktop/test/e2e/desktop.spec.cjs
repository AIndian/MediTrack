const { test, expect, _electron: electron } = require('../../../react/node_modules/@playwright/test');
const AxeBuilder = require('../../../react/node_modules/@axe-core/playwright').default;
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const desktop = path.resolve(__dirname, '../..');
let app, page, profile, errors;

async function launch() {
  const env = { ...process.env, MEDITRACK_USER_DATA: profile };
  delete env.ELECTRON_RUN_AS_NODE;
  app = await electron.launch({
    executablePath: require('../../node_modules/electron'),
    args: [desktop],
    env,
  });
  page = await app.firstWindow();
  page.on('pageerror', (error) => errors.push(error.message));
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
}
async function nativeCommand(id) {
  await app.evaluate(({ Menu }, id) => Menu.getApplicationMenu().getMenuItemById(id).click(), id);
}
async function shot(testInfo, name) {
  const file = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(name, { path: file, contentType: 'image/png' });
}
async function axe(testInfo, state) {
  // Electron cannot create the extra browser tab used by axe's cross-origin-frame collector.
  const result = await new AxeBuilder({ page })
    .setLegacyMode(true)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  await testInfo.attach(`${state}-axe`, {
    body: JSON.stringify({ violations: result.violations, incomplete: result.incomplete }),
    contentType: 'application/json',
  });
  expect(result.violations).toEqual([]);
}
async function addMedicine(name = 'Desktop sample medicine') {
  await page.locator('#desktop-new').click();
  await page.getByLabel('Medicine name', { exact: true }).fill(name);
  await page.getByLabel('Strength / dosage', { exact: true }).fill('5 mg');
  await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
  await page.getByRole('button', { name: 'Save medicine', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Medicine details', exact: true })).toBeFocused();
}
test.beforeEach(async () => {
  app = null;
  page = null;
  profile = await fs.mkdtemp(path.join(os.tmpdir(), 'meditrack-e2e-'));
  errors = [];
  await launch();
});
test.afterEach(async ({}, testInfo) => {
  if (app) {
    try {
      if (page && !page.isClosed()) await shot(testInfo, 'final-state');
    } finally {
      await app
        .evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().forEach((window) => window.destroy()))
        .catch(() => {});
      await app.close().catch(() => {});
    }
  }
  expect(errors).toEqual([]);
  // Test profiles are deliberately retained in the OS temp folder for failed-run diagnosis.
});

test('1 medicine validation, native shortcuts, and persistence after restarting Electron', async ({}, testInfo) => {
  await page.keyboard.press('Control+n');
  await expect(page.getByRole('heading', { name: 'Add medicine', exact: true })).toBeFocused();
  await page.keyboard.press('Control+s');
  await expect(page.locator('#medicine-name')).toBeFocused();
  await expect(page.locator('#medicine-name')).toHaveAttribute('aria-invalid', 'true');
  await axe(testInfo, 'validation');
  await shot(testInfo, 'medicine-validation');
  await page.keyboard.type('Desktop sample medicine');
  await page.keyboard.press('Tab');
  await page.keyboard.type('5 mg');
  await page.keyboard.press('Control+s');
  await expect(page.getByRole('heading', { name: 'Review medicine', exact: true })).toBeFocused();
  await axe(testInfo, 'review');
  await shot(testInfo, 'medicine-review');
  await page.keyboard.press('Control+s');
  await expect(page.getByRole('heading', { name: 'Medicine details', exact: true })).toBeFocused();
  await app.close();
  app = null;
  await launch();
  await expect(page.getByRole('heading', { name: 'Desktop sample medicine', exact: true })).toBeVisible();
  await nativeCommand('find');
  await expect(page.locator('#medicine-search')).toBeFocused();
  await page.keyboard.type('no match');
  await expect(page.getByText('No medicines match. Try another name.')).toBeVisible();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('Desktop');
  await expect(page.getByRole('article')).toHaveCount(1);
});

test('2 Taken, Undo, Skip and a persisted history correction', async ({}, testInfo) => {
  await addMedicine();
  await page.locator('#nav-today').click();
  const dose = page.getByRole('article', { name: 'Desktop sample medicine at 08:00' });
  await dose.getByRole('button', { name: 'Mark Taken', exact: true }).click();
  await expect(dose.getByText('Status: Taken', { exact: true })).toBeVisible();
  await shot(testInfo, 'dose-taken');
  await dose.getByRole('button', { name: 'Undo last change' }).click();
  await expect(dose.getByText('Status: Due', { exact: true })).toBeVisible();
  await dose.getByRole('button', { name: 'Skip dose' }).click();
  await page.locator('#nav-history').click();
  await expect(page.getByRole('article').getByText('Status: Skipped')).toBeVisible();
  await page.getByRole('button', { name: 'Taken', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('article').getByText('Status: Taken')).toBeVisible();
  await axe(testInfo, 'history');
});

test('3 symptom data and dose totals reach the saved appointment summary', async ({}, testInfo) => {
  await addMedicine();
  await page.locator('#nav-today').click();
  await page.getByRole('button', { name: 'Mark Taken', exact: true }).click();
  await page.keyboard.press('Control+Shift+l');
  await page.getByLabel('Symptom', { exact: true }).fill('Sample tiredness');
  await page.getByLabel('Severity', { exact: true }).selectOption('Moderate');
  await page.getByLabel('Notes (optional)').fill('Fictional desktop test note.');
  await page.keyboard.press('Control+s');
  await expect(page.getByText('Symptom saved on this device.', { exact: true })).toBeVisible();
  await axe(testInfo, 'symptom');
  await shot(testInfo, 'saved-symptom');
  await nativeCommand('summary');
  await expect(page.getByText('1 recorded Taken · 0 recorded Skipped')).toBeVisible();
  await expect(page.getByText(/Sample tiredness · Moderate/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Fictional desktop test note/)).toBeVisible();
  await axe(testInfo, 'summary');
});

test('4 unsaved navigation and native window close keep the draft until explicit discard', async ({}, testInfo) => {
  await page.locator('#desktop-new').click();
  await page.locator('#medicine-name').fill('Unsaved draft');
  await page.locator('#nav-today').click();
  await expect(page.getByRole('dialog', { name: 'Leave this draft?' })).toBeVisible();
  await expect(page.locator('#desktop-dialog-title')).toBeFocused();
  await axe(testInfo, 'draft-dialog');
  await shot(testInfo, 'draft-protection');
  await page.keyboard.press('Escape');
  await expect(page.locator('#medicine-name')).toHaveValue('Unsaved draft');
  await app.evaluate(({ dialog, BrowserWindow }) => {
    globalThis.unloadPrompts = 0;
    dialog.showMessageBoxSync = () => {
      globalThis.unloadPrompts++;
      return 0;
    };
    BrowserWindow.getAllWindows()[0].close();
  });
  await expect.poll(() => app.evaluate(() => globalThis.unloadPrompts)).toBe(1);
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.reload());
  await expect.poll(() => app.evaluate(() => globalThis.unloadPrompts)).toBe(2);
  await expect(page.locator('#medicine-name')).toHaveValue('Unsaved draft');
  await page.locator('#nav-today').click();
  await page.getByRole('button', { name: 'Discard draft', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeFocused();
  await page.locator('#desktop-new').click();
  await expect(page.locator('#medicine-name')).toHaveValue('');
  await page.evaluate(() => {
    window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('Simulated disk failure');
    };
  });
  await page.locator('#medicine-name').fill('Recoverable sample medicine');
  await page.locator('#medicine-strength').fill('5 mg');
  await page.keyboard.press('Control+s');
  await expect(page.getByRole('heading', { name: 'Review medicine', exact: true })).toBeFocused();
  await page.keyboard.press('Control+s');
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await page.locator('#nav-symptom').click();
  await page.locator('#symptom-name').fill('Separate unsaved draft');
  await page.evaluate(() => {
    Storage.prototype.setItem = window.originalSetItem;
  });
  await page.getByRole('button', { name: 'Retry saving', exact: true }).click();
  await expect(page.getByText('Changes saved on this device.', { exact: true })).toBeVisible();
  await page.locator('#nav-today').click();
  await expect(page.getByRole('dialog', { name: 'Leave this draft?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#symptom-name')).toHaveValue('Separate unsaved draft');
  await shot(testInfo, 'recovered-save-retains-new-draft');
  await app.evaluate(({ dialog, BrowserWindow }) => {
    dialog.showMessageBoxSync = () => 1;
    BrowserWindow.getAllWindows()[0].webContents.reload();
  });
  await expect(page.locator('#symptom-name')).toHaveValue('');
});

test('5 desktop keyboard, modal focus, 200 percent text and isolated renderer', async ({}, testInfo) => {
  const preferences = await app.evaluate(({ BrowserWindow, Menu }) => ({
    preferences: BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(),
    menus: Menu.getApplicationMenu().items.map((item) => item.label),
  }));
  expect(preferences.preferences.nodeIntegration).toBe(false);
  expect(preferences.preferences.contextIsolation).toBe(true);
  expect(preferences.preferences.sandbox).toBe(true);
  expect(preferences.menus).toEqual(['&File', '&Edit', '&View', '&Go', '&Help']);
  expect(await page.evaluate(() => [typeof window.require, typeof window.process])).toEqual(['undefined', 'undefined']);
  await page.locator('#desktop-help').focus();
  await page.keyboard.press('F1');
  await expect(page.locator('#desktop-dialog-title')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await axe(testInfo, 'shortcut-help');
  await shot(testInfo, 'keyboard-shortcuts');
  await page.keyboard.press('Escape');
  await expect(page.locator('#desktop-help')).toBeFocused();
  await nativeCommand('settings');
  await page.getByLabel('Larger text').check();
  await expect(page.locator('.desktop-app')).toHaveAttribute('data-large', 'true');
  await nativeCommand('today');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await axe(testInfo, 'large-text');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.locator('#desktop-new').focus();
  await shot(testInfo, 'large-text-forced-colors');
  await page.evaluate(() => localStorage.setItem('meditrack.react.v1', '{bad'));
  await page.reload();
  await page.evaluate(() => {
    window.confirm = (message) => {
      window.resetConfirmation = message;
      return false;
    };
  });
  await page.getByRole('button', { name: 'Reset saved data', exact: true }).click();
  expect(await page.evaluate(() => window.resetConfirmation)).toContain('MediTrack Desktop records on this device');
  expect(await page.evaluate(() => localStorage.getItem('meditrack.react.v1'))).toBe('{bad');
});
