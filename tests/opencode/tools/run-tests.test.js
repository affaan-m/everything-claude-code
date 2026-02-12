/**
 * Tests for .opencode/tools/run-tests.ts
 *
 * Run with: bun tests/opencode/tools/run-tests.test.js
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

function tryRegisterTsNode() {
  try {
    require("ts-node/register/transpile-only");
    return true;
  } catch (err) {
    try {
      require("ts-node/register");
      return true;
    } catch (err2) {
      return false;
    }
  }
}

function canLoadTypeScript() {
  if (process.versions && process.versions.bun) {
    return true;
  }

  return tryRegisterTsNode();
}

function createTestDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "run-tests-"));
}

function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result
        .then(() => {
          console.log(`  \u2713 ${name}`);
          return true;
        })
        .catch((err) => {
          console.log(`  \u2717 ${name}`);
          console.log(`    Error: ${err.message}`);
          return false;
        });
    }
    console.log(`  \u2713 ${name}`);
    return Promise.resolve(true);
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return Promise.resolve(false);
  }
}

function getStubRoot() {
  return path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    ".opencode",
    "node_modules",
    "@opencode-ai",
    "plugin",
  );
}

function ensureToolStub() {
  const stubRoot = getStubRoot();
  const pkgPath = path.join(stubRoot, "package.json");
  const toolPath = path.join(stubRoot, "tool.js");

  fs.mkdirSync(stubRoot, { recursive: true });
  fs.writeFileSync(pkgPath, JSON.stringify({ type: "module" }));
  fs.writeFileSync(
    toolPath,
    "const schemaBuilder = () => ({ optional: () => schemaBuilder(), describe: () => schemaBuilder() });\n" +
      "export const tool = (definition) => definition;\n" +
      "tool.schema = {\n" +
      "  string: schemaBuilder,\n" +
      "  boolean: schemaBuilder,\n" +
      "};\n",
  );

  return { stubRoot, pkgPath, toolPath };
}

function cleanupToolStub(paths) {
  if (!paths) {
    return;
  }

  const { stubRoot } = paths;
  fs.rmSync(stubRoot, { recursive: true, force: true });
}

async function loadTool() {
  if (!canLoadTypeScript()) {
    return null;
  }

  const toolPath = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    ".opencode",
    "tools",
    "run-tests.ts",
  );

  const toolUrl = pathToFileURL(toolPath).href;
  const mod = await import(toolUrl);
  return mod.default || mod;
}

async function runTests() {
  console.log("\n=== Testing run-tests tool ===\n");

  const stubPaths = ensureToolStub();
  const tool = await loadTool();
  if (!tool || typeof tool.execute !== "function") {
    cleanupToolStub(stubPaths);
    console.log(
      "  Skipping: ts-node or Bun is required to load the TypeScript tool",
    );
    console.log("\nPassed: 0");
    console.log("Failed: 0");
    return;
  }

  let passed = 0;
  let failed = 0;

  if (
    await test("builds npm/jest command with options", async () => {
      const testDir = createTestDir();
      try {
        fs.writeFileSync(path.join(testDir, "package-lock.json"), "{}");
        fs.writeFileSync(
          path.join(testDir, "package.json"),
          JSON.stringify({
            name: "test",
            devDependencies: { jest: "^29.0.0" },
          }),
        );

        const result = await tool.execute(
          {
            pattern: "foo.test.js",
            coverage: true,
            watch: true,
            updateSnapshots: true,
          },
          { directory: testDir },
        );

        const payload = JSON.parse(result);
        assert.strictEqual(payload.packageManager, "npm");
        assert.strictEqual(payload.testFramework, "jest");
        assert.strictEqual(
          payload.command,
          "npm run test -- --coverage --watch -u --testPathPattern foo.test.js",
        );
      } finally {
        cleanupTestDir(testDir);
      }
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  if (
    await test("builds pnpm/vitest command with pattern", async () => {
      const testDir = createTestDir();
      try {
        fs.writeFileSync(path.join(testDir, "pnpm-lock.yaml"), "");
        fs.writeFileSync(
          path.join(testDir, "package.json"),
          JSON.stringify({
            name: "test",
            devDependencies: { vitest: "^1.0.0" },
          }),
        );

        const result = await tool.execute(
          { pattern: "src/example.test.ts" },
          { directory: testDir },
        );

        const payload = JSON.parse(result);
        assert.strictEqual(payload.packageManager, "pnpm");
        assert.strictEqual(payload.testFramework, "vitest");
        assert.strictEqual(
          payload.command,
          "pnpm test --testPathPattern src/example.test.ts",
        );
      } finally {
        cleanupTestDir(testDir);
      }
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  if (
    await test("builds uv/pytest command for python project", async () => {
      const testDir = createTestDir();
      try {
        fs.writeFileSync(path.join(testDir, "uv.lock"), "");
        fs.writeFileSync(path.join(testDir, "pyproject.toml"), "[tool.uv]\n");

        const result = await tool.execute(
          { pattern: "unit", coverage: true, watch: true },
          { directory: testDir },
        );

        const payload = JSON.parse(result);
        assert.strictEqual(payload.packageManager, "uv");
        assert.strictEqual(payload.testFramework, "pytest");
        assert.strictEqual(
          payload.command,
          "uv run pytest -v --cov --cov-report=term-missing --looponfail -k unit",
        );
      } finally {
        cleanupTestDir(testDir);
      }
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  cleanupToolStub(stubPaths);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
