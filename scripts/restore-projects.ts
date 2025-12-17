import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECTS_FILE = path.join(__dirname, '../client/public/projects.json');
const BACKUP_DIR = path.join(__dirname, '../backups');

async function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ No backups directory found!');
    process.exit(1);
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('projects-') && f.endsWith('.json'))
    .map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: stats.mtime,
        size: (stats.size / 1024).toFixed(2)
      };
    })
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  if (files.length === 0) {
    console.error('❌ No backups found!');
    process.exit(1);
  }

  console.log('\n📦 Available Backups:\n');
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file.name}`);
    console.log(`   Date: ${file.time.toLocaleString()}`);
    console.log(`   Size: ${file.size} KB\n`);
  });

  return files;
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function restoreBackup() {
  const backups = await listBackups();

  const answer = await promptUser('Enter backup number to restore (or "cancel"): ');

  if (answer.toLowerCase() === 'cancel') {
    console.log('❌ Restore cancelled');
    process.exit(0);
  }

  const index = parseInt(answer) - 1;

  if (isNaN(index) || index < 0 || index >= backups.length) {
    console.error('❌ Invalid backup number');
    process.exit(1);
  }

  const selectedBackup = backups[index];

  // Confirm
  const confirm = await promptUser(
    `⚠️  This will replace current projects.json with ${selectedBackup.name}\n` +
    `   Continue? (yes/no): `
  );

  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Restore cancelled');
    process.exit(0);
  }

  // Backup current file first
  if (fs.existsSync(PROJECTS_FILE)) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const emergencyBackup = path.join(BACKUP_DIR, `projects-emergency-${timestamp}.json`);
    fs.copyFileSync(PROJECTS_FILE, emergencyBackup);
    console.log(`💾 Emergency backup created: ${path.basename(emergencyBackup)}`);
  }

  // Restore
  fs.copyFileSync(selectedBackup.path, PROJECTS_FILE);

  console.log(`✅ Restored from: ${selectedBackup.name}`);
  console.log(`📁 Location: ${PROJECTS_FILE}`);

  // Validate
  const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
  console.log(`📦 Projects restored: ${data.length}`);
}

restoreBackup();
