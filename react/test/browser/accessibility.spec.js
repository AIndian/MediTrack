import { expect, test } from '@playwright/test';
import { med } from '../support/fixtures';
import { storageKey } from '../../src/store';

for (const [width, height] of [[320, 1024], [1280, 256], [393, 852], [852, 393], [834, 1194], [1194, 834]]) {
  for (const textScale of [1, 2]) {
    test(`core screens reflow at ${width}×${height}, ${textScale * 100}% text`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ medicine, key, scale }) => {
        localStorage.setItem(key, JSON.stringify({
          medicines: [medicine], doses: { '2026-10-08|1|08:00': 'Taken' },
          symptoms: [{ name: 'Sample symptom', severity: 'Mild', notes: 'Sample notes', date: '2026-10-08T12:00:00' }],
          textScale: scale,
        }));
      }, { medicine: med, key: storageKey, scale: textScale });
      const screens = [
        ['/', 'Today'], ['/medicines', 'Your medicines'], ['/medicines/1', 'Medicine details'],
        ['/medicines/new', 'Add medicine'], ['/medicines/1/edit', 'Edit medicine'],
        ['review', 'Review medicine'], ['/dose/1/08:00', 'Medication reminder'],
        ['/history', 'Dose history'], ['/symptoms', 'Symptoms'], ['/summary', 'Appointment summary'],
        ['/more', 'Settings & sharing'],
      ];
      for (const [path, title] of screens) {
        if (path === 'review') await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
        else await page.goto(`/#${path}`);
        await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
        await expect(page.getByLabel(/Current time:/)).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), title).toBe(true);
        const undersized = await page.locator('button, a.button, nav a, input:not([type="checkbox"]), select, textarea, .check-label')
          .evaluateAll(elements => elements.filter(element => {
            const rect = element.getBoundingClientRect();
            return rect.width < 48 || rect.height < 48;
          }).map(element => element.textContent || element.getAttribute('id')));
        expect(undersized, `${title}: 48px minimum targets`).toEqual([]);
        const unlabeled = await page.locator('input, select, textarea').evaluateAll(elements =>
          elements.filter(element => !element.labels?.length && !element.getAttribute('aria-label')).map(element => element.id));
        expect(unlabeled, `${title}: labeled inputs`).toEqual([]);
        if (path === '/' && width === 393 && textScale === 1) {
          await page.screenshot({ path: 'reports/react-phone.png', fullPage: true });
        }
      }
      expect(errors).toEqual([]);
    });
  }
}

test('records locally without network and restores the saved dose after reload', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Add medicine', exact: true }).click();
  await page.getByLabel('Medicine name', { exact: true }).fill(med.name);
  await page.getByLabel('Strength / dosage', { exact: true }).fill(med.strength);
  await page.getByRole('button', { name: 'Review medicine', exact: true }).click();
  await page.getByRole('button', { name: 'Save medicine', exact: true }).click();
  await page.getByRole('link', { name: 'Today', exact: true }).click();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Mark Taken', exact: true }).click();
  await expect(page.getByText('1 of 1 doses recorded Taken')).toBeVisible();
  await page.getByRole('link', { name: 'Log symptom', exact: true }).click();
  await page.getByLabel('Symptom', { exact: true }).fill('Sample symptom');
  await page.getByRole('button', { name: 'Save symptom', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Symptom saved on this device.');
  await context.setOffline(false);
  await page.goto('/');
  await expect(page.getByText('1 of 1 doses recorded Taken')).toBeVisible();
  await page.getByRole('link', { name: 'Log symptom', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sample symptom' })).toBeVisible();
});
