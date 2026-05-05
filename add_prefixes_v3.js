#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Comprehensive code line detection including React/JSX
function isCodeLine(line) {
  const trimmed = line.trim();
  
  // Empty line - not code
  if (!trimmed) return false;
  
  // Section headers (ALL CAPS or number-letter combinations)
  if (/^[A-Z0-9]{2,}[\s\-—:()&]*$/.test(trimmed)) return false;
  if (/^WHEN|^USE|^COMBINING|^REAL|^PATTERNS|^RETRY|^IMPORTANT|^BAD|^BETTER|^HTTP|^JWT|^REST|^MIDDLEWARE|^GOOD|^WHAT|^WHY|^HOW/.test(trimmed) && !trimmed.includes('(')) return false;
  
  // Numbered list like "1. API response" - but allow if it has code indicators
  if (/^\d+\.\s+[A-Z]/.test(trimmed) && !trimmed.includes('(') && !trimmed.includes('{') && !trimmed.includes('[')) return false;
  
  // Bullet point - not code
  if (trimmed.startsWith('•') || trimmed.startsWith('- ')) return false;
  
  // Code indicators (very comprehensive)
  const codeIndicators = [
    /function\s+\w+\s*\(/, /const\s+\w+\s*[=:]/, /let\s+\w+\s*[=:]/, /var\s+\w+\s*[=:]/,
    /interface\s+\w+/, /type\s+\w+\s*[=]/, /class\s+\w+/, /async\s+/, /await\s+/,
    /=>/, /\{.*\}/, /return\s+/, /if\s*\(/, /for\s*\(/, /while\s*\(/, /try\s*\{/, /catch\s*\(/,
    /\/\s*\//, /\/\s*\*/, /\*\s*\//, // comments
    /\[.*\]:/, // array/list syntax
    /`.*`/, // template literals
    /<.*>/, // JSX or HTML tags
    /@/, // decorators
    /\.\w+\s*\(/, // method calls
    /\w+\s*\.\s*\w+/, // property access
    /\w+\s*\[/, // array access
    /\$\{/, // template interpolation
    /import\s+/, /export\s+/, // imports/exports
    /require\s*\(/, // commonjs
    /\}.*,?$/, // closing braces
    /^}\s*[,;]?$/, // standalone closing brace
    /^{/, // opening brace
    /^];?$/, /^],?$/, /^\],/, // array/object endings
    /;\s*$/, // statement terminator
    /^(new|throw|delete)\s+/, // keywords
  ];
  
  return codeIndicators.some(pattern => pattern.test(line));
}

function addPrefixesToAnswer(answer) {
  const lines = answer.split('\n');
  const result = lines.map(line => {
    if (line && isCodeLine(line)) {
      // Add >> at the very beginning (before indentation)
      if (!line.trimStart().startsWith('>>')) {
        return '>> ' + line;
      }
    }
    return line;
  });
  return result.join('\n');
}

function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\nProcessing: ${fileName}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract variable name and the object
  const match = content.match(/export const (\w+) = (\{[\s\S]*\});/);
  if (!match) {
    console.log('  ❌ ERROR: Could not parse file structure');
    return 0;
  }
  
  const varName = match[1];
  let data;
  try {
    data = JSON.parse(match[2]);
  } catch (e) {
    console.log('  ❌ ERROR: Invalid JSON - attempting recovery...');
    // Try to fix common JSON issues
    let jsonStr = match[2];
    // Remove trailing commas before }
    jsonStr = jsonStr.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}');
    try {
      data = JSON.parse(jsonStr);
      console.log('  ✓ JSON recovered');
    } catch (e2) {
      console.log('  ❌ Recovery failed:', e2.message.substring(0, 100));
      return 0;
    }
  }
  
  let modified = 0;
  let totalQuestions = 0;
  let codeLineModified = 0;
  
  data.questions.forEach(q => {
    totalQuestions++;
    if (q.answer) {
      const original = q.answer;
      q.answer = addPrefixesToAnswer(q.answer);
      if (original !== q.answer) {
        modified++;
        // Count modified lines
        const originalLines = original.split('\n');
        const newLines = q.answer.split('\n');
        for (let i = 0; i < newLines.length; i++) {
          if (originalLines[i] !== newLines[i]) codeLineModified++;
        }
      }
    }
  });
  
  fs.writeFileSync(filePath, `export const ${varName} = ${JSON.stringify(data, null, 2)};\n`);
  console.log(`  ✓ Modified ${modified}/${totalQuestions} answers`);
  console.log(`  ✓ Code lines prefixed: ${codeLineModified}`);
  return modified;
}

const files = [
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/typescript.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/react.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/nodejs.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/nextjs.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/reactnative.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/databases.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/systemdesign.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/dsa.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/behavioral.ts',
  'd:/Projects/InterviewPrep/frontend/src/data/interview-prep/leadership.ts'
];

console.log('\n═══════════════════════════════════════════════════════');
console.log('Processing Interview Prep Data Files - Run 2');
console.log('═══════════════════════════════════════════════════════');

let totalModified = 0;
let successCount = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    const result = processFile(file);
    if (result > 0) successCount++;
    totalModified += result;
  } else {
    console.log(`  ❌ NOT FOUND: ${file}`);
  }
});

console.log('\n═══════════════════════════════════════════════════════');
console.log(`Total: ${successCount}/${files.length} files processed successfully`);
console.log(`Total answers modified: ${totalModified}`);
console.log('═══════════════════════════════════════════════════════\n');
