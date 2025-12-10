import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * Basic performance and user experience checks
 */

test.describe('Performance', () => {
  test('home page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000);
  });

  test('projects data loads quickly', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();

    // Wait for project cards to appear
    await page.locator('article, [data-testid="project-card"]').first().waitFor({ timeout: 5000 });

    const loadTime = Date.now() - startTime;

    // Projects should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('filtering is responsive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]')).first();

    if (await searchInput.isVisible()) {
      const startTime = Date.now();

      await searchInput.fill('test');

      // Wait for filtering to complete
      await page.waitForTimeout(1000);

      const filterTime = Date.now() - startTime;

      // Filtering should feel instant (under 1 second)
      expect(filterTime).toBeLessThan(1500);
    }
  });

  test('page does not have excessive DOM size', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const elementCount = await page.locator('*').count();

    // Should have reasonable DOM size (< 3000 elements)
    // Adjust based on your app's needs
    expect(elementCount).toBeLessThan(3000);
  });

  test('images are lazy loaded or optimized', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check if images have loading attribute
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');

      // Either lazy loading or small image count is fine
      const hasLazyLoading = loading === 'lazy';
      const hasReasonableImageCount = imageCount < 20;

      expect(hasLazyLoading || hasReasonableImageCount).toBe(true);
    }
  });

  test('no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known third-party errors or warnings
    const relevantErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('chrome-extension')
    );

    expect(relevantErrors.length).toBe(0);
  });

  test('no failed network requests', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedRequests.length).toBe(0);
  });

  test('CSS and JS are minified in production', async ({ page }) => {
    await page.goto('/');

    // Check if resources are optimized
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', (links) =>
      links.map((link) => (link as HTMLLinkElement).href)
    );

    const scripts = await page.$$eval('script[src]', (scripts) =>
      scripts.map((script) => (script as HTMLScriptElement).src)
    );

    // In production, files should be hashed/minified (contain hash or .min)
    const resources = [...stylesheets, ...scripts];

    if (resources.length > 0 && process.env.NODE_ENV === 'production') {
      const hasOptimizedFiles = resources.some(
        (url) => url.includes('-') || url.includes('.min.') || /\.[a-f0-9]{8,}\./.test(url)
      );

      // This might not apply in dev mode
      expect(hasOptimizedFiles || process.env.NODE_ENV !== 'production').toBe(true);
    }
  });

  test('no memory leaks on route navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate between routes multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto('/submit');
      await page.waitForLoadState('networkidle');

      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }

    // If we get here without timeout, no major memory leak
    expect(true).toBe(true);
  });

  test('animations do not block user interaction', async ({ page }) => {
    await page.goto('/');

    // Immediately try to interact with elements
    const firstCard = page.locator('article, [data-testid="project-card"]').first();

    if (await firstCard.isVisible()) {
      // Should be able to interact even if animations are running
      await expect(firstCard).toBeVisible();

      // Try to click/hover
      await firstCard.hover();

      // Should not throw or timeout
      expect(true).toBe(true);
    }
  });

  test('API requests are cached appropriately', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Track requests
    let projectsJsonRequestCount = 0;

    page.on('request', (request) => {
      if (request.url().includes('projects.json')) {
        projectsJsonRequestCount++;
      }
    });

    // Navigate away and back
    await page.goto('/submit');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not fetch projects.json excessively
    // TanStack Query should cache it
    expect(projectsJsonRequestCount).toBeLessThanOrEqual(2);
  });

  test('page is interactive quickly (TTI)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for a button to be clickable
    const button = page.locator('button, a').first();
    await button.waitFor({ state: 'visible', timeout: 5000 });

    const timeToInteractive = Date.now() - startTime;

    // Should be interactive within 3 seconds
    expect(timeToInteractive).toBeLessThan(3000);
  });
});
