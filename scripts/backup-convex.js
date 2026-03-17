import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd(); // Run this script from the project root

// Determine environment
const isProd = process.argv.includes('--prod');
const environmentName = isProd ? 'convex:teitlist' : 'convex:teitlist:dev';
console.log(`Using environment script: ${environmentName}`);

const pkgJsonPath = path.join(rootDir, 'package.json');
if (!fs.existsSync(pkgJsonPath)) {
  console.error("package.json not found in current directory! Please run this script from the project root.");
  process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const scriptCommand = pkgJson.scripts[environmentName];

if (!scriptCommand) {
  console.error(`Script '${environmentName}' not found in package.json`);
  process.exit(1);
}

// Extract URL and Admin Key from the npm script
const urlMatch = scriptCommand.match(/--url\s+([^\s]+)/);
const keyMatch = scriptCommand.match(/--admin-key\s+(?:"([^"]+)"|([^\s]+))/);

if (!urlMatch || !keyMatch) {
  console.error(`Could not extract --url or --admin-key from package.json script '${environmentName}'`);
  process.exit(1);
}

const url = urlMatch[1];
const adminKey = keyMatch[1] || keyMatch[2];

// Define paths
const zipFile = path.join(rootDir, 'convex_export_temp.zip');
const tempDir = path.join(rootDir, 'convex_export_temp');

console.log(`\n📦 Exporting data from Convex (${url})...`);
try {
  execSync(`npx convex export --url ${url} --admin-key "${adminKey}" --path ${zipFile}`, { stdio: 'inherit', cwd: rootDir });
} catch (err) {
  console.error("Failed to export from convex:", err.message);
  process.exit(1);
}

console.log("\n📂 Extracting zip file...");
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

try {
  execSync(`unzip -q ${zipFile} -d ${tempDir}`, { stdio: 'inherit', cwd: rootDir });
} catch (err) {
  console.error("Failed to unzip file:", err.message);
  process.exit(1);
}

console.log("\n🔄 Processing JSONL files into a single JSON object...");
const backupData = {};
const entries = fs.readdirSync(tempDir, { withFileTypes: true });

for (const entry of entries) {
  // Each folder inside the export represents a table (except _tables)
  if (entry.isDirectory() && entry.name !== '_tables') {
    const tableName = entry.name;
    const jsonlPath = path.join(tempDir, tableName, 'documents.jsonl');
    
    if (fs.existsSync(jsonlPath)) {
      const content = fs.readFileSync(jsonlPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      const records = lines.map(line => JSON.parse(line));
      backupData[tableName] = records;
      console.log(` - Extracted ${records.length} records from table '${tableName}'`);
    }
  }
}

// Generate output file name
const date = new Date().toISOString().replace(/[:.]/g, '-');
const envLabel = isProd ? 'prod' : 'dev';
const outFileName = `convex-backup-${envLabel}-${date}.json`;
const outFilePath = path.join(rootDir, outFileName);

// Write output back to disk
fs.writeFileSync(outFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
console.log(`\n✅ Backup successfully saved to ${outFileName}`);

console.log("\n🧹 Cleaning up temporary files...");
fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}
console.log("🎉 Backup complete!");
