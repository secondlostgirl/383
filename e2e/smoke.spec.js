const { test, expect } = require('@playwright/test');

test('home page loads and reaches the API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /child development platform/i })).toBeVisible();
  await expect(page.getByText('API: ok')).toBeVisible();
});

// Walking skeleton (M4-01): seeded task travels SQLite → Express → React
test('home page lists the seeded sample task', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('listitem').filter({ hasText: 'Read a picture book for 15 minutes' })).toBeVisible();
});
