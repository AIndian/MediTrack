import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { med } from '../support/fixtures';
import { storageKey } from '../../src/store';

async function seed(page) {
  await page.addInitScript(({ med, storageKey }) => {
    if (localStorage.getItem(storageKey)) return;
    const day = new Date().toLocaleDateString('en-CA');
    localStorage.setItem(storageKey, JSON.stringify({ medicines: [med], doses: { [`${day}|1|08:00`]: 'Taken' }, symptoms: [], textScale: 1 }));
  }, { med, storageKey });
}

for (const spacing of [false, true]) {
  test(`all complete-process screens pass automated A/AA rules, spacing=${spacing}`, async ({ page }) => {
    await seed(page);
    await page.setViewportSize({ width: 320, height: 1024 });
    const routes = ['/', '/medicines', '/medicines/1', '/medicines/new', '/medicines/1/edit', 'review', '/dose/1/08:00', '/history', '/symptoms', '/summary', '/more'];
    for (const route of routes) {
      if (route === 'review') await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
      else await page.goto(`/#${route}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      if (spacing) await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations, route).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      expect(await page.locator('[id]').evaluateAll(nodes => {
        const ids = nodes.map(n => n.id); return ids.length === new Set(ids).size;
      })).toBe(true);
      expect(await page.locator('[aria-describedby]').evaluateAll(nodes => nodes.every(n =>
        n.getAttribute('aria-describedby').split(/\s+/).every(id => document.getElementById(id))))).toBe(true);
    }
  });
}

test('keyboard-only medicine creation, errors, review, dose undo and history correction', async ({ page }) => {
  await page.goto('/');
  async function tabTo(role, name) {
    const target = page.getByRole(role, { name, exact: true });
    for (let count = 0; count < 60; count++) {
      await page.keyboard.press('Tab');
      if (await target.evaluate(el => el === document.activeElement)) return;
    }
    throw new Error(`Keyboard could not reach ${name}`);
  }
  await tabTo('link', 'Add medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await tabTo('button', 'Review medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Medicine name', { exact: true })).toBeFocused();
  await page.keyboard.type('Keyboard sample');
  await page.keyboard.press('Tab');
  await page.keyboard.type('5 mg');
  await tabTo('button', 'Review medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review medicine');
  await tabTo('button', 'Save medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your medicines');
  await tabTo('link', 'Today');
  await page.keyboard.press('Enter');
  await tabTo('button', 'Mark Taken');
  await page.keyboard.press('Enter');
  await tabTo('button', 'Undo last change');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Mark Taken', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await tabTo('link', 'View dose history');
  await page.keyboard.press('Enter');
  await tabTo('button', 'Due');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Due');
});

test('pointer cancellation does not record a dose and focus stays visible in forced colors', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Skip dose', exact: true });
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(1, 1);
  await page.mouse.up();
  await expect(page.getByText('Status: Skipped', { exact: true })).toHaveCount(0);
  await page.emulateMedia({ forcedColors: 'active' });
  await page.keyboard.press('Tab');
  await button.focus();
  expect(await button.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
});
