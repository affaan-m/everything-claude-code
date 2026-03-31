const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'ci', 'check-unicode-safety.js');

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    return true;
  } catch (error) {
    console.log(`FAIL: ${name}`);
    console.log(`  ${error.message}`);
    return false;
  }
}

function runCheck(root, args = []) {
  return spawnSync('node', [scriptPath, ...args], {
    env: {
      ...process.env,
      ECC_UNICODE_SCAN_ROOT: root,
    },
    encoding: 'utf8',
  });
}

function makeTempRoot(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

const warningEmoji = String.fromCodePoint(0x26A0, 0xFE0F);
const toolsEmoji = String.fromCodePoint(0x1F6E0, 0xFE0F);
const zeroWidthSpace = String.fromCodePoint(0x200B);
const rocketEmoji = String.fromCodePoint(0x1F680);

let passed = 0;
let failed = 0;

if (
  test('fails on invisible unicode and emoji before cleanup', () => {
    const root = makeTempRoot('ecc-unicode-check-');
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs', 'guide.md'), `> ${warningEmoji} Important launch note\n`);
    fs.writeFileSync(path.join(root, 'scripts', 'sample.js'), `const x = "a${zeroWidthSpace}";\n`);

    const result = runCheck(root);
    assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /dangerous-invisible U\+200B/);
    assert.match(result.stderr, /emoji U\+26A0/);
  })
)
  passed++;
else failed++;

if (
  test('write mode removes emoji and invisible unicode', () => {
    const root = makeTempRoot('ecc-unicode-fix-');
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs', 'guide.md'), `> ${warningEmoji} Important launch note\n`);
    fs.writeFileSync(path.join(root, 'README.md'), `## ${toolsEmoji} Tools\n`);
    fs.writeFileSync(path.join(root, 'note.txt'), `one${zeroWidthSpace}two\n`);

    const writeResult = runCheck(root, ['--write']);
    assert.strictEqual(writeResult.status, 0, writeResult.stdout + writeResult.stderr);

    assert.strictEqual(fs.readFileSync(path.join(root, 'docs', 'guide.md'), 'utf8'), '> WARNING: Important launch note\n');
    assert.strictEqual(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), '## Tools\n');
    assert.strictEqual(fs.readFileSync(path.join(root, 'note.txt'), 'utf8'), 'onetwo\n');

    const cleanResult = runCheck(root);
    assert.strictEqual(cleanResult.status, 0, cleanResult.stdout + cleanResult.stderr);
  })
)
  passed++;
else failed++;

if (
  test('write mode does not rewrite executable files', () => {
    const root = makeTempRoot('ecc-unicode-code-');
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    const scriptFile = path.join(root, 'scripts', 'sample.js');
    const original = `const label = "Launch ${rocketEmoji}";\n`;
    fs.writeFileSync(scriptFile, original);

    const result = runCheck(root, ['--write']);
    assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /scripts[/\\]sample\.js:1:23 emoji U\+1F680/);
    assert.strictEqual(fs.readFileSync(scriptFile, 'utf8'), original);
  })
)
  passed++;
else failed++;

if (
  test('plain symbols like copyright remain allowed', () => {
    const root = makeTempRoot('ecc-unicode-symbols-');
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs', 'legal.md'), 'Copyright © ECC\nTrademark ® ECC\n');

    const result = runCheck(root);
    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
