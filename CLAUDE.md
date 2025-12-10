# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GoCortex Showcase** - A static site generator for showcasing Palo Alto Networks Cortex ecosystem projects. This is a **pure client-side application** with no backend server, despite the presence of server-related dependencies (leftover from template).

**Important:** There is NO Express server, NO database server, NO authentication system. All data is stored in JSON files and the site compiles to static HTML/CSS/JS deployed to GitHub Pages.

## Development Commands

```bash
# Development
npm run dev:client          # Start Vite dev server on port 5173

# Type Checking
npm run check               # Run TypeScript compiler check

# Testing
npm test                    # Run all Playwright tests
npm run test:ui             # Run tests with UI mode (recommended)
npm run test:smoke          # Run smoke tests only (fast)
npm run test:headed         # Run tests in headed mode
npm run test:debug          # Debug tests

# Production Build
npm run build               # Build static site (includes auto-import, validate, enrich, vite build)

# Build Scripts (CI/CD and Manual)
npm run import:repos        # Auto-import repos from watched GitHub organizations
npx tsx scripts/validate.ts # Content safety + dead link checks
npx tsx scripts/enrich.ts   # Fetch GitHub API stats (requires GITHUB_TOKEN)
```

**Note:** `npm run dev` starts an Express server that doesn't exist. Use `npm run dev:client` instead.

## Architecture

### Tech Stack
- **React 19.2** + **TypeScript 5.6** + **Vite 7**
- **Wouter 3.3** for client-side routing (hash-based for GitHub Pages)
- **TanStack Query 5.60** for data fetching
- **Tailwind CSS 4.1** + **shadcn/ui** (40+ components)
- **Zod 3.25** + **React Hook Form 7.66** for validation
- **Framer Motion 12.23** for animations

### Directory Structure
```
client/src/
  ├── pages/           # Routes: home, submit, admin, not-found
  ├── components/      # React components + ui/ (shadcn components)
  ├── hooks/           # React hooks
  └── lib/             # types.ts (Zod schemas), queryClient, utils

client/public/
  └── projects.json    # Main data store (source of truth)

scripts/
  ├── import-org-repos.ts  # Auto-imports repos from watched GitHub organizations
  ├── enrich.ts            # Fetches GitHub stats at build time
  ├── validate.ts          # Content safety + link validation
  └── build.ts             # Orchestrates the full build process
```

### Routing (Wouter)
- `/` - Home page with project showcase + filters
- `/submit` - Project submission form (generates JSON payload)
- `/admin` - JSON merge utility (no auth, client-side only)
- `*` - 404 page

**Hash-based routing** (`useHashLocation`) is used for GitHub Pages compatibility.

### Data Flow

**Automated (CI/CD):**
1. Push to main or scheduled trigger (every 6 hours)
2. Auto-import: Fetch all public repos from watched organizations
3. Validate: Content safety check + dead link detection
4. Enrich: Fetch GitHub API stats (stars, forks, license, etc.)
5. Build: Compile static site with Vite
6. Deploy: Upload to GitHub Pages

**Manual:**
1. Edit `client/public/projects.json` directly, OR
2. Use `/submit` page to generate JSON payload, OR
3. Run `npm run import:repos` to fetch latest repos
4. Commit changes to trigger deployment

**Runtime:**
Client fetches `/projects.json` at page load

### Project Schema (`client/src/lib/types.ts`)
```typescript
{
  name: string              // Required
  description: string       // Min 10 chars
  status: "active" | "development" | "beta" | "deprecated"
  link: string (URL)       // Required
  language: string          // Primary programming language
  repo?: string            // GitHub "owner/repo" format
  githubApi: boolean       // Enable GitHub API enrichment
  product?: "Cortex XSIAM" | "Cortex XDR" | "Cortex XSOAR" | "Prisma Cloud" | "Strata"
  author: string           // Required
  theatre?: "NAM" | "JAPAC" | "EMEA" | "LATAM" | "Global"
  usecase?: string
  date: string             // YYYY-MM-DD format

  // Build-time enriched fields
  stars?: number
  forks?: number
  lastUpdated?: string
  license?: string
  media?: { type: "image" | "youtube", url: string, alt: string }
}
```

## CI/CD Pipelines

### Deploy Workflow (`.github/workflows/deploy.yaml`)

**Trigger:** Push to `main` branch or manual dispatch

**Steps:**
1. Install dependencies (`npm ci`)
2. **Auto-Import** - Fetch all public repos from watched organizations
3. **Validate** - Content safety check + dead link detection for GitHub repos
4. **Enrich** - Fetch live GitHub stats (stars, forks, lastUpdated, license)
5. **Build** - `npx vite build --base /$REPO_NAME/`
6. **Deploy** - Upload to GitHub Pages

**Required Secret:** `GITHUB_TOKEN` (auto-provided by GitHub Actions)

### Repository Sync Workflow (`.github/workflows/sync-repos.yaml`)

**Trigger:**
- Scheduled: Every 6 hours (`0 */6 * * *`)
- Manual: workflow_dispatch

**Purpose:** Continuously monitors watched GitHub organizations for new/updated repositories

**Steps:**
1. Fetch all public repos from watched organizations
2. Auto-import new repos and update existing ones
3. Create a Pull Request with changes if detected
4. PR includes summary of new/updated projects

**Watched Organizations:**
- `Palo-Cortex` - Official Palo Alto Networks Cortex team repos

## Build Scripts

