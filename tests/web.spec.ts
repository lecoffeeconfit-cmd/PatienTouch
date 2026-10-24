import { expect, test } from '@playwright/test';
import { patientRoutes, therapistRoutes } from '../apps/web/lib/routes';
import { demoPatients, demoSessions } from '../packages/types/src/demo';

const routes = [
  ...therapistRoutes.map((route) => `/therapist/${route.slug}`),
  ...patientRoutes.map((route) => `/patient/${route.slug}`),
  ...demoPatients.map((patient) => `/therapist/patients/${patient.id}`),
  ...demoSessions.map((session) => `/therapist/sessions/${session.id}`),
  ...demoSessions
    .filter((session) => session.portalShared)
    .flatMap((session) => [
      `/patient/sessions/${session.id}`,
      `/patient/sessions/${session.id}/replay`,
    ]),
];

test('every workspace route compiles and renders a labeled synthetic shell', async ({
  request,
}) => {
  test.setTimeout(240_000);
  for (const path of routes) {
    await test.step(path, async () => {
      const response = await request.get(path);
      expect(response.status(), `${path} status`).toBe(200);
      const html = await response.text();
      expect(html, `${path} main landmark`).toContain('id="main-content"');
      expect(html, `${path} demo label`).toContain('Demo workspace');
      expect(html, `${path} synthetic label`).toContain('All people and records are synthetic');
      expect(html, `${path} heading`).toMatch(/<h1[^>]*>.+?<\/h1>/);
      expect(html, `${path} runtime error`).not.toContain('NEXT_HTTP_ERROR_FALLBACK;500');
    });
  }
});

test('authentication interfaces are explicit previews and reject private session URLs', async ({
  page,
  request,
}) => {
  for (const path of ['/login', '/register', '/forgot-password', '/recover-account']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(await response.text()).toContain('No production authentication is configured');
  }
  await page.goto('/login');
  await page.getByLabel('Sample email', { exact: true }).fill('synthetic@example.invalid');
  await page.getByLabel('Sample password', { exact: true }).fill('invented-sample-password');
  await page.getByRole('button', { name: 'Preview sign in' }).click();
  await expect(page.getByRole('status')).toContainText(
    'No account was created, authenticated, recovered, or emailed',
  );
  await page.getByRole('button', { name: 'Patient', exact: true }).click();
  await page.getByRole('link', { name: 'Enter patient demo' }).click();
  await expect(page).toHaveURL('/patient/home');
  const privateSession = await request.get('/patient/sessions/session-demo-3');
  expect(privateSession.status()).toBe(404);
  const missingPatient = await request.get('/therapist/patients/unknown-patient');
  expect(missingPatient.status()).toBe(404);
  const onboarding = await request.get('/onboarding');
  expect(onboarding.status()).toBe(200);
  expect(onboarding.url()).toContain('/therapist/onboarding');
});

test('therapist navigation, secondary navigation and patient role switch work', async ({
  page,
}) => {
  await page.goto('/therapist/today');
  await expect(page.getByRole('heading', { name: 'Good morning, Maya.' })).toBeVisible();
  await page.locator('.main-nav').getByRole('link', { name: 'Patients', exact: true }).click();
  await expect(page).toHaveURL('/therapist/patients');
  await page.getByRole('link', { name: 'Open Avery Morgan', exact: true }).click();
  await expect(page).toHaveURL('/therapist/patients/patient-demo-avery');
  await page.getByRole('button', { name: 'Practice & clinical' }).click();
  await page
    .locator('.extra-nav')
    .getByRole('link', { name: 'Psychotherapy notes', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Psychotherapy notes', exact: true, level: 1 }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Explore patient view' }).click();
  await expect(page).toHaveURL('/patient/home');
  await expect(page.getByRole('heading', { name: 'Welcome back, Avery.' })).toBeVisible();
  await page.locator('.main-nav').getByRole('link', { name: 'My Journey', exact: true }).click();
  await expect(page).toHaveURL('/patient/journey');
  await expect(
    page.getByRole('heading', { name: 'My Journey', exact: true, level: 1 }),
  ).toBeVisible();
});

