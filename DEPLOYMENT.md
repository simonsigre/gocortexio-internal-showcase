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
    *   It builds the React app.
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

### User Submissions
Users can click "Submit Issue" on the submission page to send you the JSON payload directly via GitHub Issues.
