const { test, expect } = require('@playwright/test');

// M1 end to end: real backend (seeded DB), real JWT, real browser.
const PASSWORD = 'Demo1234!';

async function signIn(page, email, password = PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

for (const [role, email, path, heading] of [
  ['parent', 'elif.parent@demo.test', '/parent', 'Parent dashboard'],
  ['specialist', 'selin.specialist@demo.test', '/specialist', 'Specialist dashboard'],
  ['child', 'deniz.child@demo.test', '/child', 'My page'],
]) {
  test(`${role} signs in and lands on their own home screen`, async ({ page }) => {
    await signIn(page, email);

    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  });
}

test('wrong password shows an error and does not sign in', async ({ page }) => {
  await signIn(page, 'elif.parent@demo.test', 'wrong-password');

  await expect(page.getByRole('alert')).toHaveText('Invalid email or password.');
  await expect(page).toHaveURL('/login');
});

test('a child cannot open the parent screen', async ({ page }) => {
  await signIn(page, 'deniz.child@demo.test');
  await expect(page).toHaveURL('/child');

  await page.goto('/parent');

  await expect(page).toHaveURL('/child');
  await expect(page.getByRole('heading', { name: 'Parent dashboard' })).toHaveCount(0);
});

test('session survives a reload, and logout ends it', async ({ page }) => {
  await signIn(page, 'elif.parent@demo.test');
  await expect(page).toHaveURL('/parent');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Parent dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL('/login');

  await page.goto('/parent');
  await expect(page).toHaveURL('/login');
});