test('selected profile and session details correspond to their route identifiers', async ({
  page,
}) => {
  await page.goto('/therapist/patients');
  await page.getByRole('link', { name: 'Open Jamie Park', exact: true }).click();
  await expect(page).toHaveURL('/therapist/patients/patient-demo-jamie');
  await expect(page.getByRole('heading', { name: 'Jamie Park', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Avery Morgan', exact: true })).toHaveCount(0);
  await page.goto('/patient/sessions');
  await page.getByRole('link', { name: /Finding a steadier rhythm/ }).click();
  await expect(page).toHaveURL('/patient/sessions/session-demo-2');
  await expect(
    page.getByRole('heading', { name: 'Finding a steadier rhythm', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Making room for what matters', exact: true }),
  ).toHaveCount(0);
});

test('a local appointment is added and resets on refresh', async ({ page }) => {
  await page.goto('/therapist/today');
  const rows = page.locator('.schedule-row');
  const initialCount = await rows.count();
  await page.getByRole('button', { name: 'New appointment', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'New sample appointment' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText('This is a local scheduling preview.', { exact: false }),
  ).toBeVisible();
  await dialog.getByLabel('Patient', { exact: true }).selectOption('patient-demo-jamie');
  await dialog.getByLabel('Date and time', { exact: false }).fill('2026-10-26T14:00');
  await dialog.getByRole('button', { name: 'Add sample appointment' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(rows).toHaveCount(initialCount + 1);
  await expect(page.getByRole('status')).toContainText('It resets on refresh');
  await page.reload();
  await expect(rows).toHaveCount(initialCount);
});

test('caseload and journey searches return matches and honest empty states', async ({ page }) => {
  await page.goto('/therapist/patients');
  await page.getByRole('searchbox', { name: 'Search your caseload' }).fill('Avery');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Avery Morgan');
  await page.getByRole('searchbox', { name: 'Search your caseload' }).fill('No fictional match');
  await expect(page.getByRole('heading', { name: 'No matching patients' })).toBeVisible();
  await page.goto('/patient/journey');
  await page.getByRole('searchbox', { name: 'Search moments and themes' }).fill('boundaries');
  await expect(page.locator('.timeline-card')).toHaveCount(1);
  await expect(page.locator('.timeline-card')).toContainText('Making room for what matters');
});

test('workspace search navigates and Escape dismisses its dialog', async ({ page }) => {
  await page.goto('/therapist/today');
  await page.getByRole('textbox', { name: 'Search the workspace' }).fill('calendar');
  const dialog = page.getByRole('dialog', { name: 'Find your way' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('textbox', { name: 'Search the workspace' }).fill('calendar');
  await dialog.getByRole('link', { name: /Calendar/ }).click();
  await expect(page).toHaveURL('/therapist/calendar');
});

test('journal reflections are labeled local and disappear on refresh', async ({ page }) => {
  await page.goto('/patient/journal');
  await expect(
    page.getByText('This preview is not a secure journal.', { exact: false }),
  ).toBeVisible();
  await page.getByLabel('A title for this moment').fill('A synthetic pause');
  await page.getByLabel('Your reflection').fill('This invented reflection is for testing only.');
  await page.getByRole('button', { name: 'Save sample reflection' }).click();
  await expect(page.getByRole('heading', { name: 'A synthetic pause' })).toBeVisible();
  await expect(page.getByText('Local preview', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A synthetic pause' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Room for your first thought' })).toBeVisible();
});

test('messages remain explicitly undelivered local previews', async ({ page }) => {
  await page.goto('/patient/messages');
  await expect(
    page.getByText('This demo is not monitored and does not deliver messages.', { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel('Sample message', { exact: true })
    .fill('An invented check-in for this test.');
  await page.getByRole('button', { name: 'Add to preview' }).click();
  await expect(page.locator('.message-own')).toContainText('An invented check-in for this test.');
  await expect(page.locator('.message-own')).toContainText('Not delivered');
  await expect(page.getByLabel('Sample message', { exact: true })).toHaveValue('');
  await page.reload();
  await expect(page.getByText('An invented check-in for this test.', { exact: true })).toHaveCount(
    0,
  );
});

test('mobile-width navigation stays reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/patient/home');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.locator('.main-nav').getByRole('link', { name: 'Messages', exact: false }).click();
  await expect(page).toHaveURL('/patient/messages');
  await expect(
    page.getByRole('heading', { name: 'Messages', exact: true, level: 1 }),
  ).toBeVisible();
});
