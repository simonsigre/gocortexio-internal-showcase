/**
 * Auto-import script for GitHub organization repositories
 * Fetches all public repositories from specified GitHub organizations
 * and automatically imports them as projects into projects.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECTS_PATH = path.join(__dirname, '../client/public/projects.json');

// Organizations to monitor
const WATCHED_ORGS = [
  'Palo-Cortex'
  // Note: 'gocortexio' repos are added manually as they are individual repos, not an organization
];

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  license: {
    spdx_id: string;
    name: string;
  } | null;
  topics: string[];
  archived: boolean;
  fork: boolean;
  full_name: string;
}

interface Project {
  name: string;
  description: string;
  status: 'active' | 'development' | 'beta' | 'deprecated';
  link: string;
  language: string;
  repo: string;
  githubApi: boolean;
  product?: string;
  author: string;
  theatre: string;
  usecase?: string;
  date: string;
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  license?: string;
  media?: {
    type: 'image';
    url: string;
    alt: string;
  };
}

/**
 * Fetch all repositories from a GitHub organization
 */
async function fetchOrgRepos(org: string, token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  console.log(`   Fetching repositories from ${org}...`);

  while (true) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GoCortex-Showcase-Importer'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `https://api.github.com/orgs/${org}/repos?type=public&per_page=${perPage}&page=${page}&sort=updated`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length === 0) break;

      repos.push(...data);

      if (data.length < perPage) break;

      page++;
    } catch (error) {
      console.error(`   [ERROR] Failed to fetch repos from ${org}:`, error);
      throw error;
    }
  }

  console.log(`   [OK] Found ${repos.length} repositories in ${org}`);
  return repos;
}

/**
 * Determine product based on repo topics and description
 */
function determineProduct(repo: GitHubRepo): string | undefined {
  const topics = repo.topics || [];
  const desc = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();

  if (topics.includes('xsiam') || desc.includes('xsiam') || name.includes('xsiam')) {
    return 'Cortex XSIAM';
  }
  if (topics.includes('xdr') || desc.includes('xdr') || name.includes('xdr')) {
    return 'Cortex XDR';
  }
  if (topics.includes('xsoar') || desc.includes('xsoar') || name.includes('xsoar')) {
    return 'Cortex XSOAR';
  }
  if (topics.includes('prisma-cloud') || desc.includes('prisma cloud') || name.includes('prisma')) {
    return 'Prisma Cloud';
  }
  if (topics.includes('strata') || desc.includes('strata')) {
    return 'Strata';
  }

  // Default for Palo-Cortex repos
  return 'Cortex XSIAM';
}

/**
 * Determine use case based on topics and description
 */
function determineUseCase(repo: GitHubRepo): string | undefined {
  const topics = repo.topics || [];
  const desc = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();

  // Check topics first
  if (topics.includes('automation') || desc.includes('automation')) return 'Automation';
  if (topics.includes('testing') || desc.includes('testing') || desc.includes('test')) return 'Testing';
  if (topics.includes('monitoring') || desc.includes('monitoring')) return 'Monitoring';
  if (topics.includes('integration') || desc.includes('integration')) return 'Integration';
  if (topics.includes('training') || desc.includes('training')) return 'Training';
  if (topics.includes('threat-intelligence') || desc.includes('threat intel')) return 'Threat Intelligence';
  if (topics.includes('soc') || name.includes('soc-')) return 'SOC Operations';
  if (topics.includes('playbook') || name.includes('playbook')) return 'Playbooks';
  if (topics.includes('framework') || name.includes('framework')) return 'Framework';
  if (topics.includes('utility') || topics.includes('tool')) return 'Utility';
  if (topics.includes('cli')) return 'CLI Tool';

  return undefined;
}

/**
 * Determine status based on repo state
 */
function determineStatus(repo: GitHubRepo): 'active' | 'development' | 'beta' | 'deprecated' {
  if (repo.archived) return 'deprecated';

  const topics = repo.topics || [];
  if (topics.includes('beta')) return 'beta';
  if (topics.includes('wip') || topics.includes('development')) return 'development';

  // If recently updated (within 6 months), consider active
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const lastUpdate = new Date(repo.updated_at);

  if (lastUpdate > sixMonthsAgo) return 'active';

  return 'development';
}

/**
 * Get logo URL if available
 */
