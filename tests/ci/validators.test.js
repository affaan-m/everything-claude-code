/**
 * Tests for CI validator scripts
 *
 * Tests both success paths (against the real project) and error paths
 * (against temporary fixture directories via wrapper scripts).
 *
 * Run with: node tests/ci/validators.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const validatorsDir = path.join(__dirname, '..', '..', 'scripts', 'ci');

// Test helpers
function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function createTestDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ci-validator-test-'));
}

function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

/**
 * Run a validator script via a wrapper that overrides its directory constant.
 * This allows testing error cases without modifying real project files.
 *
 * @param {string} validatorName - e.g., 'validate-agents'
 * @param {string} dirConstant - the constant name to override (e.g., 'AGENTS_DIR')
 * @param {string} overridePath - the temp directory to use
 * @returns {{code: number, stdout: string, stderr: string}}
 */
function runValidatorWithDir(validatorName, dirConstant, overridePath) {
  const validatorPath = path.join(validatorsDir, `${validatorName}.js`);

  // Read the validator source, replace the directory constant, and run as a wrapper
  let source = fs.readFileSync(validatorPath, 'utf8');

  // Remove the shebang line
  source = source.replace(/^#!.*\n/, '');

  // Replace the directory constant with our override path
  const dirRegex = new RegExp(`const ${dirConstant} = .*?;`);
  source = source.replace(dirRegex, `const ${dirConstant} = ${JSON.stringify(overridePath)};`);

  try {
    const stdout = execFileSync('node', ['-e', source], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: err.stdout || '',
      stderr: err.stderr || '',
    };
  }
}

/**
 * Run a validator script with multiple directory overrides.
 * @param {string} validatorName
 * @param {Record<string, string>} overrides - map of constant name to path
 */
function runValidatorWithDirs(validatorName, overrides) {
  const validatorPath = path.join(validatorsDir, `${validatorName}.js`);
  let source = fs.readFileSync(validatorPath, 'utf8');
  source = source.replace(/^#!.*\n/, '');
  for (const [constant, overridePath] of Object.entries(overrides)) {
    const dirRegex = new RegExp(`const ${constant} = .*?;`);
    source = source.replace(dirRegex, `const ${constant} = ${JSON.stringify(overridePath)};`);
  }
  try {
    const stdout = execFileSync('node', ['-e', source], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: err.stdout || '',
      stderr: err.stderr || '',
    };
  }
}

/**
 * Run a validator script directly (tests real project)
 */
function runValidator(validatorName) {
  const validatorPath = path.join(validatorsDir, `${validatorName}.js`);
  try {
    const stdout = execFileSync('node', [validatorPath], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: err.stdout || '',
      stderr: err.stderr || '',
    };
  }
}

function runTests() {
  console.log('\n=== Testing CI Validators ===\n');

  let passed = 0;
  let failed = 0;

  // ==========================================
  // validate-agents.js
  // ==========================================
  console.log('validate-agents.js:');

  if (test('passes on real project agents', () => {
    const result = runValidator('validate-agents');
    assert.strictEqual(result.code, 0, `Should pass, got stderr: ${result.stderr}`);
    assert.ok(result.stdout.includes('Validated'), 'Should output validation count');
  })) passed++; else failed++;

  if (test('fails on agent without frontmatter', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'bad-agent.md'), '# No frontmatter here\nJust content.');

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should exit 1 for missing frontmatter');
    assert.ok(result.stderr.includes('Missing frontmatter'), 'Should report missing frontmatter');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on agent missing required model field', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'no-model.md'), '---\ntools: Read, Write\n---\n# Agent');

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should exit 1 for missing model');
    assert.ok(result.stderr.includes('model'), 'Should report missing model field');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on agent missing required tools field', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'no-tools.md'), '---\nmodel: sonnet\n---\n# Agent');

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should exit 1 for missing tools');
    assert.ok(result.stderr.includes('tools'), 'Should report missing tools field');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('passes on valid agent with all required fields', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'good-agent.md'), '---\nmodel: sonnet\ntools: Read, Write\n---\n# Agent');

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should pass for valid agent');
    assert.ok(result.stdout.includes('Validated 1'), 'Should report 1 validated');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('handles frontmatter with BOM and CRLF', () => {
    const testDir = createTestDir();
    const content = '\uFEFF---\r\nmodel: sonnet\r\ntools: Read, Write\r\n---\r\n# Agent';
    fs.writeFileSync(path.join(testDir, 'bom-agent.md'), content);

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should handle BOM and CRLF');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('handles frontmatter with colons in values', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'colon-agent.md'), '---\nmodel: sonnet\ntools: Read, Write, Bash\ndescription: Run this: always check: everything\n---\n# Agent');

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should handle colons in values');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('skips non-md files', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'readme.txt'), 'Not an agent');
    fs.writeFileSync(path.join(testDir, 'valid.md'), '---\nmodel: sonnet\ntools: Read\n---\n# Agent');

    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should only validate .md files');
    assert.ok(result.stdout.includes('Validated 1'), 'Should count only .md files');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('exits 0 when directory does not exist', () => {
    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', '/nonexistent/dir');
    assert.strictEqual(result.code, 0, 'Should skip when no agents dir');
    assert.ok(result.stdout.includes('skipping'), 'Should say skipping');
  })) passed++; else failed++;

  if (test('rejects agent with empty model value', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'empty.md'), '---\nmodel:\ntools: Read, Write\n---\n# Empty model');
    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should reject empty model');
    assert.ok(result.stderr.includes('model'), 'Should mention model field');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('rejects agent with empty tools value', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'empty.md'), '---\nmodel: claude-sonnet-4-5-20250929\ntools:\n---\n# Empty tools');
    const result = runValidatorWithDir('validate-agents', 'AGENTS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should reject empty tools');
    assert.ok(result.stderr.includes('tools'), 'Should mention tools field');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // ==========================================
  // validate-hooks.js
  // ==========================================
  console.log('\nvalidate-hooks.js:');

  if (test('passes on real project hooks.json', () => {
    const result = runValidator('validate-hooks');
    assert.strictEqual(result.code, 0, `Should pass, got stderr: ${result.stderr}`);
    assert.ok(result.stdout.includes('Validated'), 'Should output validation count');
  })) passed++; else failed++;

  if (test('exits 0 when hooks.json does not exist', () => {
    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', '/nonexistent/hooks.json');
    assert.strictEqual(result.code, 0, 'Should skip when no hooks.json');
  })) passed++; else failed++;

  if (test('fails on invalid JSON', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, '{ not valid json }}}');

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on invalid JSON');
    assert.ok(result.stderr.includes('Invalid JSON'), 'Should report invalid JSON');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on invalid event type', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        InvalidEventType: [{ matcher: 'test', hooks: [{ type: 'command', command: 'echo hi' }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on invalid event type');
    assert.ok(result.stderr.includes('Invalid event type'), 'Should report invalid event type');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on hook entry missing type field', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ command: 'echo hi' }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on missing type');
    assert.ok(result.stderr.includes('type'), 'Should report missing type');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on hook entry missing command field', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ type: 'command' }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on missing command');
    assert.ok(result.stderr.includes('command'), 'Should report missing command');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on invalid async field type', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ type: 'command', command: 'echo', async: 'yes' }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on non-boolean async');
    assert.ok(result.stderr.includes('async'), 'Should report async type error');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on negative timeout', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ type: 'command', command: 'echo', timeout: -5 }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on negative timeout');
    assert.ok(result.stderr.includes('timeout'), 'Should report timeout error');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on invalid inline JS syntax', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ type: 'command', command: 'node -e "function {"' }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on invalid inline JS');
    assert.ok(result.stderr.includes('invalid inline JS'), 'Should report JS syntax error');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('passes valid inline JS commands', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ type: 'command', command: 'node -e "console.log(1+2)"' }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 0, 'Should pass valid inline JS');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('validates array command format', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test', hooks: [{ type: 'command', command: ['node', '-e', 'console.log(1)'] }] }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 0, 'Should accept array command format');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('validates legacy array format', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify([
      { matcher: 'test', hooks: [{ type: 'command', command: 'echo ok' }] }
    ]));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 0, 'Should accept legacy array format');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on matcher missing hooks array', () => {
    const testDir = createTestDir();
    const hooksFile = path.join(testDir, 'hooks.json');
    fs.writeFileSync(hooksFile, JSON.stringify({
      hooks: {
        PreToolUse: [{ matcher: 'test' }]
      }
    }));

    const result = runValidatorWithDir('validate-hooks', 'HOOKS_FILE', hooksFile);
    assert.strictEqual(result.code, 1, 'Should fail on missing hooks array');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // ==========================================
  // validate-skills.js
  // ==========================================
  console.log('\nvalidate-skills.js:');

  if (test('passes on real project skills', () => {
    const result = runValidator('validate-skills');
    assert.strictEqual(result.code, 0, `Should pass, got stderr: ${result.stderr}`);
    assert.ok(result.stdout.includes('Validated'), 'Should output validation count');
  })) passed++; else failed++;

  if (test('exits 0 when directory does not exist', () => {
    const result = runValidatorWithDir('validate-skills', 'SKILLS_DIR', '/nonexistent/dir');
    assert.strictEqual(result.code, 0, 'Should skip when no skills dir');
  })) passed++; else failed++;

  if (test('fails on skill directory without SKILL.md', () => {
    const testDir = createTestDir();
    fs.mkdirSync(path.join(testDir, 'broken-skill'));
    // No SKILL.md inside

    const result = runValidatorWithDir('validate-skills', 'SKILLS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should fail on missing SKILL.md');
    assert.ok(result.stderr.includes('Missing SKILL.md'), 'Should report missing SKILL.md');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on empty SKILL.md', () => {
    const testDir = createTestDir();
    const skillDir = path.join(testDir, 'empty-skill');
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '');

    const result = runValidatorWithDir('validate-skills', 'SKILLS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should fail on empty SKILL.md');
    assert.ok(result.stderr.includes('Empty'), 'Should report empty file');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('passes on valid skill directory', () => {
    const testDir = createTestDir();
    const skillDir = path.join(testDir, 'good-skill');
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# My Skill\nDescription here.');

    const result = runValidatorWithDir('validate-skills', 'SKILLS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should pass for valid skill');
    assert.ok(result.stdout.includes('Validated 1'), 'Should report 1 validated');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('ignores non-directory entries', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'not-a-skill.md'), '# README');
    const skillDir = path.join(testDir, 'real-skill');
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# Skill');

    const result = runValidatorWithDir('validate-skills', 'SKILLS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should ignore non-directory entries');
    assert.ok(result.stdout.includes('Validated 1'), 'Should count only directories');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on whitespace-only SKILL.md', () => {
    const testDir = createTestDir();
    const skillDir = path.join(testDir, 'blank-skill');
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '   \n\t\n  ');

    const result = runValidatorWithDir('validate-skills', 'SKILLS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should reject whitespace-only SKILL.md');
    assert.ok(result.stderr.includes('Empty file'), 'Should report empty file');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // ==========================================
  // validate-commands.js
  // ==========================================
  console.log('\nvalidate-commands.js:');

  if (test('passes on real project commands', () => {
    const result = runValidator('validate-commands');
    assert.strictEqual(result.code, 0, `Should pass, got stderr: ${result.stderr}`);
    assert.ok(result.stdout.includes('Validated'), 'Should output validation count');
  })) passed++; else failed++;

  if (test('exits 0 when directory does not exist', () => {
    const result = runValidatorWithDir('validate-commands', 'COMMANDS_DIR', '/nonexistent/dir');
    assert.strictEqual(result.code, 0, 'Should skip when no commands dir');
  })) passed++; else failed++;

  if (test('fails on empty command file', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'empty.md'), '');

    const result = runValidatorWithDir('validate-commands', 'COMMANDS_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should fail on empty file');
    assert.ok(result.stderr.includes('Empty'), 'Should report empty file');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('passes on valid command files', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'deploy.md'), '# Deploy\nDeploy the application.');
    fs.writeFileSync(path.join(testDir, 'test.md'), '# Test\nRun all tests.');

    const result = runValidatorWithDir('validate-commands', 'COMMANDS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should pass for valid commands');
    assert.ok(result.stdout.includes('Validated 2'), 'Should report 2 validated');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('ignores non-md files', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'script.js'), 'console.log(1)');
    fs.writeFileSync(path.join(testDir, 'valid.md'), '# Command');

    const result = runValidatorWithDir('validate-commands', 'COMMANDS_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should ignore non-md files');
    assert.ok(result.stdout.includes('Validated 1'), 'Should count only .md files');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('detects broken command cross-reference', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'my-cmd.md'), '# Command\nUse `/nonexistent-cmd` to do things.');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 1, 'Should fail on broken command ref');
    assert.ok(result.stderr.includes('nonexistent-cmd'), 'Should report broken command');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('detects broken agent path reference', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'cmd.md'), '# Command\nAgent: `agents/fake-agent.md`');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 1, 'Should fail on broken agent ref');
    assert.ok(result.stderr.includes('fake-agent'), 'Should report broken agent');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('skips references inside fenced code blocks', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'cmd.md'),
      '# Command\n\n```\nagents/example-agent.md\n`/example-cmd`\n```\n');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 0, 'Should skip refs inside code blocks');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('detects broken workflow agent reference', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(agentsDir, 'planner.md'), '---\nmodel: sonnet\ntools: Read\n---\n# A');
    fs.writeFileSync(path.join(testDir, 'cmd.md'), '# Command\nWorkflow:\nplanner -> ghost-agent');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 1, 'Should fail on broken workflow agent');
    assert.ok(result.stderr.includes('ghost-agent'), 'Should report broken workflow agent');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('skips command references on creates: lines', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    // "Creates: `/new-table`" should NOT flag /new-table as a broken ref
    fs.writeFileSync(path.join(testDir, 'gen.md'),
      '# Generator\n\n→ Creates: `/new-table`\nWould create: `/new-endpoint`');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 0, 'Should skip creates: lines');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('accepts valid cross-reference between commands', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'build.md'), '# Build\nSee also `/deploy` for deployment.');
    fs.writeFileSync(path.join(testDir, 'deploy.md'), '# Deploy\nRun `/build` first.');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 0, 'Should accept valid cross-refs');
    assert.ok(result.stdout.includes('Validated 2'), 'Should validate both');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('checks references in unclosed code blocks', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    // Unclosed code block: the ``` regex won't strip it, so refs inside are checked
    fs.writeFileSync(path.join(testDir, 'bad.md'),
      '# Command\n\n```\n`/phantom-cmd`\nno closing block');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    // Unclosed code blocks are NOT stripped, so refs inside are validated
    assert.strictEqual(result.code, 1, 'Should check refs in unclosed code blocks');
    assert.ok(result.stderr.includes('phantom-cmd'), 'Should report broken ref from unclosed block');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('captures ALL command references on a single line (multi-ref)', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    // Line with two command references — both should be detected
    fs.writeFileSync(path.join(testDir, 'multi.md'),
      '# Multi\nUse `/ghost-a` and `/ghost-b` together.');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 1, 'Should fail on broken refs');
    // BOTH ghost-a AND ghost-b must be reported (this was the greedy regex bug)
    assert.ok(result.stderr.includes('ghost-a'), 'Should report first ref /ghost-a');
    assert.ok(result.stderr.includes('ghost-b'), 'Should report second ref /ghost-b');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('captures three command refs on one line', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'triple.md'),
      '# Triple\nChain `/alpha`, `/beta`, and `/gamma` in order.');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 1, 'Should fail on all three broken refs');
    assert.ok(result.stderr.includes('alpha'), 'Should report /alpha');
    assert.ok(result.stderr.includes('beta'), 'Should report /beta');
    assert.ok(result.stderr.includes('gamma'), 'Should report /gamma');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('multi-ref line with one valid and one invalid ref', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    // "real-cmd" exists, "fake-cmd" does not
    fs.writeFileSync(path.join(testDir, 'real-cmd.md'), '# Real\nA real command.');
    fs.writeFileSync(path.join(testDir, 'mixed.md'),
      '# Mixed\nRun `/real-cmd` then `/fake-cmd`.');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 1, 'Should fail for the fake ref');
    assert.ok(result.stderr.includes('fake-cmd'), 'Should report /fake-cmd');
    // real-cmd should NOT appear in errors
    assert.ok(!result.stderr.includes('real-cmd'), 'Should not report valid /real-cmd');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('creates: line with multiple refs skips entire line', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    // Both refs on a "Creates:" line should be skipped entirely
    fs.writeFileSync(path.join(testDir, 'gen.md'),
      '# Generator\nCreates: `/new-a` and `/new-b`');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 0, 'Should skip all refs on creates: line');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  if (test('validates valid workflow diagram with known agents', () => {
    const testDir = createTestDir();
    const agentsDir = createTestDir();
    const skillsDir = createTestDir();
    fs.writeFileSync(path.join(agentsDir, 'planner.md'), '---\nmodel: sonnet\ntools: Read\n---\n# P');
    fs.writeFileSync(path.join(agentsDir, 'reviewer.md'), '---\nmodel: sonnet\ntools: Read\n---\n# R');
    fs.writeFileSync(path.join(testDir, 'flow.md'), '# Workflow\n\nplanner -> reviewer');

    const result = runValidatorWithDirs('validate-commands', {
      COMMANDS_DIR: testDir, AGENTS_DIR: agentsDir, SKILLS_DIR: skillsDir
    });
    assert.strictEqual(result.code, 0, 'Should pass on valid workflow');
    cleanupTestDir(testDir); cleanupTestDir(agentsDir); cleanupTestDir(skillsDir);
  })) passed++; else failed++;

  // ==========================================
  // validate-rules.js
  // ==========================================
  console.log('\nvalidate-rules.js:');

  if (test('passes on real project rules', () => {
    const result = runValidator('validate-rules');
    assert.strictEqual(result.code, 0, `Should pass, got stderr: ${result.stderr}`);
    assert.ok(result.stdout.includes('Validated'), 'Should output validation count');
  })) passed++; else failed++;

  if (test('exits 0 when directory does not exist', () => {
    const result = runValidatorWithDir('validate-rules', 'RULES_DIR', '/nonexistent/dir');
    assert.strictEqual(result.code, 0, 'Should skip when no rules dir');
  })) passed++; else failed++;

  if (test('fails on empty rule file', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'empty.md'), '');

    const result = runValidatorWithDir('validate-rules', 'RULES_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should fail on empty rule file');
    assert.ok(result.stderr.includes('Empty'), 'Should report empty file');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('passes on valid rule files', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'coding.md'), '# Coding Rules\nUse immutability.');

    const result = runValidatorWithDir('validate-rules', 'RULES_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should pass for valid rules');
    assert.ok(result.stdout.includes('Validated 1'), 'Should report 1 validated');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('fails on whitespace-only rule file', () => {
    const testDir = createTestDir();
    fs.writeFileSync(path.join(testDir, 'blank.md'), '   \n\t\n  ');

    const result = runValidatorWithDir('validate-rules', 'RULES_DIR', testDir);
    assert.strictEqual(result.code, 1, 'Should reject whitespace-only rule file');
    assert.ok(result.stderr.includes('Empty'), 'Should report empty file');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('validates rules in subdirectories recursively', () => {
    const testDir = createTestDir();
    const subDir = path.join(testDir, 'sub');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(testDir, 'top.md'), '# Top Level Rule');
    fs.writeFileSync(path.join(subDir, 'nested.md'), '# Nested Rule');

    const result = runValidatorWithDir('validate-rules', 'RULES_DIR', testDir);
    assert.strictEqual(result.code, 0, 'Should validate nested rules');
    assert.ok(result.stdout.includes('Validated 2'), 'Should find both rules');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // Summary
  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
