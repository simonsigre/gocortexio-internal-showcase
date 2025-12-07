
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECTS_PATH = path.join(__dirname, '../client/public/projects.json');

async function enrichData() {
  console.log('[INFO] Starting Data Enrichment...');
  
  try {
    const rawData = fs.readFileSync(PROJECTS_PATH, 'utf-8');
    const projects = JSON.parse(rawData);
    const enrichedProjects: any[] = [];
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      console.warn('[WARN] No GITHUB_TOKEN found. Skipping API enrichment.');
      return; 
    }

    for (const project of projects) {
      if (project.githubApi && project.repo) {
        console.log(`   Fetching data for: ${project.repo}`);
        try {
          const response = await fetch(`https://api.github.com/repos/${project.repo}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`   [OK] Enriched ${project.name}: [STAR] ${data.stargazers_count} | [FORK] ${data.forks_count}`);
            
            enrichedProjects.push({
              ...project,
              stars: data.stargazers_count,
              forks: data.forks_count,
              lastUpdated: data.updated_at,
              license: data.license?.spdx_id || data.license?.name || null,
              description: data.description || project.description, // Sync description
              language: data.language || project.language // Sync language
            });
          } else {
            console.error(`   [ERROR] Failed to fetch ${project.repo}: ${response.status} ${response.statusText}`);
            // Keep original data if fetch fails (unless it's a 404 which validation script handles)
            enrichedProjects.push(project); 
          }
        } catch (error) {
          console.error(`   [ERROR] Error fetching ${project.repo}:`, error);
          enrichedProjects.push(project);
        }
      } else {
        enrichedProjects.push(project);
      }
    }

    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(enrichedProjects, null, 2));
    console.log(`[PASS] Successfully enriched ${enrichedProjects.length} projects.`);

  } catch (error) {
    console.error('[FAIL] Enrichment failed:', error);
    process.exit(1);
  }
}

enrichData();
