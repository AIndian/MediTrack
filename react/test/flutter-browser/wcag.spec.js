import { expect, test } from '@playwright/test';

test.use({ actionTimeout: 10000 });

async function enableSemantics(page) {
  const placeholder = page.locator('flt-semantics-placeholder');
  await placeholder
    .or(page.getByRole('heading', { level: 1, name: 'Today', exact: true }))
    .first()
    .waitFor({ state: 'attached' });
  if (await placeholder.count()) await placeholder.evaluate((element) => element.click());
  await expect(page.getByRole('heading', { level: 1, name: 'Today', exact: true })).toBeAttached();
}
async function activate(page, name) {
  const target = page.getByRole('button', { name, exact: true });
  await reveal(page, target, ['Today', 'Medicines', 'History', 'More'].includes(name), true);
  await target.click();
}
async function reveal(page, target, navigation = false, pointer = false) {
  if (!pointer && (await target.count())) return;
  const { width, height } = page.viewportSize();
  await page.mouse.move(width * 0.65, height * (navigation && width < 700 ? 0.9 : 0.45));
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      await expect(target).toBeAttached({ timeout: 300 });
      if (pointer) await target.click({ trial: true, timeout: 400 });
      return;
    } catch {
      await page.mouse.wheel(0, attempt === 0 ? -10000 : 400);
    }
  }
  throw new Error(`Could not reveal ${target}`);
}
async function fill(page, name, value) {
  await reveal(page, page.getByRole('textbox', { name, exact: true }));
  await tabTo(page, 'textbox', name);
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type(value, { delay: 20 });
}
async function tabTo(page, role, name) {
  const target = page.getByRole(role, { name, exact: true });
  for (let count = 0; count < 60; count++) {
    await page.keyboard.press('Tab');
    if (await target.count()) {
      try {
        await expect(target).toBeFocused({ timeout: 500 });
        return;
      } catch {
        /* Continue traversal. */
      }
    }
  }
  throw new Error(`Keyboard could not reach ${name}`);
}

for (const [width, height] of [
  [320, 1024],
  [1280, 256],
  [852, 393],
]) {
  test(`compiled Flutter complete process exposes names, roles and saved records at ${width}x${height}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await enableSemantics(page);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:[,.\s]|$)/);
    await activate(page, 'Add medicine');
    await expect(page.getByRole('heading', { level: 1, name: 'Add medicine', exact: true })).toBeAttached();
    await activate(page, 'Review medicine');
    await expect(page.getByRole('textbox', { name: /Medicine name/ })).toBeFocused();
    await fill(page, 'Medicine name', 'Browser sample');
    await fill(page, 'Strength / dosage', '5 mg');
    await activate(page, 'Review medicine');
    await expect(page.getByRole('heading', { level: 1, name: 'Review medicine', exact: true })).toBeAttached();
    await expect(page.getByRole('heading', { level: 2, name: 'Browser sample', exact: true })).toBeAttached();
    await activate(page, 'Save medicine');
    await expect(page.getByRole('heading', { level: 1, name: 'Today', exact: true })).toBeAttached();
    await activate(page, 'Medicines');
    await activate(page, 'Open Browser sample');
    await expect(page.getByRole('heading', { level: 1, name: 'Medicine details', exact: true })).toBeAttached();
    await activate(page, 'Edit medicine');
    await expect(page.getByRole('heading', { level: 1, name: 'Edit medicine', exact: true })).toBeAttached();
    await activate(page, 'Review medicine');
    await activate(page, 'Save medicine');
    await activate(page, 'Archive medicine');
    await activate(page, 'Restore medicine');
    await activate(page, 'Back');
    await activate(page, 'Today');
    await activate(page, 'Open Browser sample dose at 08:00');
    await expect(page.getByRole('heading', { level: 1, name: 'Medication reminder', exact: true })).toBeAttached();
    await activate(page, 'Mark Taken');
    await expect(page.locator('flt-semantics').getByText('Status: Taken', { exact: true })).toBeAttached();
    await activate(page, 'Undo last change');
    await expect(page.locator('flt-semantics').getByText('Status: Due', { exact: true })).toBeAttached();
    await activate(page, 'Skip dose');
    await activate(page, 'Back');
    await activate(page, 'View dose history');
    await activate(page, 'Due');
    await expect(page.locator('flt-semantics').getByText(/Browser sample.*Due/)).toBeAttached();
    await activate(page, 'Back');
    await activate(page, 'Log symptom');
    await fill(page, 'Symptom', 'Browser symptom');
    await activate(page, 'Save symptom');
    const success = page.locator('flt-semantics').getByText('Symptom saved on this device.', { exact: true });
    await reveal(page, success);
    await expect(success).toBeAttached();
    await page.reload();
    await enableSemantics(page);
    await activate(page, 'Log symptom');
    const savedSymptom = page.getByRole('heading', { name: 'Browser symptom', exact: true });
    await reveal(page, savedSymptom);
    await expect(savedSymptom).toBeAttached();
    await activate(page, 'Back');
    await activate(page, 'More');
    await expect(page.getByRole('heading', { name: 'Settings & sharing', exact: true })).toBeAttached();
    await activate(page, 'Set text size to 200%');
    await expect(page.getByRole('slider')).toHaveCount(0);
    const textSize = page.getByText('Text size: 200%', { exact: true });
    await reveal(page, textSize);
    await expect(textSize).toBeAttached();
    await activate(page, 'Appointment summary');
    await expect(page.getByRole('heading', { level: 1, name: 'Appointment summary', exact: true })).toBeAttached();
    await expect(page).toHaveTitle('Appointment summary · MediTrack');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('compiled Flutter supports keyboard navigation and review without pointer activation', async ({ page }) => {
  await page.goto('/');
  await enableSemantics(page);
  await tabTo(page, 'button', 'Add medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Add medicine', exact: true })).toBeAttached();
  await tabTo(page, 'textbox', 'Medicine name');
  await page.keyboard.type('Keyboard sample', { delay: 20 });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Strength / dosage', exact: true })).toBeFocused();
  await page.keyboard.type('5 mg', { delay: 20 });
  await tabTo(page, 'button', 'Review medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Review medicine', exact: true })).toBeAttached();
  await tabTo(page, 'button', 'Save medicine');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Today', exact: true })).toBeAttached();
});
