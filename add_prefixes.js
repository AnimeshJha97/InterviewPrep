#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Pattern to detect code lines vs non-code lines
function isCodeLine(line) {
  const trimmed = line.trim();
  // Skip empty lines and section headers (ALL CAPS with colons)
  if (!trimmed) return false;
  if (/^[A-Z][A-Z0-9\s—:(),&-]*:?$/.test(trimmed) && !trimmed.includes('(') && !trimmed.includes('{')) return false;
  // Skip bullet points
  if (trimmed.startsWith('•') || trimmed.startsWith('- ')) return false;
  // Skip lines that are purely numbers, single words in explanation context
  if (/^\d+\.|^[A-Z][a-z]*\s*$/.test(trimmed) && !trimmed.includes('(')) return false;
  // This IS code if it has programming constructs
  return /([{};:=]|function|const|let|var|interface|type|class|async|await|=>|return|if|for|while|try|catch|\/\/|\/\*|\*)/.test(line);
}

function addPrefixesToAnswer(answer) {
  const lines = answer.split('\n');
  const result = lines.map(line => {
    if (isCodeLine(line)) {
      // Add >> only if not already present and preserve indentation
      if (!line.trimStart().startsWith('>>')) {
        const indent = line.match(/^(\s*)/)[1];
        const content = line.substring(indent.length);
        return indent + '>> ' + content;
      }
    }
    return line;
  });
  return result.join('\n');
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the object from export const xxx = { ... }
  const match = content.match(/export const (\w+) = (\{[\s\S]*\});/);
  if (!match) {
    console.log('  ERROR: Could not parse file structure');
    return 0;
  }
  
  const varName = match[1];
  const data = JSON.parse(match[2]);
  
  let modified = 0;
  data.questions.forEach(q => {
    if (q.answer) {
      const original = q.answer;
      q.answer = addPrefixesToAnswer(q.answer);
      if (original !== q.answer) modified++;
    }
  });
  
  // Write back with proper export format
  fs.writeFileSync(filePath, `export const ${varName} = ${JSON.stringify(data, null, 2)};\n`);
  console.log(`  Modified ${modified} answers`);
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

let totalModified = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    totalModified += processFile(file);
  } else {
    console.log(`NOT FOUND: ${file}`);
  }
});

console.log(`\nTotal answers modified: ${totalModified}`);
