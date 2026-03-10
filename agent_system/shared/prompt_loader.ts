'use strict';

const path = require('path');
const { readText } = require('./file_utils.ts');

const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

function renderTemplate(template, variables) {
  let rendered = String(template || '');
  const entries = Object.entries(variables || {});

  for (const [key, value] of entries) {
    const token = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g');
    rendered = rendered.replace(token, stringifyValue(value));
  }

  return rendered;
}

function stringifyValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => stringifyValue(entry)).join('\n');
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? '');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadPrompt(fileName, variables) {
  const promptPath = path.join(PROMPTS_DIR, fileName);
  const template = readText(promptPath, '');
  return renderTemplate(template, variables);
}

module.exports = {
  loadPrompt,
  renderTemplate
};
