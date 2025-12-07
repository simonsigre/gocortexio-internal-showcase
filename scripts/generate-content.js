// This is a mockup of the script that would run in GitHub Actions
// It would scan the projects/ directory and aggregate all project.json files into one

import fs from 'fs';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), 'projects');
const OUTPUT_FILE = path.join(process.cwd(), 'client', 'src', 'lib', 'projects.json');

function getAllProjects() {
  const projects = [];
  
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log("Projects directory not found, skipping...");
    return [];
  }

  // Recursive search for project.json files
  // Strategy: projects/<username>/<project-slug>/project.json
  
  // Mock implementation for the concept
  // In reality, this would use glob or recursive readdir
  console.log("Scanning for projects...");
  
  // ... scanning logic ...
  
  return projects;
}

const projects = getAllProjects();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2));
console.log(`Generated ${projects.length} projects to ${OUTPUT_FILE}`);
