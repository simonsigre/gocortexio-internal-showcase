# Deployment Guide

This project is designed to be hosted entirely on GitHub Pages as a static site.
It requires NO backend server. All data is managed via the `client/src/lib/mock-data.ts` (or `projects.json` if you externalize it) file.

## Folder Structure to Copy

When moving this to your corporate GitHub repository, you only need the following files/folders:

```text
/
├── .github/
│   └── workflows/
│       └── deploy.yml    <-- The automation to build/deploy the site
├── client/               <-- The frontend source code
├── package.json          <-- Dependencies
├── package-lock.json     <-- Exact versions (CRITICAL for deployment)
├── tsconfig.json         <-- TypeScript config
├── vite.config.ts        <-- Build config
└── client/src/index.css  <-- Styling config (Tailwind v4 embedded)
```

You can IGNORE/DELETE:
- `server/` (Not used for the static site)
- `shared/` (Not used)
- `scripts/` (Not used)

## Setup Instructions

1.  **Create Repository**: Create a new repository on GitHub.
2.  **Push Code**: Copy the files listed above and push them to the `main` branch.
3.  **Enable Pages**:
    *   Go to Repository Settings -> Pages.
    *   Source: "GitHub Actions".
4.  **Verify**: The `.github/workflows/deploy.yml` workflow will automatically run on push.
    *   It installs dependencies.
    *   It builds the React app (using `npx vite build` to bypass server-side scripts).
    *   It deploys the result to GitHub Pages.

## How to Manage Content

### Adding Projects (Admins)
1.  Go to the live site and click **Submit Project**.
2.  Fill out the form to generate the JSON.
3.  Go to the **Admin** page.
4.  Paste your existing list (from your code or file).
5.  Paste the new project JSON.
6.  Click **Merge**.
7.  Copy the updated JSON.
8.  Update `client/src/lib/mock-data.ts` (or your external JSON file) in the repo and commit.
9.  The site will auto-rebuild.

## Troubleshooting

### Site is Blank (White Screen)
If the site loads but is completely blank:
1.  **Check Console**: Open Developer Tools (F12) -> Console. Look for Red errors.
    *   If you see `404 Not Found` for `main.js` or `index.css`: The **Base Path** is likely wrong.
    *   Ensure you are using the command `npx vite build --base /YOUR-REPO-NAME/` in your workflow.
2.  **Check Network Tab**: See if `main.js` is failing to load.
3.  **Verify Files**: Ensure `vite-plugin-meta-images.ts` was copied to your repo root.
4.  **Verify Workflow**: Ensure `.github/workflows/deploy.yml` matches the one in this guide.

### Routing Issues (404 on Refresh)
This site uses **Hash Routing** (e.g. `/#/submit`) to work on GitHub Pages.
*   If you see regular URLs like `/submit` (without `#`), routing will fail on refresh.
*   The app is configured to use `useHashLocation` automatically.

### "Vite" command not found
Ensure `package.json` and `package-lock.json` are in the root of your repo.

