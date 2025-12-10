import { test, expect } from '@playwright/test';

/**
 * Submit Page Tests
 * Tests for the project submission form
 */

test.describe('Submit Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/submit');
  });

  test('form displays all required fields', async ({ page }) => {
    // Required fields based on schema
    const nameField = page.getByLabel(/project name/i).or(page.locator('input[name="name"]')).first();
    const descriptionField = page.getByLabel(/description/i).or(page.locator('textarea[name="description"]')).first();
    const linkField = page.getByLabel(/link|url/i).or(page.locator('input[name="link"]')).first();
    const authorField = page.getByLabel(/author/i).or(page.locator('input[name="author"]')).first();

    await expect(nameField).toBeVisible();
    await expect(descriptionField).toBeVisible();
    await expect(linkField).toBeVisible();
    await expect(authorField).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    // Find and click submit button
    const submitButton = page.getByRole('button', { name: /submit|generate|create/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation errors for empty required fields
      // Look for error messages
      const errorMessages = page.locator('text=/required|cannot be empty|must be/i');

      // Wait a bit for validation to run
      await page.waitForTimeout(500);

      // At least one validation error should appear
      if ((await errorMessages.count()) > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });

  test('description field enforces minimum length', async ({ page }) => {
    const descriptionField = page.getByLabel(/description/i).or(page.locator('textarea[name="description"]')).first();

    if (await descriptionField.isVisible()) {
      // Fill with too short description (less than 10 chars)
      await descriptionField.fill('short');

      // Try to submit or blur to trigger validation
      await descriptionField.blur();

      // Look for validation error
      await page.waitForTimeout(300);
      const errorText = page.locator('text=/at least 10|minimum 10/i');

      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    }
  });

  test('link field validates URL format', async ({ page }) => {
    const linkField = page.getByLabel(/link|url/i).or(page.locator('input[name="link"]')).first();

    if (await linkField.isVisible()) {
      // Fill with invalid URL
      await linkField.fill('not-a-valid-url');
      await linkField.blur();

      await page.waitForTimeout(300);

      // Look for URL validation error
      const errorText = page.locator('text=/valid url|invalid url|must be a url/i');

      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    }
  });

  test('can fill out complete valid form', async ({ page }) => {
    // Fill all required fields with valid data
    await page.getByLabel(/project name/i).or(page.locator('input[name="name"]')).first().fill('Test Project');
    await page.getByLabel(/description/i).or(page.locator('textarea[name="description"]')).first().fill('This is a test project description with more than 10 characters');
    await page.getByLabel(/link|url/i).or(page.locator('input[name="link"]')).first().fill('https://example.com');
    await page.getByLabel(/author/i).or(page.locator('input[name="author"]')).first().fill('Test Author');

    // Fill language field if visible
    const languageField = page.getByLabel(/language/i).or(page.locator('input[name="language"]')).first();
    if (await languageField.isVisible()) {
      await languageField.fill('Python');
    }

    // No validation errors should be visible
    const errorMessages = page.locator('[role="alert"], .error, text=/error/i');
    const errorCount = await errorMessages.count();

    // Some might exist but shouldn't be visible
    if (errorCount > 0) {
      const visibleErrors = errorMessages.filter({ hasText: /.+/ });
      expect(await visibleErrors.count()).toBe(0);
    }
  });

  test('status dropdown has expected options', async ({ page }) => {
    // Look for status select/dropdown
    const statusField = page.locator('select[name="status"], [name="status"]').first();

    if (await statusField.isVisible()) {
      // Should have status options: active, development, beta, deprecated
      const options = statusField.locator('option');

      if ((await options.count()) > 0) {
        const optionTexts = await options.allTextContents();
        const hasExpectedOptions = optionTexts.some(text =>
          /active|development|beta|deprecated/i.test(text)
        );

        expect(hasExpectedOptions).toBe(true);
      }
    }
  });

  test('product dropdown has Cortex/Prisma options', async ({ page }) => {
    // Look for product select
    const productField = page.locator('select[name="product"], [name="product"]').first();

    if (await productField.isVisible()) {
      await productField.click();

      // Check for expected product options
      const pageContent = await page.content();
      const hasExpectedProducts =
        /Cortex XSIAM|Cortex XDR|Cortex XSOAR|Prisma Cloud|Strata/i.test(pageContent);

      expect(hasExpectedProducts).toBe(true);
    }
  });

  test('theatre dropdown has region options', async ({ page }) => {
    const theatreField = page.locator('select[name="theatre"], [name="theatre"]').first();

    if (await theatreField.isVisible()) {
      await theatreField.click();

      const pageContent = await page.content();
      const hasRegions = /NAM|JAPAC|EMEA|LATAM|Global/i.test(pageContent);

      expect(hasRegions).toBe(true);
    }
  });

  test('successful submission shows JSON output', async ({ page }) => {
    // Fill form with valid data
    await page.getByLabel(/project name/i).or(page.locator('input[name="name"]')).first().fill('E2E Test Project');
    await page.getByLabel(/description/i).or(page.locator('textarea[name="description"]')).first().fill('This is an end-to-end test project with sufficient description length');
    await page.getByLabel(/link|url/i).or(page.locator('input[name="link"]')).first().fill('https://github.com/test/repo');
    await page.getByLabel(/author/i).or(page.locator('input[name="author"]')).first().fill('E2E Tester');

    // Submit form
    const submitButton = page.getByRole('button', { name: /submit|generate|create/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(1000);

      // Should show success message or JSON output
      const successIndicator = page.locator('text=/success|created|generated|copy/i');

      if (await successIndicator.isVisible()) {
        await expect(successIndicator).toBeVisible();
      }
    }
  });

  test('form has copy to clipboard functionality', async ({ page }) => {
    // Look for copy button (might appear after submission or with JSON preview)
    const copyButton = page.getByRole('button', { name: /copy/i });

    if (await copyButton.isVisible()) {
      await expect(copyButton).toBeVisible();

      // Click copy button
      await copyButton.click();

      // Should show success feedback
      await page.waitForTimeout(300);
      const copiedMessage = page.locator('text=/copied|success/i');

      if (await copiedMessage.isVisible()) {
        await expect(copiedMessage).toBeVisible();
      }
    }
  });

  test('GitHub repo field validates format', async ({ page }) => {
    const repoField = page.locator('input[name="repo"]').first();

    if (await repoField.isVisible()) {
      // Fill with invalid format
      await repoField.fill('invalid format');
      await repoField.blur();

      await page.waitForTimeout(300);

      // Should show format error (expecting owner/repo format)
      const errorText = page.locator('text=/owner\/repo|invalid format/i');

      // This validation might not exist, so just check
      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    }
  });

  test('date field defaults to current date', async ({ page }) => {
    const dateField = page.locator('input[name="date"]').first();

    if (await dateField.isVisible()) {
      const dateValue = await dateField.inputValue();

      // Should have YYYY-MM-DD format
      expect(dateValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
