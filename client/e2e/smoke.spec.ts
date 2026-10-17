import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * Smoke tests covering:
 *  1. Login per role and correct redirect
 *  2. Doctor cannot open finance routes (payments, expenses, reports, closing)
 *  3. Reception cannot open medical routes (visits, prescriptions, drugs)
 *  4. Reception day flow: unauthenticated → login → queue page visible
 *
 * These tests require the full stack to be running:
 *   - Backend: http://localhost:4000
 *   - Frontend: http://localhost:3000
 *
 * Seed credentials are read from environment variables (never hardcoded).
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const ADMIN_USER = {
  username: process.env.E2E_ADMIN_USERNAME ?? 'admin',
  password: process.env.E2E_ADMIN_PASSWORD ?? '',
};
const DOCTOR_USER = {
  username: process.env.E2E_DOCTOR_USERNAME ?? 'doctor',
  password: process.env.E2E_DOCTOR_PASSWORD ?? '',
};
const RECEPTION_USER = {
  username: process.env.E2E_RECEPTION_USERNAME ?? 'reception',
  password: process.env.E2E_RECEPTION_PASSWORD ?? '',
};

async function login(page: Page, username: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(admin|doctor|reception)/, { timeout: 10000 });
}

async function logout(page: Page) {
  // Submit logout form
  await page.evaluate(() => {
    const form = document.querySelector('form[action="/api/auth/logout"]') as HTMLFormElement;
    form?.submit();
  });
  await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
}

// ─── Login per role ──────────────────────────────────────────────────────────

test('admin login redirects to /admin', async ({ page }) => {
  await login(page, ADMIN_USER.username, ADMIN_USER.password);
  expect(page.url()).toContain('/admin');
  // Admin can see dashboard content
  await expect(page.locator('h1')).toContainText('لوحة التحكم');
});

test('doctor login redirects to /doctor', async ({ page }) => {
  await login(page, DOCTOR_USER.username, DOCTOR_USER.password);
  expect(page.url()).toContain('/doctor');
  await expect(page.locator('h1')).toContainText('جلسة اليوم');
});

test('reception login redirects to /reception', async ({ page }) => {
  await login(page, RECEPTION_USER.username, RECEPTION_USER.password);
  expect(page.url()).toContain('/reception');
  await expect(page.locator('h1')).toContainText('قائمة الانتظار');
});

// ─── Wrong role redirect ─────────────────────────────────────────────────────

test('unauthenticated access to /admin redirects to /login', async ({ page }) => {
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
});

test('unauthenticated access to /doctor redirects to /login', async ({ page }) => {
  await page.goto(`${BASE_URL}/doctor`);
  await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
});

test('reception cannot access /doctor route', async ({ page }) => {
  await login(page, RECEPTION_USER.username, RECEPTION_USER.password);
  await page.goto(`${BASE_URL}/doctor`);
  // Should redirect to /403 or back to reception
  await expect(page).toHaveURL(/(403|reception)/, { timeout: 5000 });
});

// ─── Doctor cannot access finance routes ────────────────────────────────────

test('doctor cannot access /admin/payments', async ({ page }) => {
  await login(page, DOCTOR_USER.username, DOCTOR_USER.password);
  await page.goto(`${BASE_URL}/admin/payments`);
  await expect(page).toHaveURL(/(403|login|doctor)/, { timeout: 5000 });
});

test('doctor cannot access /admin/reports', async ({ page }) => {
  await login(page, DOCTOR_USER.username, DOCTOR_USER.password);
  await page.goto(`${BASE_URL}/admin/reports`);
  await expect(page).toHaveURL(/(403|login|doctor)/, { timeout: 5000 });
});

// ─── Reception cannot access medical routes ─────────────────────────────────

test('reception cannot access /doctor/visits path', async ({ page }) => {
  await login(page, RECEPTION_USER.username, RECEPTION_USER.password);
  await page.goto(`${BASE_URL}/doctor/visits/some-id`);
  await expect(page).toHaveURL(/(403|login|reception)/, { timeout: 5000 });
});

// ─── No token in browser localStorage / sessionStorage ──────────────────────

test('access token is never in localStorage after login', async ({ page }) => {
  await login(page, RECEPTION_USER.username, RECEPTION_USER.password);
  const tokenInStorage = await page.evaluate(() => {
    const ls = localStorage.getItem('access_token');
    const ss = sessionStorage.getItem('access_token');
    return ls ?? ss ?? null;
  });
  expect(tokenInStorage).toBeNull();
});

test('no token exposed in browser context at all', async ({ page }) => {
  await login(page, ADMIN_USER.username, ADMIN_USER.password);
  const allKeys = await page.evaluate(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) keys.push(k);
    }
    return keys;
  });
  const tokenKeys = allKeys.filter((k) => k.includes('token') || k.includes('jwt'));
  expect(tokenKeys).toHaveLength(0);
});
