// Update all hardcoded API URLs to use config
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToUpdate = [
  'src/pages/CaseCreate.jsx',
  'src/pages/CaseDetails.jsx',
  'src/pages/CaseList.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/pages/AdminPage.jsx',
  'src/pages/ChatAssistant.jsx',
  'src/pages/CaseAnalysis.jsx',
];

filesToUpdate.forEach(file => {
  const filePath = join(__dirname, file);
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Replace hardcoded URLs
    content = content.replace(
      /http:\/\/127\.0\.0\.1:8000\/api\//g,
      '${API_URL}/api/'
    );
    content = content.replace(
      /http:\/\/localhost:8000\/api\//g,
      '${API_URL}/api/'
    );
    
    // Add import if not present
    if (!content.includes("from '../config'")) {
      const importLine = "import { API_URL } from '../config';\n";
      content = content.replace(
        /(import.*from.*react.*;\n)/,
        `$1${importLine}`
      );
    }
    
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
  } catch (err) {
    console.error(`❌ Error updating ${file}:`, err.message);
  }
});

console.log('\n✨ All files updated!');
