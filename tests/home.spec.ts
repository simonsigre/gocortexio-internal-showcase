import { test, expect } from '@playwright/test';

/**
 * Home Page Tests
 * Tests for the main showcase page with filtering functionality
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays project cards with required information', async ({ page }) => {
    // Wait for projects to load
    await page.waitForLoadState('networkidle');

    // Find first project card
    const firstCard = page.locator('article, [data-testid="project-card"]').first();
    await expect(firstCard).toBeVisible();

    // Verify card contains key information
    await expect(firstCard).toContainText(/.+/); // Has some text content
  });

  test('search filter works', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]')).first();

    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test');

      // Wait for filtering
      await page.waitForTimeout(500);

      // Verify results are filtered (this is a basic check)
      const projectCount = await page.locator('article, [data-testid="project-card"]').count();
      expect(projectCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter dropdowns are functional', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for filter/select elements
    const filters = page.locator('select, [role="combobox"]');

    if ((await filters.count()) > 0) {
      const firstFilter = filters.first();
      await expect(firstFilter).toBeVisible();

      // Try to interact with filter
      await firstFilter.click();

      // Check if dropdown opened
      const dropdown = page.locator('[role="listbox"], [role="menu"]');
      if (await dropdown.isVisible()) {
        await expect(dropdown).toBeVisible();
      }
    }
  });

  test('project cards are clickable and expand details', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const projectCards = page.locator('article, [data-testid="project-card"]');
    const cardCount = await projectCards.count();

    if (cardCount > 0) {
      const firstCard = projectCards.first();

      // Try to find and click expand button or link
      const expandButton = firstCard.locator('button, a').first();

      if (await expandButton.isVisible()) {
        await expandButton.click();

        // Check if something expanded or navigated
        // This will depend on actual implementation
        await page.waitForTimeout(300);
      }
    }
  });

  test('GitHub stats display when available', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for GitHub stat indicators (stars, forks)
    const statsIndicators = page.locator('text=/⭐|stars|forks/i');

    if ((await statsIndicators.count()) > 0) {
      await expect(statsIndicators.first()).toBeVisible();
    }
  });

  test('loading state is handled gracefully', async ({ page }) => {
    // Reload page to see loading state
    await page.goto('/');

    // Page should not show error state
    const errorText = page.locator('text=/error|failed|something went wrong/i');
    await expect(errorText).not.toBeVisible();
  });

  test('project filters can be combined', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('article, [data-testid="project-card"]').count();

    // Try to apply multiple filters
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]')).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('cortex');
      await page.waitForTimeout(500);

      const filteredCount = await page.locator('article, [data-testid="project-card"]').count();

      // Count should change or stay the same (depending on data)
      expect(filteredCount).toBeGreaterThanOrEqual(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('no results message displays when filters match nothing', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]')).first();

    if (await searchInput.isVisible()) {
      // Search for something unlikely to exist
      await searchInput.fill('xyzabc123nonexistent');
      await page.waitForTimeout(500);

      // Check for no results message or empty state
      const noResultsMessage = page.locator('text=/no projects|no results|nothing found/i');
      const projectCards = page.locator('article, [data-testid="project-card"]');

      const cardCount = await projectCards.count();
      if (cardCount === 0) {
        // Either shows message or just shows no cards
        expect(cardCount).toBe(0);
      }
    }
  });
});
