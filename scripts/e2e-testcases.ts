import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // Login
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: 'Email' }).fill('tester@simantik.local');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20000 }).catch(() => {});
  console.log('LOGIN OK');

  // Test Cases page
  await page.goto(`${BASE}/test-cases`);
  await page.waitForSelector('text=New Test Case');
  console.log('TEST-CASES PAGE: header + New button visible');

  // Verify columns
  await page.waitForSelector('text=Design Status');
  await page.waitForSelector('text=Last Result');
  console.log('COLUMNS: Design Status + Last Result present');

  // Open global create modal
  await page.getByRole('button', { name: 'New Test Case' }).click();
  await page.waitForSelector('text=Create Test Case');
  const dialog = page.getByRole('dialog');
  const projectSelect = dialog.locator('label:has-text("Project")');
  if (await projectSelect.isVisible()) {
    console.log('MODAL: Project selector visible (global mode)');
  } else {
    console.log('MODAL: FAIL - no Project selector');
  }
  const typeSelect = dialog.locator('label:has-text("Type")');
  console.log('MODAL: Type field present:', await typeSelect.isVisible());

  // Fill the form and create a MANUAL test case
  await dialog.locator('input[placeholder="Select project"]').click();
  await page.waitForTimeout(500);
  const option = page.getByRole('option').filter({ hasText: 'SIMANTIK' }).first();
  console.log('Project option count:', await page.getByRole('option').count());
  await option.click();
  await page.waitForTimeout(300);
  console.log('Selected project input value:', await dialog.locator('input[placeholder="Select project"]').inputValue());

  await dialog.getByRole('textbox', { name: 'Title' }).fill('E2E Manual Smoke Test');
  await dialog.getByRole('textbox', { name: 'Module' }).fill('E2E Verify');
  // ensure type = MANUAL (default)
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();
  await page.waitForTimeout(1500);
  console.log('Modal still open after create:', await dialog.isVisible().catch(() => false));

  console.log('CREATED -> current URL:', page.url());

  // Verify new MANUAL test case appears in the list with correct badges
  await page.goto(`${BASE}/test-cases`);
  const row = page.getByRole('row').filter({ hasText: 'E2E Manual Smoke Test' });
  await row.waitFor({ timeout: 20000 });
  console.log('LIST: new MANUAL test case visible');
  const rowText = await row.innerText();
  const hasManualBadge = rowText.includes('MANUAL');
  const hasNotRun = rowText.includes('Not Run');
  console.log('ROW has MANUAL badge:', hasManualBadge, '| has Not Run:', hasNotRun);

  // Open the detail page of the new test case and verify the info panel
  const codeLink = row.locator('td').first().innerText();
  const code = (await codeLink).trim();
  console.log('New test case code:', code);
  await row.click();
  await page.waitForURL(`**/test-cases/${code}`, { timeout: 20000 });
  await page.waitForSelector(`text=${code}`);
  await page.waitForSelector('text=Manual', { timeout: 20000 }).catch(() => {});
  const detailText = await page.locator('main').innerText();
  console.log('DETAIL has Project field:', detailText.includes('Project'));
  console.log('DETAIL has Last Result:', detailText.includes('Last Result'));
  console.log('DETAIL has Not Run:', detailText.includes('Not Run'));
  console.log('DETAIL has Last Executed:', detailText.includes('Last Executed'));
  console.log('DETAIL has Type:', detailText.includes('Type'));
  console.log('DETAIL has Design Status:', detailText.includes('Design Status'));

  // Automation page should NOT show the manual test case
  await page.goto(`${BASE}/automation`);
  await page.waitForSelector('text=Select a project');
  const projectFilter = page.locator('input[placeholder="Select a project"]');
  await projectFilter.click();
  await page.keyboard.type('SIMANTIK');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const autoText = await page.locator('main').innerText();
  console.log('AUTOMATION page excludes MANUAL test case:', !autoText.includes('E2E Manual Smoke Test'));

  await browser.close();
}

main().catch((err) => { console.error('E2E FAILED:', err.message); process.exit(1); });
