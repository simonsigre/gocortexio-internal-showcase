import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Critical path testing
 * These tests verify basic functionality and page loads
 * Tagged with @smoke for quick CI runs
 */

test.describe('Smoke Tests @smoke', () => {
  test('Home page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.locator('h1')).toBeVisible();

    // Verify page title
    await expect(page).toHaveTitle(/GoCortex|Showcase/i);
  });

  test('Projects data loads and displays', async ({ page }) => {
    await page.goto('/');

    // Wait for projects to load (check for project cards)
    const projectCards = page.locator('[data-testid="project-card"]').or(page.locator('article')).first();
    await expect(projectCards).toBeVisible({ timeout: 30000 });

    // Verify at least one project is displayed
    const projects = page.locator('[data-testid="project-card"]').or(page.locator('article'));
    await expect(projects).not.toHaveCount(0);
  });

  test('Navigation links are present and functional', async ({ page }) => {
    await page.goto('/');

    // Check for navigation - look for common link text
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();

    // Test navigation to submit page
    const submitLink = page.getByRole('link', { name: /submit/i });
    if (await submitLink.isVisible()) {
      await submitLink.click();
      await expect(page).toHaveURL(/.*submit/);
    }
  });

  test('Submit page loads with form', async ({ page }) => {
    await page.goto('/submit');

    // Verify form is present
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check for key form fields
    await expect(page.getByLabel(/name/i).or(page.locator('input[name="name"]')).first()).toBeVisible();
    await expect(page.getByLabel(/description/i).or(page.locator('textarea[name="description"]')).first()).toBeVisible();
  });

  test('Admin page loads', async ({ page }) => {
    await page.goto('/admin');

    // Verify admin page elements
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for JSON editor or admin tools
    const textareas = page.locator('textarea');
    await expect(textareas.first()).toBeVisible();
  });

  test('404 page displays for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Check for 404 messaging
    await expect(page.locator('body')).toContainText(/404|not found/i);
  });

  test('Page is responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/');

    // Verify page loads on mobile
    await expect(page.locator('body')).toBeVisible();

    // Check viewport is mobile if testing mobile
    if (isMobile) {
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
    }
  });
});
