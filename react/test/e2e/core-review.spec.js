import { expect, test } from '@playwright/test';
import { medicine } from '../support/fixtures.js';
import { storageKey } from '../../src/store.js';

test('creates and reloads a medicine on a real insecure HTTP origin', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('http://meditrack.test/**', async (route) => {
    const source = new URL(route.request().url());
    const response = await route.fetch({ url: `http://127.0.0.1:4173${source.pathname}${source.search}` });
    await route.fulfill({ response });
  });
  await page.goto('http://meditrack.test/#/medicines/new');
  expect(await page.evaluate(() => isSecureContext)).toBe(false);
  expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe('undefined');
  await page.getByLabel('Medicine name', { exact: true }).fill('HTTP sample');
  await page.getByLabel('Strength / dosage', { exact: true }).fill('5 mg');
  await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
  await page.getByRole('button', { name: 'Save medicine', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Medicine details' })).toBeFocused();
  const id = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).medicines[0].id, storageKey);
  expect(id).toMatch(/^[0-9a-f]{32}$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'HTTP sample', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('recovers from a render failure without clearing saved records', async ({ page }) => {
  const raw = JSON.stringify({ medicines: [medicine], doses: {}, symptoms: [], textScale: 1 });
  await page.addInitScript(({ raw, storageKey }) => {
    localStorage.setItem(storageKey, raw);
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => { throw new Error('Test ID failure'); } });
  }, { raw, storageKey });
  await page.goto('/#/medicines/new');
  await expect(page.getByRole('heading', { name: 'This page could not open' })).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(raw);
  await page.getByRole('button', { name: 'Return to Today' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeFocused();
  await expect(page.getByRole('article', { name: 'Sample medicine at 08:00' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(raw);
});

test('retains focus after Review retry, history removal, Undo and a second retry', async ({ page }) => {
  await page.goto('/#/medicines/new');
  await page.getByLabel('Medicine name', { exact: true }).fill('Focus sample');
  await page.getByLabel('Strength / dosage', { exact: true }).fill('5 mg');
  await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
  await page.evaluate(() => {
    window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await page.getByRole('button', { name: 'Save medicine', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.getByRole('heading', { level: 1, name: 'Review medicine' })).toBeVisible();
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Medicine details' })).toBeFocused();
  await page.getByRole('link', { name: 'Today', exact: true }).click();
  await page.getByRole('button', { name: 'Mark Taken' }).click();
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: 'Due', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo last removal' })).toBeFocused();
  await page.getByRole('button', { name: 'Undo last removal' }).click();
  await expect(page.getByText('Removal undone.', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Taken', exact: true })).toBeFocused();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: 'Skipped', exact: true }).click();
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByText('Changes saved on this device.', { exact: true })).toBeFocused();
});

test('localizes dates and aligns visual navigation with the tab sequence', async ({ browser }, testInfo) => {
  const page = await browser.newPage({ locale: 'fr-FR', timezoneId: 'America/Phoenix', viewport: testInfo.project.use.viewport });
  try {
    await page.clock.install({ time: new Date('2026-10-08T12:00:00-07:00') });
    await page.addInitScript((storageKey) => localStorage.setItem(storageKey, JSON.stringify({ medicines: [], doses: {}, symptoms: [], textScale: 2 })), storageKey);
    await page.goto('http://127.0.0.1:4173/');
    await expect(page.locator('main .eyebrow time')).toHaveText('jeudi 8 octobre 2026');
    await expect(page.locator('main .eyebrow time')).toHaveAttribute('datetime', '2026-10-08');
    const nav = await page.getByRole('navigation').boundingBox();
    const main = await page.getByRole('main').boundingBox();
    if (testInfo.project.name === 'phone') expect(nav.y + nav.height).toBeLessThanOrEqual(main.y + 1);
    else expect(nav.x + nav.width).toBeLessThanOrEqual(main.x + 1);
    await page.getByRole('link', { name: 'MediTrack home' }).focus();
    for (const name of ['Today', 'Medicines', 'History', 'More', 'Add medicine']) {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name, exact: true })).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  } finally {
    await page.close();
  }
});