function getLogoUrl(repo: GitHubRepo): { type: 'image'; url: string; alt: string } | undefined {
  // Common logo patterns in repos
  const possibleLogoPaths = [
    `https://raw.githubusercontent.com/${repo.full_name}/main/assets/logo.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/assets/${repo.name}-logo.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/static/logo.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/docs/logo.png`,
  ];

  // For now, we'll return the first possibility
  // In a real implementation, you'd want to check if these URLs exist
  return {
    type: 'image',
    url: possibleLogoPaths[0],
    alt: `${repo.name} logo`
  };
}

/**
 * Transform GitHub repo to Project format
 */
function transformRepoToProject(repo: GitHubRepo, orgName: string): Project {
  return {
    name: repo.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    description: repo.description || `${repo.name} - A project from ${orgName}`,
    status: determineStatus(repo),
    link: repo.html_url,
    language: repo.language || 'Unknown',
    repo: repo.full_name,
    githubApi: true,
    product: determineProduct(repo),
    author: orgName === 'Palo-Cortex' ? 'Palo Alto Networks Cortex Team' : orgName,
    theatre: 'Global',
    usecase: determineUseCase(repo),
    date: repo.created_at.split('T')[0],
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    lastUpdated: repo.updated_at,
    license: repo.license?.spdx_id || repo.license?.name || undefined
  };
}

/**
 * Main import function
 */
async function importOrgRepos() {
  console.log('[INFO] Starting Organization Repository Import...');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('[WARN] No GITHUB_TOKEN found. Using public API (rate limited to 60 requests/hour)');
  }

  try {
    // Load existing projects
    let existingProjects: Project[] = [];
    if (fs.existsSync(PROJECTS_PATH)) {
      const rawData = fs.readFileSync(PROJECTS_PATH, 'utf-8');
      existingProjects = JSON.parse(rawData);
      console.log(`[INFO] Loaded ${existingProjects.length} existing projects`);
    }

    // Create a map of existing projects by repo name for deduplication
    const existingRepoMap = new Map<string, Project>();
    existingProjects.forEach(project => {
      if (project.repo) {
        existingRepoMap.set(project.repo, project);
      }
    });

    // Fetch repos from all watched organizations
    const allNewProjects: Project[] = [];
    let totalReposFetched = 0;
    let newProjectsAdded = 0;
    let existingProjectsUpdated = 0;

    for (const org of WATCHED_ORGS) {
      console.log(`\n[STEP] Processing organization: ${org}`);

      try {
        const repos = await fetchOrgRepos(org, token);
        totalReposFetched += repos.length;

        // Filter out forks if desired (optional)
        const publicRepos = repos.filter(repo => !repo.fork);

        for (const repo of publicRepos) {
          const project = transformRepoToProject(repo, org);

          if (existingRepoMap.has(repo.full_name)) {
            // Update existing project with latest data
            const existingProject = existingRepoMap.get(repo.full_name)!;

            // Preserve manual customizations (name, custom description, media if manually set)
            const updatedProject: Project = {
              ...project,
              name: existingProject.name, // Keep custom name
              description: existingProject.description, // Keep custom description if edited
              media: existingProject.media || project.media, // Keep custom media
              product: existingProject.product || project.product, // Keep custom product
              usecase: existingProject.usecase || project.usecase, // Keep custom usecase
              // Update metrics
              stars: project.stars,
              forks: project.forks,
              lastUpdated: project.lastUpdated,
              status: project.status,
              language: project.language,
              license: project.license
            };

            existingRepoMap.set(repo.full_name, updatedProject);
            existingProjectsUpdated++;
          } else {
            // Add new project
            existingRepoMap.set(repo.full_name, project);
            allNewProjects.push(project);
            newProjectsAdded++;
            console.log(`   [NEW] ${project.name} (${repo.full_name})`);
          }
        }
      } catch (error) {
        console.error(`[ERROR] Failed to process ${org}:`, error);
      }
    }

    // Merge all projects
    const finalProjects = Array.from(existingRepoMap.values());

    // Sort by date (newest first)
    finalProjects.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Write to file
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(finalProjects, null, 2));

    console.log('\n[SUMMARY]');
    console.log(`   Total repositories fetched: ${totalReposFetched}`);
    console.log(`   New projects added: ${newProjectsAdded}`);
    console.log(`   Existing projects updated: ${existingProjectsUpdated}`);
    console.log(`   Total projects in database: ${finalProjects.length}`);
    console.log('[PASS] Repository import completed successfully!\n');

  } catch (error) {
    console.error('[FAIL] Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importOrgRepos();
