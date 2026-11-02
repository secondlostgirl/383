const { test, expect } = require('@playwright/test');

test('home page loads and reaches the API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /child development platform/i })).toBeVisible();
  await expect(page.getByText('API: ok')).toBeVisible();
});

// Walking skeleton (M4-01): seeded task travels SQLite → Express → React.
// The API now requires a JWT, so sign in through the API and hand the token
// to the app the same way it stores it (localStorage "token").
test('home page lists the seeded sample task for a signed-in user', async ({ page, request }) => {
  const res = await request.post('/api/auth/login', {
    data: { email: 'elif.parent@demo.test', password: 'Demo1234!' },
  });
  expect(res.ok()).toBeTruthy();
  const { token } = await res.json();
  await page.addInitScript((t) => window.localStorage.setItem('token', t), token);

  await page.goto('/');

  await expect(page.getByRole('listitem').filter({ hasText: 'Read a picture book for 15 minutes' })).toBeVisible();
});
