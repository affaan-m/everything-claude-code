#!/usr/bin/env node
/**
 * Validate that agents/code-reviewer.md carries the anti-false-positive
 * guardrails that address issue #1486.
 *
 * Prior versions of the agent flagged many HIGH-severity findings on
 * well-formed diffs (see issue #1486). These guardrails force the agent
 * to justify every finding, enumerate common LLM-reviewer false positives,
 * and make clear that a zero-finding review is a valid outcome.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const reviewerPath = path.join(repoRoot, 'agents', 'code-reviewer.md');

const requiredHeadings = [
  '## Confidence-Based Filtering',
  '### Pre-Report Gate',
  '### HIGH / CRITICAL Require Proof',
  '### It Is Acceptable — And Expected — To Return Zero Findings',
  '## Common False Positives — Skip These'
];

const requiredPatterns = [
  // Pre-report gate must force the reviewer to cite lines, describe
  // concrete failure modes, and check surrounding context before writing a
  // finding. All four gate questions must stay locked in.
  /Can I cite the exact line/i,
  /concrete failure mode/i,
  /Have I read the surrounding context/i,
  /Severity inflation/i,

  // HIGH/CRITICAL must carry proof.
  /exact snippet and line number/i,
  /specific failure scenario/i,
  /demote to MEDIUM or drop/i,

  // Zero findings must be an explicitly valid outcome.
  /clean review is a valid review/i,
  /Manufactured findings/i,

  // Enumerated false-positive patterns from issue #1486.
  /Common False Positives/i,
  /Consider adding error handling/i,
  /Missing input validation/i,
  /Magic number/i,
  /Would a senior engineer on this team actually change this in review/i,

  // Approval must not be withheld to appear rigorous.
  /Do \*\*not\*\* withhold approval to appear rigorous/i
];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function read() {
  return fs.readFileSync(reviewerPath, 'utf8');
}

function run() {
  console.log('\n=== Testing code-reviewer false-positive guardrails ===\n');

  let passed = 0;
  let failed = 0;

  for (const heading of requiredHeadings) {
    if (
      test(`code-reviewer.md contains heading: ${heading}`, () => {
        const source = read();
        assert.ok(source.includes(heading), `code-reviewer.md missing required heading "${heading}"`);
      })
    )
      passed++;
    else failed++;
  }

  for (const pattern of requiredPatterns) {
    if (
      test(`code-reviewer.md matches ${pattern}`, () => {
        const source = read();
        assert.ok(pattern.test(source), `code-reviewer.md missing required pattern ${pattern}`);
      })
    )
      passed++;
    else failed++;
  }

  // The 80% confidence floor must survive so that the agent still has a
  // quantitative bar, not just prose heuristics.
  if (
    test('code-reviewer.md retains the >80% confidence threshold', () => {
      const source = read();
      assert.ok(/>\s*80%\s*confident/i.test(source), 'code-reviewer.md missing >80% confidence threshold');
    })
  )
    passed++;
  else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
