import fs from 'fs';
import path from 'path';

function checkBraces(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        checkBraces(fullPath);
      }
    } else if (fullPath.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let openBraces = 0;
      let lineNum = 1;
      let error = false;
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '\n') lineNum++;
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (openBraces < 0) {
          console.log(`Unmatched '}' in ${fullPath} at line ${lineNum}`);
          openBraces = 0; // reset to avoid cascading
          error = true;
        }
      }
      if (openBraces > 0) {
        console.log(`Unclosed '{' in ${fullPath}. Open count: ${openBraces}`);
      }
    }
  }
}

checkBraces('c:/Users/purnachandra/OneDrive/Desktop/CodeCollab/frontend/src');
