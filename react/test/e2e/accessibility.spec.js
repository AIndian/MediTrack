import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { medicine } from '../support/fixtures.js';
import { storageKey } from '../../src/store.js';

test('all ten screens reflow at 200%, have labeled targets, and pass axe checks', async ({ page }, testInfo) => {
  await page.clock.install({ time: new Date('2026-10-08T12:00:00-07:00') });
  await page.addInitScript(({ medicine, storageKey }) => {
    localStorage.setItem(storageKey, JSON.stringify({
      medicines: [medicine], doses: { '2026-10-08|1|08:00': 'Taken' }, textScale: 2,
      symptoms: [{ name: 'Sample headache', severity: 'Mild', notes: 'Sample notes', date: '2026-10-08T18:00:00.000Z' }],
    }));
  }, { medicine, storageKey });

  async function checkScreen(title) {
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeFocused();
    const overflow = await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth);
    expect(overflow, `${title} must not scroll sideways`).toBeLessThanOrEqual(1);
    if (testInfo.project.name !== 'phone') {
      const labelHeight = await page.getByRole('link', { name: 'Medicines', exact: true }).evaluate((link) => {
        const range = document.createRange();
        range.selectNodeContents(link);
        return range.getBoundingClientRect().height;
      });
      expect(labelHeight, 'Navigation labels stay on one line at 200%').toBeLessThan(48);
    }
    const targets = page.locator('button, input, select, textarea, .button, .primary-nav a, .brand, .back-link');
    for (const target of await targets.all()) {
      const size = await target.boundingBox();
      expect(size.width, `${title}: ${await target.textContent()} width`).toBeGreaterThanOrEqual(48);
      expect(size.height, `${title}: target height`).toBeGreaterThanOrEqual(48);
    }
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations, `${title}: ${JSON.stringify(result.violations)}`).toEqual([]);
  }

  for (const [route, title] of [
    ['/', 'Today'], ['/medicines', 'Your medicines'], ['/medicines/1', 'Medicine details'],
    ['/dose/1/08:00', 'Dose details'], ['/history', 'Dose history'],
    ['/symptoms', 'Symptoms'], ['/summary', 'Appointment summary'], ['/settings', 'Settings & sharing'],
    ['/medicines/new', 'Add medicine'],
  ]) {
    await page.goto(`/#${route}`);
    await checkScreen(title);
    if (title === 'Today') await page.screenshot({ path: testInfo.outputPath('today-200.png'), fullPage: true });
  }
  await page.getByLabel('Medicine name', { exact: true }).fill('Another sample medicine');
  await page.getByLabel('Strength / dosage', { exact: true }).fill('5 mg');
  await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
  await checkScreen('Review medicine');
  await page.screenshot({ path: testInfo.outputPath('review-200.png'), fullPage: true });
});

test('keyboard navigation, browser history and saved records survive a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  const start = page.url();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  expect(page.url()).toBe(start);

  await page.getByRole('link', { name: 'Add medicine', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Add medicine', level: 1 })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Medicine name', { exact: true })).toBeFocused();
  await page.keyboard.type('Keyboard sample');
  await page.keyboard.press('Tab');
  await page.keyboard.type('5 mg');
  await page.getByRole('button', { name: 'Review medicine', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Review medicine', level: 1 })).toBeFocused();
  await page.getByRole('button', { name: 'Save medicine', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Medicine details', level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Today', exact: true }).click();
  await page.getByRole('button', { name: 'Mark Taken', exact: true }).click();
  await page.reload();
  await expect(page.getByText('Status: Taken', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: 'Skipped', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Today', level: 1 })).toBeFocused();
  await expect(page.getByText('Status: Skipped', { exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Dose history', level: 1 })).toBeFocused();
});

test('browser text settings above 200% are respected without horizontal overflow', async ({ page }) => {
  await page.goto('/#/settings');
  await page.getByRole('slider').focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuetext', '200%');
  await page.addStyleTag({ content: ':root { font-size: 125%; }' });
  await expect(page.locator('.app')).toHaveCSS('font-size', '40px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.getByRole('checkbox', { name: /Larger text/ }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuetext', '100%');
  await expect(page.locator('.app')).toHaveCSS('font-size', '20px');
});

test('downloads corrupt data and resets only after confirmation without touching Flutter records', async ({ page }) => {
  const raw = JSON.stringify({ medicines: [medicine], doses: { bad: 'Taken' }, symptoms: [] });
  await page.addInitScript(({ storageKey, raw }) => {
    localStorage.setItem(storageKey, raw);
    localStorage.setItem('meditrack.v1', 'Sample Flutter records');
  }, { storageKey, raw });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Could not load data');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download saved JSON' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('meditrack-react-backup.json');
  expect(await readFile(await download.path(), 'utf8')).toBe(raw);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset saved data' }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(raw);
  await expect(page.getByRole('alert')).toContainText('Could not load data');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset saved data' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('meditrack.v1'))).toBe('Sample Flutter records');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('link', { name: 'Add medicine', exact: true }).click();
  await expect(page.getByLabel('Medicine name', { exact: true })).toBeEnabled();
});
