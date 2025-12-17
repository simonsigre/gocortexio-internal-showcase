import { test, expect } from '@playwright/test';

test.describe('Voting System', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear localStorage before each test
    await context.clearCookies();
    await page.goto('http://localhost:5001/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should display voting buttons on project cards', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    // Check that upvote and downvote buttons exist
    const upvoteButton = page.locator('button[title="Upvote"]').first();
    const downvoteButton = page.locator('button[title="Downvote"]').first();

    await expect(upvoteButton).toBeVisible();
    await expect(downvoteButton).toBeVisible();
  });

  test('should increment vote count when upvoting', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    // Find the first project card
    const firstCard = page.locator('.group').first();
    const upvoteButton = firstCard.locator('button[title="Upvote"]');
    const scoreElement = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });

    // Get initial score
    const initialScore = await scoreElement.textContent();
    expect(initialScore).toBeTruthy();

    // Click upvote
    await upvoteButton.click();

    // Wait a bit for the UI to update
    await page.waitForTimeout(500);

    // Check that score increased
    const newScore = await scoreElement.textContent();
    const initialValue = parseInt(initialScore!.replace('+', ''));
    const newValue = parseInt(newScore!.replace('+', ''));

    expect(newValue).toBe(initialValue + 1);
  });

  test('should decrement vote count when downvoting', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();
    const downvoteButton = firstCard.locator('button[title="Downvote"]');
    const scoreElement = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });

    const initialScore = await scoreElement.textContent();
    expect(initialScore).toBeTruthy();

    // Click downvote
    await downvoteButton.click();

    await page.waitForTimeout(500);

    const newScore = await scoreElement.textContent();
    const initialValue = parseInt(initialScore!.replace('+', ''));
    const newValue = parseInt(newScore!.replace('+', ''));

    expect(newValue).toBe(initialValue - 1);
  });

  test('should toggle vote when clicking same button twice', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();
    const upvoteButton = firstCard.locator('button[title="Upvote"]');
    const scoreElement = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });

    const initialScore = await scoreElement.textContent();
    const initialValue = parseInt(initialScore!.replace('+', ''));

    // Click upvote
    await upvoteButton.click();
    await page.waitForTimeout(300);

    // Click upvote again (toggle off)
    await upvoteButton.click();
    await page.waitForTimeout(300);

    const finalScore = await scoreElement.textContent();
    const finalValue = parseInt(finalScore!.replace('+', ''));

    // Should return to initial value
    expect(finalValue).toBe(initialValue);
  });

  test('should persist votes across page reloads', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();
    const upvoteButton = firstCard.locator('button[title="Upvote"]');

    // Upvote
    await upvoteButton.click();
    await page.waitForTimeout(500);

    // Get the score after voting
    const scoreElement = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });
    const scoreAfterVote = await scoreElement.textContent();

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    // Check that vote persisted
    const firstCardAfterReload = page.locator('.group').first();
    const scoreElementAfterReload = firstCardAfterReload.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });
    const scoreAfterReload = await scoreElementAfterReload.textContent();

    expect(scoreAfterReload).toBe(scoreAfterVote);
  });

  test('should display sort options in filter bar', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    // Find and click the sort dropdown
    const sortTrigger = page.locator('button:has-text("Newest First"), button:has-text("Top Rated"), button:has-text("Hot")').first();
    await sortTrigger.click();

    // Check that sort options are visible
    await expect(page.locator('text=Top Rated')).toBeVisible();
    await expect(page.locator('text=Hot')).toBeVisible();
    await expect(page.locator('text=Controversial')).toBeVisible();
    await expect(page.locator('text=Most Upvoted')).toBeVisible();
    await expect(page.locator('text=Most Downvoted')).toBeVisible();
  });

  test('should sort projects by top rated', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    // Upvote the second project
    const secondCard = page.locator('.group').nth(1);
    const upvoteButton = secondCard.locator('button[title="Upvote"]');
    await upvoteButton.click();
    await page.waitForTimeout(500);

    // Open sort dropdown
    const sortTrigger = page.locator('button:has-text("Newest First")').first();
    await sortTrigger.click();

    // Select "Top Rated"
    await page.locator('text=Top Rated').click();
    await page.waitForTimeout(500);

    // The upvoted project should now be first
    const firstCardAfterSort = page.locator('.group').first();
    const scoreElement = firstCardAfterSort.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });
    const score = await scoreElement.textContent();
    const scoreValue = parseInt(score!.replace('+', ''));

    expect(scoreValue).toBeGreaterThan(0);
  });

  test('should limit user to one vote per project', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();
    const upvoteButton = firstCard.locator('button[title="Upvote"]');
    const downvoteButton = firstCard.locator('button[title="Downvote"]');
    const scoreElement = firstCard.locator('div.font-mono').filter({ hasText: /^[+-]?\d+$/ });

    const initialScore = await scoreElement.textContent();
    const initialValue = parseInt(initialScore!.replace('+', ''));

    // Upvote
    await upvoteButton.click();
    await page.waitForTimeout(300);

    let currentScore = await scoreElement.textContent();
    let currentValue = parseInt(currentScore!.replace('+', ''));
    expect(currentValue).toBe(initialValue + 1);

    // Try to downvote (should change vote from +1 to -1)
    await downvoteButton.click();
    await page.waitForTimeout(300);

    currentScore = await scoreElement.textContent();
    currentValue = parseInt(currentScore!.replace('+', ''));

    // Should be initial - 1 (removed upvote and added downvote)
    expect(currentValue).toBe(initialValue - 1);
  });

  test('should visually highlight active vote', async ({ page }) => {
    await page.waitForSelector('[data-testid="project-card"], .group', { timeout: 10000 });

    const firstCard = page.locator('.group').first();
    const upvoteButton = firstCard.locator('button[title="Upvote"]');

    // Click upvote
    await upvoteButton.click();
    await page.waitForTimeout(300);

    // Check that button has active styling (primary color class)
    const buttonClasses = await upvoteButton.getAttribute('class');
    expect(buttonClasses).toContain('text-primary');
  });
});
