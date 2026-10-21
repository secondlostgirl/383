const { test, expect } = require('@playwright/test');

test('home page loads and reaches the API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /child development platform/i })).toBeVisible();
  await expect(page.getByText('API: ok')).toBeVisible();
});
