const { test, expect } = require('@playwright/test');

// M2 end to end: parent links and unlinks a specialist; the specialist's
// own view changes accordingly. Uses the seeded demo accounts.
const PASSWORD = 'Demo1234!';

async function signIn(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL('/login');
}

test('parent links and unlinks a specialist; the specialist gains and loses the child', async ({ browser }) => {
  const parent = await (await browser.newContext()).newPage();
  const specialist = await (await browser.newContext()).newPage();

  // Zeynep starts with no children
  await signIn(specialist, 'zeynep.specialist@demo.test');
  await expect(specialist.getByText(/You are not linked to any child yet/)).toBeVisible();

  // Parent links Zeynep to Deniz
  await signIn(parent, 'elif.parent@demo.test');
  await parent.getByRole('link', { name: 'Linked specialists' }).click();
  await parent.getByLabel('Specialist email').fill('zeynep.specialist@demo.test');
  await parent.getByLabel('Specialist type').selectOption({ label: 'Psychologist' });
  await parent.getByRole('button', { name: 'Link specialist' }).click();
  await expect(parent.getByRole('status')).toHaveText('Zeynep Sahin is now linked to Deniz Demir.');
  await expect(parent.getByRole('row', { name: /Zeynep Sahin/ })).toBeVisible();

  await specialist.reload();
  await expect(specialist.getByRole('listitem').filter({ hasText: 'Deniz Demir' })).toBeVisible();

  // Parent unlinks Zeynep after confirming
  await parent.getByRole('button', { name: 'Unlink Zeynep Sahin' }).click();
  await parent.getByRole('alertdialog').getByRole('button', { name: 'Unlink' }).click();
  await expect(parent.getByRole('status')).toContainText('Zeynep Sahin was unlinked');
  await expect(parent.getByRole('row', { name: /Zeynep Sahin/ })).toHaveCount(0);

  await specialist.reload();
  await expect(specialist.getByText(/You are not linked to any child yet/)).toBeVisible();
});

test('linking an unregistered email shows a clear error', async ({ page }) => {
  await signIn(page, 'elif.parent@demo.test');
  await page.goto('/parent/specialists');

  await page.getByLabel('Specialist email').fill('nobody@demo.test');
  await page.getByLabel('Specialist type').selectOption({ label: 'Doctor' });
  await page.getByRole('button', { name: 'Link specialist' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'No registered specialist uses this email. Ask them to create an account first.',
  );
});
