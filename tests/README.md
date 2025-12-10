# Playwright Test Suite

Comprehensive end-to-end testing for the GoCortex Showcase platform.

## Test Organization

### Smoke Tests (`smoke.spec.ts`)
**Purpose:** Critical path testing for CI/CD pipelines
**Tagged:** `@smoke`
**Scope:**
- Page loads (home, submit, admin, 404)
- Basic navigation
- Data loading
- Mobile responsiveness

**Run smoke tests only:**
```bash
npm run test:smoke
```

### Feature Tests

#### Home Page (`home.spec.ts`)
- Project card display and content
- Search functionality
- Filter dropdowns (product, theatre, author, usecase, period)
- Combined filtering
- Loading states
- Empty/no results states
- GitHub stats display

#### Submit Page (`submit.spec.ts`)
- Form field validation
- Required field checks
- URL validation
- Description length validation
- Dropdown options (status, product, theatre)
- Form submission
- JSON output generation
- Copy to clipboard functionality

#### Admin Page (`admin.spec.ts`)
- Dual JSON editor panels
- JSON merge functionality
- Invalid JSON handling
- Download merged JSON
- Copy merged JSON
- Schema validation
- Client-side only (no auth)

### Quality Tests

#### Accessibility (`accessibility.spec.ts`)
- Heading hierarchy
- Image alt text
- Form labels
- Link descriptions
- Button accessible names
- Language attribute
- Keyboard navigation
- Focus visibility
- Screen reader support

#### Performance (`performance.spec.ts`)
- Page load times
- Data loading speed
- Filter responsiveness
- DOM size
- Image optimization
- Console errors
- Network request failures
- Memory leaks
- Time to interactive (TTI)

## Running Tests

### Local Development

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm test

# Run with UI mode (recommended for development)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Run specific test file
npx playwright test tests/home.spec.ts

# Run tests matching pattern
npx playwright test --grep "form validation"
```

### CI/CD

Tests run automatically in GitHub Actions on:
- Pull requests
- Push to main branch

**CI Configuration:**
- Runs on: `ubuntu-latest`
- Browsers: Chromium only (for speed)
- Retries: 2 attempts on failure
- Artifacts: Test report, screenshots, videos

## Test Results

After running tests:

```bash
# View HTML report
npx playwright show-report
```

**Artifacts generated:**
- `playwright-report/` - HTML report with screenshots/videos
- `test-results/` - Raw test results and traces

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/route');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('selector');

    // Act
    await element.click();

    // Assert
    await expect(element).toHaveText('expected');
  });
});
```

### Best Practices

1. **Use semantic selectors:**
   ```typescript
   // Good
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email')

   // Avoid
   page.locator('.btn-primary')
   page.locator('#email-input')
   ```

2. **Add data-testid for complex components:**
   ```tsx
   <div data-testid="project-card">
   ```

3. **Wait for network idle on data-heavy pages:**
   ```typescript
   await page.goto('/', { waitUntil: 'networkidle' });
   ```

4. **Use soft assertions for non-critical checks:**
   ```typescript
   await expect.soft(element).toBeVisible();
   ```

5. **Tag smoke tests:**
   ```typescript
   test('critical test @smoke', async ({ page }) => {
     // ...
   });
   ```

## Configuration

See `playwright.config.ts` for:
- Base URL configuration
- Browser matrix
- Timeouts
- Screenshot/video settings
- Reporter configuration

## Troubleshooting

### Tests failing locally but passing in CI
- Check browser versions: `npx playwright install`
- Clear cache: `rm -rf playwright/.cache`

### Flaky tests
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Increase timeouts for slow operations
- Use `test.retry()` for known flaky tests

### Debugging
```bash
# Run with inspector
npm run test:debug

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Coverage Goals

- **Smoke tests:** < 2 minutes
- **Full suite:** < 10 minutes
- **Browser coverage:** Chromium, Firefox, WebKit
- **Mobile coverage:** iOS Safari, Android Chrome
- **Accessibility:** WCAG 2.1 Level AA compliance

## Integration with CI/CD

Tests are integrated into the deployment pipeline:

```yaml
# .github/workflows/test.yaml
- name: Run Playwright tests
  run: npm test
- name: Upload report
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Future Enhancements

- [ ] Visual regression testing (Playwright screenshots)
- [ ] API testing (when backend is added)
- [ ] Component testing with Playwright CT
- [ ] Lighthouse CI integration
- [ ] axe-core accessibility testing
- [ ] Load testing with k6
