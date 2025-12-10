import { execSync } from 'child_process';
import path from 'path';

// Helper to run commands
const run = (command: string) => {
    try {
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    } catch (error) {
        console.error(`Command failed: ${command}`);
        process.exit(1);
    }
};

console.log('🚀 Starting build process...');

// 1. Auto-import repositories from watched organizations
console.log('\n📥 Importing repositories from watched organizations...');
run('tsx scripts/import-org-repos.ts');

// 2. Validate content
console.log('\n🔍 Validating content...');
run('tsx scripts/validate.ts');

// 3. Enrich data (only if GITHUB_TOKEN is present, or maybe just warn?)
// For now, we'll try to run it, but maybe enrich.ts handles missing token gracefully?
// If not, we might want to wrap this. Let's assume enrich.ts is robust or we want to fail if it fails.
console.log('\n✨ Enriching data...');
run('tsx scripts/enrich.ts');

// 4. Build with Vite
console.log('\n📦 Building static site...');
run('vite build');

console.log('\n✅ Build completed successfully!');
