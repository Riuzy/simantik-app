const fs = require('fs');
const path = require('path');

function checkDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== '.pnpm') {
        checkDirectory(fullPath);
      }
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('interface React.')) {
        console.log(`❌ ${fullPath}: Found invalid React interface declaration`);
      }
    }
  }
}

try {
  checkDirectory(path.join(process.cwd(), 'apps/web/src'));
  console.log('\n✅ No invalid React interface declarations found');
} catch (error) {
  console.error('Error:', error);
}