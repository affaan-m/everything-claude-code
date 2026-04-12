'use strict';
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ALLOWED = new Set(['name','description','license','compatibility','allowed-tools','metadata']);
const skillsDir = 'C:/Users/fadec/WorkingSpace/everything-claude-code/skills';

function getAllSkillMds(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      const skillMd = path.join(full, 'SKILL.md');
      if (fs.existsSync(skillMd)) results.push(skillMd);
    }
  }
  return results;
}

let fixed = 0, errors = 0;
for (const filePath of getAllSkillMds(skillsDir)) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---\n*([\s\S]*)$/);
    if (!match) { process.stderr.write('No frontmatter: ' + filePath + '\n'); errors++; continue; }
    const fm = yaml.load(match[1]);
    const body = match[2];
    let changed = false;
    if (!fm.metadata) fm.metadata = {};
    for (const key of Object.keys(fm)) {
      if (ALLOWED.has(key)) continue;
      if (key === 'tools') {
        if (!fm['allowed-tools']) fm['allowed-tools'] = String(fm[key]);
      } else {
        fm.metadata[key] = String(fm[key]);
      }
      delete fm[key];
      changed = true;
    }
    for (const k of Object.keys(fm.metadata)) {
      if (typeof fm.metadata[k] !== 'string') { fm.metadata[k] = String(fm.metadata[k]); changed = true; }
    }
    if (Object.keys(fm.metadata).length === 0) delete fm.metadata;
    if (!changed) continue;
    const newFm = yaml.dump(fm, { lineWidth: -1 }).trimEnd();
    const newContent = '---\n' + newFm + '\n---\n' + body;
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixed++;
  } catch(e) {
    process.stderr.write('Error in ' + filePath + ': ' + e.message + '\n');
    errors++;
  }
}
process.stdout.write('Fixed: ' + fixed + ' Errors: ' + errors + '\n');
