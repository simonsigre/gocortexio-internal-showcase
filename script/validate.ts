
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECTS_PATH = path.join(__dirname, '../client/public/projects.json');

// Nanny List: Add words that should trigger a build failure
const BAD_WORDS = [
  "vulgar", "racist", "hate", "scam", "malware", "virus", "bitcoin miner", 
  "offensive", "slur", "xxx", "porn", "gambling"
  // Add more patterns as needed
];

async function validateProjects() {
  console.log('🛡️  Starting Security & Quality Validation...');
  
  try {
    const rawData = fs.readFileSync(PROJECTS_PATH, 'utf-8');
    const projects = JSON.parse(rawData);
    let hasErrors = false;
    const token = process.env.GITHUB_TOKEN;

    for (const project of projects) {
      // 1. Nanny Check
      const content = `${project.name} ${project.description} ${project.author}`.toLowerCase();
      const foundBadWord = BAD_WORDS.find(word => content.includes(word));
      
      if (foundBadWord) {
        console.error(`❌ [CONTENT SAFETY] Project "${project.name}" contains offensive term: "${foundBadWord}"`);
        hasErrors = true;
      }

      // 2. Dead Link Check (Only for GitHub repos marked for API)
      if (project.githubApi && project.repo) {
         try {
           const response = await fetch(`https://api.github.com/repos/${project.repo}`, {
             method: 'HEAD',
             headers: token ? { 'Authorization': `Bearer ${token}` } : {}
           });

           if (response.status === 404 || response.status === 410) {
             console.error(`❌ [DEAD LINK] Project "${project.name}" repository is gone (${response.status}): ${project.repo}`);
             hasErrors = true;
           }
         } catch (e) {
            console.warn(`⚠️ Could not verify link for ${project.name}:`, e);
         }
      }
    }

    if (hasErrors) {
      console.error('⛔ Validation Failed! Fix the issues above to deploy.');
      process.exit(1);
    } else {
      console.log('✅ All checks passed.');
    }

  } catch (error) {
    console.error('❌ Validation script error:', error);
    process.exit(1);
  }
}

validateProjects();
