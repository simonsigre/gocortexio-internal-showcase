import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECTS_FILE = path.join(__dirname, '../client/public/projects.json');
const SITEMAP_FILE = path.join(__dirname, '../client/public/sitemap.xml');
const BASE_URL = process.env.BASE_URL || 'https://simonsigre.github.io/pilot-gocortexio-showcase';

interface Project {
  name: string;
  date: string;
  [key: string]: any;
}

function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  // Read projects
  const projects: Project[] = JSON.parse(
    fs.readFileSync(PROJECTS_FILE, 'utf-8')
  );

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/#/submit', changefreq: 'monthly', priority: '0.8' },
    { url: '/#/arsenal', changefreq: 'weekly', priority: '0.9' },
    { url: '/#/incubation-hub', changefreq: 'weekly', priority: '0.8' },
    { url: '/#/announcements', changefreq: 'weekly', priority: '0.7' },
    { url: '/#/admin', changefreq: 'monthly', priority: '0.3' },
  ];

  // Dynamic project pages
  const projectPages = projects.map((project) => ({
    url: `/#/project/${encodeURIComponent(project.name)}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: project.date || new Date().toISOString().split('T')[0],
  }));

  // Combine all pages
  const allPages = [...staticPages, ...projectPages];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write sitemap
  fs.writeFileSync(SITEMAP_FILE, xml, 'utf-8');

  console.log(`✅ Sitemap generated: ${SITEMAP_FILE}`);
  console.log(`📄 Pages: ${allPages.length} (${staticPages.length} static + ${projectPages.length} projects)`);
}

generateSitemap();
