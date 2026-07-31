const fs = require('fs');
const path = 'apps/web/src';

function findInvalidReactInterfaces(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let found = [];

  for (const item of items) {
    const fullPath = `${dir}/${item.name}`;
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== '.pnpm') {
      found = found.concat(findInvalidReactInterfaces(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('interface React.')) {
        found.push(`${fullPath}: Found invalid React interface declaration`);
      }
    }
  }

  return found;
}

const results = findInvalidReactInterfaces(path);
if (results.length > 0) {
  console.log('INVALID REACT INTERFACE DECLARATIONS FOUND:');
  console.log(results.join('\n'));
  process.exit(1);
} else {
  console.log('✅ No invalid React interface declarations found');
}