### `scripts/import-org-repos.ts` (NEW)
- **Auto-imports** all public repositories from watched GitHub organizations
- **Intelligent Product Detection:** Analyzes repo topics/description/name to determine product (XSIAM, XDR, XSOAR, Prisma Cloud, Strata)
- **Use Case Detection:** Identifies use cases (Automation, Testing, Monitoring, SOC Operations, etc.)
- **Status Detection:** Determines project status (active, development, beta, deprecated) based on update frequency and repo state
- **Preserves Manual Customizations:** Won't overwrite manually edited names, descriptions, or media
- **Deduplication:** Updates existing projects instead of creating duplicates
- Run manually: `npm run import:repos`

**Watched Organizations:**
- `Palo-Cortex` - Official Palo Alto Networks Cortex team repositories

**Add New Organizations:**
Edit the `WATCHED_ORGS` array in `scripts/import-org-repos.ts`:
```typescript
const WATCHED_ORGS = [
  'Palo-Cortex',
  'your-org-name'
];
```

### `scripts/validate.ts`
- **Content Safety:** Checks for offensive terms in name/description/author
- **Dead Link Detection:** Verifies GitHub repos with `githubApi: true` exist
- **Fails CI/CD if errors found**

### `scripts/enrich.ts`
- Fetches GitHub API data for projects with `githubApi: true`
- Updates `projects.json` with stars, forks, lastUpdated, license
- Syncs description and language from GitHub if available
- Requires `GITHUB_TOKEN` environment variable

### `scripts/build.ts`
- **Orchestrates** the complete build process
- Runs import → validate → enrich → vite build in sequence
- Used by both `npm run build` and CI/CD pipeline

## Key Files

### Pages (`client/src/pages/`)
- **home.tsx (5.5KB)** - Main showcase with filtering (product, theatre, author, usecase, period, search)
- **submit.tsx (16KB)** - Form to generate project JSON payload, opens GitHub issue
- **admin.tsx (6.2KB)** - Two-panel JSON editor for merging new projects (no auth)
- **not-found.tsx** - 404 page

### Components
- **layout.tsx** - Global header/footer/nav
- **project-card.tsx (9.1KB)** - Project display with collapsible descriptions, media preview, GitHub stats
- **filter-bar.tsx (5.5KB)** - Advanced filtering UI with search + 5 dropdowns
- **ui/** - 40+ shadcn/ui components (~5,753 lines total)

### Configuration
- **vite.config.ts** - Root: `client/`, Output: `dist/public/`, Aliases: `@/` → `client/src/`
- **client/src/lib/types.ts** - Zod schemas, constants (PRODUCTS, THEATRES, PROJECT_STATUS)
- **client/src/index.css** - Theme system with CSS variables (cyberpunk/tech aesthetic)

## Theme & Design

**Cyberpunk/Tech Aesthetic:**
- Primary color: `#00cd67` (bright green with glow effects)
- Custom fonts: JetBrains Mono (monospace), Rajdhani (display)
- CSS variables defined in `client/src/index.css`
- Grid backgrounds, glow effects, dark mode first

## Important Notes

### Unused Dependencies (Template Leftovers)
These are NOT used despite being in package.json:
- Express.js, passport, express-session (no server)
- PostgreSQL (pg, connect-pg-simple) (no database)
- drizzle-orm, drizzle-kit (no ORM)
- WebSocket (ws) (no real-time features)

### Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/` (directory doesn't exist)
- `@assets/` → `attached_assets/` (directory doesn't exist)

### GitHub Pages Deployment
- Base path is dynamic: `/$REPO_NAME/`
- Must use hash routing (no server-side routing)
- Static files output to `dist/public/`

## Making Changes

### Adding a New Project
1. Edit `client/public/projects.json` manually, OR
2. Use `/submit` page to generate JSON, then manually merge, OR
3. Use `/admin` page to merge JSON payloads

### Modifying Schema
1. Update Zod schema in `client/src/lib/types.ts`
2. Update form in `client/src/pages/submit.tsx`
3. Update project card in `client/src/components/project-card.tsx`
4. Update filters in `client/src/components/filter-bar.tsx` if needed

### Adding New Pages
1. Create file in `client/src/pages/`
2. Add route in `client/src/App.tsx` using Wouter
3. Add navigation link in `client/src/components/layout.tsx`

### Modifying Build Scripts
- Content safety rules: `scripts/validate.ts` (BAD_WORDS array)
- GitHub API enrichment: `scripts/enrich.ts`
- Both scripts run automatically in CI/CD

## Testing

### Test Suite Organization
The project uses Playwright for end-to-end testing. Tests are organized in `tests/`:

- **smoke.spec.ts** - Critical path smoke tests (tagged `@smoke`)
- **home.spec.ts** - Home page and filtering functionality
- **submit.spec.ts** - Project submission form validation
- **admin.spec.ts** - JSON merge utility
- **accessibility.spec.ts** - A11y compliance checks
- **performance.spec.ts** - Performance and UX metrics

### Running Tests Locally
```bash
# First time setup
npx playwright install

# Run all tests with UI (recommended for development)
npm run test:ui

# Run smoke tests only (fast)
npm run test:smoke

# Run specific test file
npx playwright test tests/home.spec.ts
```

### CI/CD Integration
- Tests run automatically on PRs and pushes to main
- Smoke tests run in parallel for quick feedback
- Full suite tests on Chromium, Firefox, and WebKit
- Test reports uploaded as artifacts on failure

### Adding New Tests
1. Create test file in `tests/` directory
2. Tag critical tests with `@smoke` for CI
3. Use semantic selectors: `getByRole()`, `getByLabel()`
4. Add `data-testid` attributes for complex components
5. See `tests/README.md` for detailed guidelines

### Test Artifacts
- **playwright-report/** - HTML reports with screenshots/videos
- **test-results/** - Raw test results and traces
