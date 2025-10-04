import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { query } from '../config/database';
import { randomUUID } from 'crypto';

const pdf = require('pdf-parse');

// Parse PDF file
async function parsePDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    return '';
  }
}

// Parse Word document (.docx)
async function parseWord(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`Error parsing Word doc ${filePath}:`, error);
    return '';
  }
}

// Parse text file
function parseText(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error parsing text file ${filePath}:`, error);
    return '';
  }
}

// Extract metadata from filename
function extractMetadata(filename: string) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(pdf|docx?|txt)$/i, '');

  // Try to extract error codes (E-XXX pattern)
  const errorCodeMatch = nameWithoutExt.match(/E-\d{3}/g);
  const errorCodes = errorCodeMatch || [];

  // Try to extract category from filename
  let category = 'general';
  const lowerName = nameWithoutExt.toLowerCase();

  if (lowerName.includes('error') || lowerName.includes('troubleshoot')) {
    category = 'troubleshooting';
  } else if (lowerName.includes('maintenance') || lowerName.includes('service')) {
    category = 'maintenance';
  } else if (lowerName.includes('safety')) {
    category = 'safety';
  } else if (lowerName.includes('install') || lowerName.includes('setup')) {
    category = 'getting_started';
  }

  // Use filename as title (cleaned up)
  const title = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, category, errorCodes };
}

// Import all documents from a folder
export async function importFromFolder(folderPath: string) {
  console.log(`\n📂 Importing knowledge from: ${folderPath}\n`);

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const ext = path.extname(file).toLowerCase();

    // Skip directories and unsupported files
    if (fs.statSync(filePath).isDirectory()) continue;
    if (!['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
      console.log(`⏭️  Skipped (unsupported): ${file}`);
      skipped++;
      continue;
    }

    try {
      console.log(`📄 Processing: ${file}`);

      let content = '';

      // Parse based on file type
      if (ext === '.pdf') {
        content = await parsePDF(filePath);
      } else if (ext === '.docx' || ext === '.doc') {
        content = await parseWord(filePath);
      } else if (ext === '.txt') {
        content = parseText(filePath);
      }

      if (!content || content.trim().length === 0) {
        console.log(`  ⚠️  No content extracted, skipping`);
        skipped++;
        continue;
      }

      // Extract metadata from filename
      const { title, category, errorCodes } = extractMetadata(file);

      // Check if entry already exists with same title
      const existing = query(
        'SELECT id FROM knowledge_base WHERE title = ?',
        [title]
      );

      if (existing.rows.length > 0) {
        console.log(`  ℹ️  Already exists, skipping: "${title}"`);
        skipped++;
        continue;
      }

      // Insert into knowledge base
      const id = randomUUID();
      query(
        `INSERT INTO knowledge_base (id, title, content, category, error_codes, tags)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          content,
          category,
          JSON.stringify(errorCodes),
          JSON.stringify([category, ext.replace('.', '')])
        ]
      );

      console.log(`  ✅ Imported: "${title}" (${category})`);
      if (errorCodes.length > 0) {
        console.log(`     Error codes: ${errorCodes.join(', ')}`);
      }
      console.log(`     Content length: ${content.length} characters\n`);

      imported++;

    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📁 Total files: ${files.length}\n`);
}

// Main execution
if (require.main === module) {
  // Get folder path from command line or use default
  const folderPath = process.argv[2] || path.join(process.env.HOME || '', 'Desktop', 'HD520-Knowledge');

  console.log('🤖 HD520 Knowledge Base Importer\n');
  console.log('Usage: npm run import-knowledge [folder-path]');
  console.log('Default: ~/Desktop/HD520-Knowledge\n');

  importFromFolder(folderPath)
    .then(() => {
      console.log('✨ Import complete!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
