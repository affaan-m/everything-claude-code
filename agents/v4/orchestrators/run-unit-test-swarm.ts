#!/usr/bin/env tsx

/**
 * Run Unit Test Swarm
 *
 * Auto-discovers service files lacking test coverage, dispatches parallel
 * swarm agents to generate tests, runs them, fixes failures, and reports
 * coverage delta.
 *
 * Usage:
 *   npx tsx orchestrators/run-unit-test-swarm.ts                    # auto-discover
 *   npx tsx orchestrators/run-unit-test-swarm.ts src/services/Foo.js # specific file
 *   npx tsx orchestrators/run-unit-test-swarm.ts --dry-run           # analyze only
 *
 * Environment:
 *   MAX_PARALLEL=6       Max concurrent agents (default: 6)
 *   MAX_FIX_ATTEMPTS=2   Debug/fix retry loops per file (default: 2)
 */

import { readdirSync, existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { unitTestOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runTask } from './helpers.js';
import { createUnitTestHandlers } from './unit-test/handlers.js';
import { analyzeSource } from './unit-test/source-analyzer.js';

// =========================================================================
// Configuration
// =========================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const SRC_DIR = join(PROJECT_ROOT, 'src', 'services');
const TEST_DIR = 'tests/unit/services';
const ABS_TEST_DIR = join(PROJECT_ROOT, TEST_DIR);
const MAX_PARALLEL = parseInt(process.env.MAX_PARALLEL || '15', 10);
const MAX_FIX_ATTEMPTS = parseInt(process.env.MAX_FIX_ATTEMPTS || '2', 10);

interface FileTarget {
  sourceFile: string;
  testFile: string;
  className: string;
  methodCount: number;
  pureCount: number;
}

// =========================================================================
// Discovery — find service files without corresponding test files
// =========================================================================

function discoverUncoveredFiles(explicitFiles?: string[]): FileTarget[] {
  const targets: FileTarget[] = [];

  const sourceFiles = explicitFiles || findAllServiceFiles();

  for (const sourceFile of sourceFiles) {
    const base = basename(sourceFile, '.js');
    const isValidator = sourceFile.includes('/validators/');
    const testFileName = isValidator ? `validators/${base}.test.js` : `${base}.test.js`;
    const testFilePath = join(ABS_TEST_DIR, testFileName);

    // Skip if test already exists
    if (existsSync(testFilePath)) continue;

    // Analyze source to check if it's testable
    try {
      const analysis = analyzeSource(sourceFile);
      if (analysis.classes.length === 0) continue;

      const cls = analysis.classes[0];
      const pureCount = cls.methods.filter(m => m.isPure && m.name !== 'constructor').length;
      const totalMethods = cls.methods.filter(m => m.name !== 'constructor').length;

      // Skip files with no testable methods
      if (totalMethods === 0) continue;

      targets.push({
        sourceFile,
        testFile: testFilePath,
        className: cls.className,
        methodCount: totalMethods,
        pureCount,
      });
    } catch {
      // Skip files that can't be analyzed
    }
  }

  // Sort by pure method count descending (highest coverage ROI first)
  targets.sort((a, b) => b.pureCount - a.pureCount);
  return targets;
}

function findAllServiceFiles(): string[] {
  const files: string[] = [];

  // Top-level services
  for (const f of readdirSync(SRC_DIR)) {
    if (f.endsWith('.js') && !f.startsWith('.') && f !== 'createServices.js') {
      files.push(join(SRC_DIR, f));
    }
  }

  // Validators subdirectory
  const validatorsDir = join(SRC_DIR, 'validators');
  if (existsSync(validatorsDir)) {
    for (const f of readdirSync(validatorsDir)) {
      if (f.endsWith('.js') && f !== 'index.js' && !f.startsWith('Base')) {
        files.push(join(validatorsDir, f));
      }
    }
  }

  return files;
}

// =========================================================================
// Swarm Execution
// =========================================================================

async function runSwarm(targets: FileTarget[], dryRun: boolean) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Unit Test Swarm                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`Discovered ${targets.length} files needing tests:\n`);
  for (const t of targets) {
    console.log(`  ${t.className.padEnd(35)} ${t.pureCount} pure / ${t.methodCount} total methods`);
  }
  console.log('');

  if (dryRun) {
    console.log('DRY RUN — no files will be generated.\n');
    printAnalysisSummary(targets);
    return;
  }

  // Set up orchestrator with real handlers
  const config = unitTestOrchestrator();
  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(config, true);

  // Register real handlers on the executor
  const handlers = createUnitTestHandlers({
    projectRoot: PROJECT_ROOT,
    testDir: TEST_DIR,
    coverageDir: 'coverage',
  });

  // Access the executor through the orchestrator's internal reference
  // We need to register handlers before tasks run
  const executor = (orchestrator as any).taskExecutor;
  for (const [type, handler] of handlers) {
    executor.registerHandler(type, handler);
  }

  const startTime = Date.now();
  const results: Array<{
    target: FileTarget;
    generated: boolean;
    passed: boolean;
    error?: string;
    fixAttempts: number;
  }> = [];

  // Process in parallel batches
  const batches = chunk(targets, MAX_PARALLEL);

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    console.log(`\n┌─────────────────────────────────────────────────────────┐`);
    console.log(`│ Batch ${batchIdx + 1}/${batches.length} — ${batch.length} agents                              │`);
    console.log(`└─────────────────────────────────────────────────────────┘\n`);

    // Phase 1: Generate tests directly (pure CPU — no orchestrator overhead)
    const testFiles: string[] = [];
    const testFileMap = new Map<string, FileTarget>();

    for (const target of batch) {
      try {
        const analysis = analyzeSource(target.sourceFile);
        if (analysis.classes.length === 0) {
          results.push({ target, generated: false, passed: false, error: 'No classes', fixAttempts: 0 });
          continue;
        }
        if (existsSync(target.testFile)) {
          results.push({ target, generated: false, passed: false, error: 'Already exists', fixAttempts: 0 });
          continue;
        }

        const { generateTestFile } = await import('./unit-test/test-generator.js');
        const testCode = generateTestFile({
          sourceFile: target.sourceFile,
          testFile: target.testFile,
          analysis,
          projectRoot: PROJECT_ROOT,
        });

        mkdirSync(dirname(target.testFile), { recursive: true });
        writeFileSync(target.testFile, testCode, 'utf-8');

        const totalMethods = analysis.classes[0].methods.filter((m: any) => m.name !== 'constructor').length;
        console.log(`  ✓ Generated: ${basename(target.testFile)} (${totalMethods} methods)`);
        testFiles.push(target.testFile);
        testFileMap.set(target.testFile, target);
      } catch (err: any) {
        console.log(`  ✗ Generate:  ${target.className} — ${err.message}`);
        results.push({ target, generated: false, passed: false, error: err.message, fixAttempts: 0 });
      }
    }

    if (testFiles.length === 0) continue;

    // Phase 2: Execute all batch tests in a single Jest run
    console.log(`\n  Running ${testFiles.length} test files...`);
    const fileArgs = testFiles.map(f => `"${f}"`).join(' ');
    let jestOutput = '';
    let jestClean = true;
    try {
      jestOutput = execSync(
        `npx jest ${fileArgs} --no-coverage --forceExit --detectOpenHandles 2>&1`,
        { cwd: PROJECT_ROOT, timeout: 120000, encoding: 'utf-8' }
      );
    } catch (err: any) {
      jestOutput = err.stdout || err.message || '';
      jestClean = false;
    }

    // Parse per-file pass/fail from Jest output
    for (const testFile of testFiles) {
      const target = testFileMap.get(testFile)!;
      const base = basename(testFile).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Jest outputs: "PASS unit tests/unit/services/Foo.test.js" or "FAIL unit ..."
      const passed = new RegExp(`PASS\\s+\\S*\\s*\\S*${base}`).test(jestOutput);
      const failed = new RegExp(`FAIL\\s+\\S*\\s*\\S*${base}`).test(jestOutput);

      if (passed && !failed) {
        console.log(`  \u2713 Passed:    ${basename(testFile)}`);
        results.push({ target, generated: true, passed: true, fixAttempts: 0 });
      } else {
        console.log(`  \u2717 Failed:    ${basename(testFile)}`);
        results.push({ target, generated: true, passed: false, error: 'Jest failure', fixAttempts: 0 });
      }
    }
  }

  // Stop orchestrator
  await orchestrator.stop();

  // =========================================================================
  // Summary
  // =========================================================================
  const duration = Date.now() - startTime;
  const generated = results.filter(r => r.generated).length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => r.generated && !r.passed).length;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Swarm Results                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`  Targets:     ${targets.length}`);
  console.log(`  Generated:   ${generated}`);
  console.log(`  Passing:     ${passed}`);
  console.log(`  Failing:     ${failed}`);
  console.log(`  Skipped:     ${results.filter(r => !r.generated).length}`);
  console.log(`  Duration:    ${(duration / 1000).toFixed(1)}s`);
  console.log('');

  if (passed > 0) {
    console.log('  Passing test files:');
    for (const r of results.filter(r => r.passed)) {
      console.log(`    ✓ ${r.target.testFile}`);
    }
  }

  if (failed > 0) {
    console.log('\n  Failing test files (may need manual attention):');
    for (const r of results.filter(r => r.generated && !r.passed)) {
      console.log(`    ✗ ${basename(r.target.testFile)} — ${r.error?.slice(0, 60)}`);
    }
  }

  // Run coverage if we have passing tests
  if (passed > 0) {
    console.log('\n  Running coverage analysis...');
    try {
      const covOutput = execSync(
        'npx jest --coverage --coverageReporters=text-summary --forceExit --detectOpenHandles 2>&1',
        { cwd: PROJECT_ROOT, timeout: 180000, encoding: 'utf-8' }
      );
      const linesMatch = covOutput.match(/Lines\s+:\s+([\d.]+)%/);
      if (linesMatch) {
        console.log(`\n  📊 Overall line coverage: ${linesMatch[1]}%`);
      }
    } catch (err: any) {
      const output = err.stdout || '';
      const linesMatch = output.match(/Lines\s+:\s+([\d.]+)%/);
      if (linesMatch) {
        console.log(`\n  📊 Overall line coverage: ${linesMatch[1]}%`);
      }
    }
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

// =========================================================================
// Helpers
// =========================================================================

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function printAnalysisSummary(targets: FileTarget[]) {
  let totalPure = 0;
  let totalMethods = 0;

  for (const t of targets) {
    totalPure += t.pureCount;
    totalMethods += t.methodCount;

    const analysis = analyzeSource(t.sourceFile);
    const cls = analysis.classes[0];
    if (!cls) continue;

    console.log(`\n  ${cls.className} (${relative(PROJECT_ROOT, t.sourceFile)})`);
    console.log(`    Constructor: (${cls.constructorParams.join(', ')})`);
    console.log(`    Pure methods:`);
    for (const m of cls.methods.filter(m => m.isPure && m.name !== 'constructor')) {
      console.log(`      ${m.isAsync ? 'async ' : ''}${m.isStatic ? 'static ' : ''}${m.name}(${m.params.join(', ')})`);
    }
    if (cls.methods.some(m => !m.isPure && m.name !== 'constructor')) {
      console.log(`    IO methods (need mocks):`);
      for (const m of cls.methods.filter(m => !m.isPure && m.name !== 'constructor')) {
        console.log(`      ${m.isAsync ? 'async ' : ''}${m.name}(${m.params.join(', ')})`);
      }
    }
  }

  console.log(`\n  Total: ${totalPure} pure + ${totalMethods - totalPure} IO = ${totalMethods} methods across ${targets.length} files`);
}

// =========================================================================
// Main
// =========================================================================

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicitFiles = args.filter(a => a.endsWith('.js')).map(f => {
  if (f.startsWith('/')) return f;
  return join(process.cwd(), f);
});

const targets = discoverUncoveredFiles(explicitFiles.length > 0 ? explicitFiles : undefined);

if (targets.length === 0) {
  console.log('All service files already have test coverage. Nothing to do.');
  process.exit(0);
}

runSwarm(targets, dryRun);
