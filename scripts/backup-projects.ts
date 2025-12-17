import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECTS_FILE = path.join(__dirname, '../client/public/projects.json');
const BACKUP_DIR = path.join(__dirname, '../backups');

function createBackup() {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Read projects.json
    if (!fs.existsSync(PROJECTS_FILE)) {
      console.error('❌ projects.json not found!');
      process.exit(1);
    }

    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');

    // Validate JSON
    try {
      JSON.parse(data);
    } catch (e) {
      console.error('❌ projects.json has invalid JSON!');
      process.exit(1);
    }

    // Create timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFilename = `projects-${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    // Write backup
    fs.writeFileSync(backupPath, data, 'utf-8');

    // Get file size
    const stats = fs.statSync(backupPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ Backup created: ${backupFilename}`);
    console.log(`📊 Size: ${sizeKB} KB`);
    console.log(`📁 Location: ${backupPath}`);

    // Count projects
    const projects = JSON.parse(data);
    console.log(`📦 Projects backed up: ${projects.length}`);

    // Cleanup old backups (keep last 30)
    cleanupOldBackups();

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('projects-') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); // Newest first

  // Keep only last 30 backups
  const toDelete = files.slice(30);

  if (toDelete.length > 0) {
    console.log(`🗑️  Removing ${toDelete.length} old backups...`);
    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`   Deleted: ${file.name}`);
    });
  }
}

// Run backup
createBackup();
