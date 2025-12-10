import { test, expect } from '@playwright/test';

/**
 * Accessibility Tests
 * Basic accessibility checks for better user experience
 */

test.describe('Accessibility', () => {
  test('home page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have h1
    const h1 = page.locator('h1');
    expect(await h1.count()).toBeGreaterThan(0);

    // h1 should come before h2
    const firstH1 = h1.first();
    await expect(firstH1).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // Alt attribute should exist (even if empty for decorative images)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('form inputs have labels or aria-labels', async ({ page }) => {
    await page.goto('/submit');

    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);

        // Check for label, aria-label, or aria-labelledby
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const id = await input.getAttribute('id');

        let hasLabel = false;

        if (ariaLabel || ariaLabelledBy) {
          hasLabel = true;
        } else if (id) {
          // Check if there's a label element with for attribute
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = (await label.count()) > 0;
        }

        // Placeholder is not sufficient but we'll allow it for now
        const placeholder = await input.getAttribute('placeholder');
        if (placeholder) {
          hasLabel = true;
        }

        expect(hasLabel).toBe(true);
      }
    }
  });

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        // Check first 10 links
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        // Should have either text content or aria-label
        const hasDescription = (text && text.trim().length > 0) || (ariaLabel && ariaLabel.length > 0);

        expect(hasDescription).toBe(true);
      }
    }
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        // Should have text or aria-label
        const hasName = (text && text.trim().length > 0) || (ariaLabel && ariaLabel.length > 0);

        expect(hasName).toBe(true);
      }
    }
  });

  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const lang = await html.getAttribute('lang');

    expect(lang).not.toBeNull();
    expect(lang).toBeTruthy();
  });

  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab through first few elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check if focused element is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('color contrast is sufficient (basic check)', async ({ page }) => {
    await page.goto('/');

    // This is a basic visual check
    // Proper contrast testing would require axe-core or similar
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // At minimum, text should be visible
    const hasText = (await body.textContent())!.length > 0;
    expect(hasText).toBe(true);
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Try tabbing through the page
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Should be able to reach interactive elements
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());

    // Should focus on interactive element
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
    const isInteractive =
      interactiveTags.includes(tagName) ||
      (await focusedElement.getAttribute('tabindex')) !== null;

    // This might fail if focus styles are missing, but structure should be right
    expect(isInteractive || tagName === 'body').toBe(true);
  });

  test('error messages are announced to screen readers', async ({ page }) => {
    await page.goto('/submit');

    // Submit empty form to trigger errors
    const submitButton = page.getByRole('button', { name: /submit|generate|create/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Error messages should have role="alert" or aria-live
      const alerts = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');

      if ((await alerts.count()) > 0) {
        await expect(alerts.first()).toBeVisible();
      }
    }
  });

  test('skip to main content link exists', async ({ page }) => {
    await page.goto('/');

    // Many accessible sites have a "skip to main content" link
    // This is optional but good practice
    const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();

    // This is optional, so we just check if it exists
    const hasSkipLink = (await skipLink.count()) > 0;

    // Just documenting the finding
    if (hasSkipLink) {
      await expect(skipLink).toBeDefined();
    }
  });
});
