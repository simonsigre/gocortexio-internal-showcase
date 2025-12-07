# Deployment Guide

This guide explains how to deploy the **GoCortex.io Internal Showcase** to GitHub Pages and details how the application functions end-to-end.

## End-to-End Architecture

This application is a **Static Single Page Application (SPA)** built with React and Vite. It is designed to run entirely in the user's browser with **no backend server**.

### How it Works

1.  **Static Hosting**:
    *   The build process compiles all React code, styles, and assets into static HTML, JavaScript, and CSS files.
    *   These files are hosted on GitHub Pages, which acts as a simple file server.
    *   When a user visits the site, their browser downloads the `index.html` and the bundled JavaScript.

2.  **Client-Side Routing**:
    *   The app uses `wouter` with **Hash Routing** (e.g., `/#/submit`).
    *   This is crucial for static hosting because GitHub Pages doesn't know how to handle dynamic URLs like `/submit`.
    *   The hash (`#`) keeps the routing logic entirely within the browser, ensuring refreshing the page works correctly without 404 errors.

3.  **Data Management (The "Database")**:
    *   There is no traditional database server.
    *   All project data is stored in a static file: `client/public/projects.json`.
    *   When the application loads, the browser makes a standard HTTP `GET` request to fetch this JSON file.
    *   The app then parses this data and renders the project cards, filters, and search results purely on the client side.

4.  **Submission Workflow**:
    *   Since there is no backend to accept form submissions, the "Submit" page generates a JSON payload.
    *   The user is directed to open a GitHub Issue with this JSON.
    *   **Admins** then use the Admin page to paste this JSON, which merges it into the master list.
    *   The admin commits the updated `projects.json` to the repo, triggering a new build.

---

## Deployment Automation

The deployment is handled automatically by **GitHub Actions**.

### The Workflow (`.github/workflows/deploy.yml`)
Every time code is pushed to the `main` branch, this automation runs:

1.  **Checkout**: It downloads the latest code.
2.  **Install**: Runs `npm ci` to install dependencies defined in `package.json`.
3.  **Build**: Runs `npx vite build`.
    *   **Critical**: It appends `--base /YOUR-REPO-NAME/` to ensure assets load correctly from a subpath (e.g., `github.com/org/repo/assets/...`).
4.  **Deploy**: It uploads the resulting `dist/` folder to GitHub Pages.

---

## Files to Copy

To host this in your own GitHub repository, you only need to copy the following files and folders. You can ignore everything else.

### 1. Essential Configuration
*   `package.json` - Defines project dependencies.
*   `package-lock.json` - Locks exact versions (Critical for stable builds).
*   `tsconfig.json` - TypeScript configuration.
*   `vite.config.ts` - Build tool configuration.
*   `vite-plugin-meta-images.ts` - Custom plugin for social images (Critical).
*   `tailwind.config.ts` (if present) or `client/src/index.css` (Tailwind setup).

### 2. Source Code
*   `client/` - The entire folder. Contains all source code, pages, components, and the `projects.json` database.
*   `script/` - **NEW**: Contains `enrich.ts` (API fetcher) and `validate.ts` (Nanny/Link check).

### 3. Automation
*   `.github/workflows/deploy.yml` - The deployment script.

### 4. What to Ignore/Delete
You do **NOT** need these folders for the static site:
*   `server/` - Backend code (unused).
*   `shared/` - Backend shared schemas (unused).
*   `scripts/` - Backend build scripts (unused).

---

## Setup Instructions

1.  **Create Repository**: Create a new empty repository on GitHub.
2.  **Push Code**: Copy the files listed above and push them to the `main` branch.
3.  **Enable Pages**:
    *   Go to Repository **Settings** -> **Pages**.
    *   Under **Build and deployment**, select **Source** as **GitHub Actions**.
    *   (Do not select "Deploy from a branch", let the Action handle it).
4.  **Verify**: Click the **Actions** tab in your repo to see the deployment running. Once green, your site is live!
