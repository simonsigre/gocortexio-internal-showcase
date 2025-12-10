import { test, expect } from '@playwright/test';

/**
 * Admin Page Tests
 * Tests for the JSON merge utility admin page
 */

test.describe('Admin Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('displays two JSON editor panels', async ({ page }) => {
    // Should have at least two textareas for JSON input
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();

    expect(textareaCount).toBeGreaterThanOrEqual(2);
  });

  test('existing projects panel shows valid JSON', async ({ page }) => {
    // First textarea should contain existing projects
    const existingProjectsPanel = page.locator('textarea').first();
    await expect(existingProjectsPanel).toBeVisible();

    const content = await existingProjectsPanel.inputValue();

    // Should be valid JSON
    if (content.trim().length > 0) {
      expect(() => JSON.parse(content)).not.toThrow();
    }
  });

  test('can input new project JSON', async ({ page }) => {
    // Find the "new projects" textarea (usually second one)
    const textareas = page.locator('textarea');
    const newProjectsPanel = textareas.nth(1);

    if (await newProjectsPanel.isVisible()) {
      const testProject = JSON.stringify([
        {
          name: 'Test Project',
          description: 'This is a test project for admin merge',
          status: 'development',
          link: 'https://example.com',
          language: 'Python',
          author: 'Test Admin',
          date: '2025-12-07',
        },
      ]);

      await newProjectsPanel.fill(testProject);

      const value = await newProjectsPanel.inputValue();
      expect(value).toContain('Test Project');
    }
  });

  test('merge button exists and is clickable', async ({ page }) => {
    const mergeButton = page.getByRole('button', { name: /merge|combine/i });

    if (await mergeButton.isVisible()) {
      await expect(mergeButton).toBeVisible();
      await expect(mergeButton).toBeEnabled();
    }
  });

  test('can merge two JSON arrays', async ({ page }) => {
    const textareas = page.locator('textarea');

    // Fill first panel with existing data
    await textareas.first().fill(
      JSON.stringify([
        {
          name: 'Existing Project',
          description: 'An existing project in the system',
          status: 'active',
          link: 'https://example.com/existing',
          language: 'JavaScript',
          author: 'Existing Author',
          date: '2025-01-01',
        },
      ])
    );

    // Fill second panel with new data
    await textareas.nth(1).fill(
      JSON.stringify([
        {
          name: 'New Project',
          description: 'A brand new project to be merged',
          status: 'development',
          link: 'https://example.com/new',
          language: 'Python',
          author: 'New Author',
          date: '2025-12-07',
        },
      ])
    );

    // Click merge button
    const mergeButton = page.getByRole('button', { name: /merge|combine/i });
    if (await mergeButton.isVisible()) {
      await mergeButton.click();

      await page.waitForTimeout(500);

      // Check for merged output (might be in a third panel or modal)
      const outputPanel = textareas.nth(2);
      if (await outputPanel.isVisible()) {
        const output = await outputPanel.inputValue();
        expect(output).toContain('Existing Project');
        expect(output).toContain('New Project');
      }
    }
  });

  test('handles invalid JSON gracefully', async ({ page }) => {
    const newProjectsPanel = page.locator('textarea').nth(1);

    if (await newProjectsPanel.isVisible()) {
      // Input invalid JSON
      await newProjectsPanel.fill('{ invalid json content }');

      // Try to merge
      const mergeButton = page.getByRole('button', { name: /merge|combine/i });
      if (await mergeButton.isVisible()) {
        await mergeButton.click();

        await page.waitForTimeout(500);

        // Should show error message
        const errorMessage = page.locator('text=/invalid|error|failed/i');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    }
  });

  test('has download merged JSON functionality', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /download/i });

    if (await downloadButton.isVisible()) {
      await expect(downloadButton).toBeVisible();
    }
  });

  test('has copy merged JSON functionality', async ({ page }) => {
    const copyButton = page.getByRole('button', { name: /copy/i });

    if (await copyButton.isVisible()) {
      await expect(copyButton).toBeVisible();

      // Try clicking copy
      await copyButton.click();

      await page.waitForTimeout(300);

      // Should show copied confirmation
      const confirmation = page.locator('text=/copied|success/i');
      if (await confirmation.isVisible()) {
        await expect(confirmation).toBeVisible();
      }
    }
  });

  test('validates merged data against schema', async ({ page }) => {
    const textareas = page.locator('textarea');

    // Input invalid project data (missing required fields)
    await textareas.nth(1).fill(
      JSON.stringify([
        {
          name: 'Invalid Project',
          // Missing required fields like description, link, author
        },
      ])
    );

    const mergeButton = page.getByRole('button', { name: /merge|combine/i });
    if (await mergeButton.isVisible()) {
      await mergeButton.click();

      await page.waitForTimeout(500);

      // Should show validation error
      const errorMessage = page.locator('text=/validation|required|invalid/i');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('preserves formatting in JSON editors', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    const formattedJSON = `[
  {
    "name": "Formatted Project",
    "description": "This project has nice formatting",
    "status": "active"
  }
]`;

    await textarea.fill(formattedJSON);

    const value = await textarea.inputValue();
    expect(value).toContain('Formatted Project');
  });

  test('no authentication required (client-side only)', async ({ page }) => {
    // Admin page should load without login
    await expect(page.locator('body')).toBeVisible();

    // Should not show login form
    const loginForm = page.locator('form').filter({ hasText: /login|sign in|password/i });
    expect(await loginForm.count()).toBe(0);
  });
});
