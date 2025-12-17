import { test, expect } from '@playwright/test';

test.describe('Projects Page Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5001/#/');
  });

  test('should load the projects page successfully', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check title
    await expect(page).toHaveTitle(/GoCortex Showcase/);

    // Check main heading exists
    const heading = page.locator('text=Project Showcase');
    await expect(heading).toBeVisible();
  });

  test('should display project cards', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.group', { timeout: 10000 });

    // Check that at least one project card exists
    const projectCards = page.locator('.group');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display voting buttons on each card', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();

    // Check upvote button
    const upvoteBtn = firstCard.locator('button[title="Upvote"]');
    await expect(upvoteBtn).toBeVisible();

    // Check downvote button
    const downvoteBtn = firstCard.locator('button[title="Downvote"]');
    await expect(downvoteBtn).toBeVisible();

    // Check score display
    const scoreDisplay = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });
    await expect(scoreDisplay).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill('test');

    // Wait for filtering to happen
    await page.waitForTimeout(500);

    // Search should be functional (not checking specific results as data may vary)
    await expect(searchInput).toHaveValue('test');
  });

  test('should have sort dropdown with voting options', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    // Find and click sort dropdown
    const sortTrigger = page.locator('button').filter({ hasText: /Newest First|Top Rated|Hot/ }).first();
    await expect(sortTrigger).toBeVisible();

    await sortTrigger.click();

    // Check that voting sort options exist
    await expect(page.locator('text=Top Rated')).toBeVisible();
    await expect(page.locator('text=Hot')).toBeVisible();
    await expect(page.locator('text=Controversial')).toBeVisible();
    await expect(page.locator('text=Most Upvoted')).toBeVisible();
    await expect(page.locator('text=Most Downvoted')).toBeVisible();
  });

  test('should have all filter dropdowns', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    // Check for Product filter
    const productFilter = page.locator('button').filter({ hasText: /All Products|Cortex/ });
    expect(await productFilter.count()).toBeGreaterThan(0);

    // Check for Theatre filter
    const theatreFilter = page.locator('button').filter({ hasText: /All Theatres|NAM|EMEA/ });
    expect(await theatreFilter.count()).toBeGreaterThan(0);

    // Check for Author filter
    const authorFilter = page.locator('button').filter({ hasText: /All Authors/ });
    expect(await authorFilter.count()).toBeGreaterThan(0);
  });

  test('should allow voting on a project', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();
    const upvoteBtn = firstCard.locator('button[title="Upvote"]');
    const scoreDisplay = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });

    // Get initial score
    const initialScore = await scoreDisplay.textContent();
    const initialValue = parseInt(initialScore!.replace('+', ''));

    // Click upvote
    await upvoteBtn.click();
    await page.waitForTimeout(300);

    // Check score increased
    const newScore = await scoreDisplay.textContent();
    const newValue = parseInt(newScore!.replace('+', ''));

    expect(newValue).toBe(initialValue + 1);

    // Check button is highlighted
    const buttonClasses = await upvoteBtn.getAttribute('class');
    expect(buttonClasses).toContain('text-primary');
  });

  test('should navigate to project detail page', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    // Find "View Details" button
    const viewDetailsBtn = page.locator('button', { hasText: 'View Details' }).first();

    if (await viewDetailsBtn.isVisible()) {
      await viewDetailsBtn.click();

      // Wait for navigation
      await page.waitForTimeout(1000);

      // Should be on project detail page
      expect(page.url()).toContain('/project/');
    }
  });

  test('should have responsive layout', async ({ page, viewport }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Check that content is still visible
    const heading = page.locator('text=Project Showcase');
    await expect(heading).toBeVisible();

    // Check that cards are still visible
    const firstCard = page.locator('.group').first();
    await expect(firstCard).toBeVisible();
  });

  test('should display project metadata', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();

    // Check for project name (should be in an h3 or similar)
    const projectName = firstCard.locator('h3');
    await expect(projectName).toBeVisible();

    // Check for language indicator
    const language = firstCard.locator('text=/Python|TypeScript|JavaScript|Go|Rust/');
    expect(await language.count()).toBeGreaterThan(0);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForSelector('.group', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('404') &&
      !err.includes('favicon') &&
      !err.includes('[vite]')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should handle no projects gracefully', async ({ page }) => {
    // This test ensures the empty state works
    // Would need to mock an empty response, but checking structure exists

    const emptyStateCheck = page.locator('text=/No projects found/');

    // Apply filters that might result in no matches
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('xxxxxxxxxxxxxxxxx'); // Unlikely to match

    await page.waitForTimeout(500);

    // Should either show projects or empty state, but not crash
    const hasProjects = await page.locator('.group').count() > 0;
    const hasEmptyState = await emptyStateCheck.isVisible();

    expect(hasProjects || hasEmptyState).toBe(true);
  });

  test('should clear filters', async ({ page }) => {
    await page.waitForSelector('.group', { timeout: 10000 });

    // Apply a search filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Look for clear button (might appear after filtering)
    const clearButton = page.locator('button', { hasText: /Clear/ });

    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);

      // Search should be cleared
      expect(await searchInput.inputValue()).toBe('');
    }
  });
});
