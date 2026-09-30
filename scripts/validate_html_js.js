import fs from 'fs';
import vm from 'vm';

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];

console.log(`Found ${scriptMatches.length} script tags.`);
let hasError = false;

scriptMatches.forEach((match, idx) => {
  const code = match[1].trim();
  if (!code) return; // external script
  try {
    new vm.Script(code);
    console.log(`Script ${idx + 1}: Valid JS syntax! (${code.length} chars)`);
  } catch (err) {
    hasError = true;
    console.error(`Script ${idx + 1} SyntaxError:`, err.message);
    const lines = code.split('\n');
    if (err.stack) {
      console.error(err.stack.slice(0, 300));
    }
  }
});

if (!hasError) {
  console.log('ALL INLINE JAVASCRIPT VALIDATED SUCCESSFULLY!');
} else {
  process.exit(1);
}
