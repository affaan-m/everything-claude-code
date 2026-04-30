/**
 * Tests for the published OpenCode hook plugin surface.
 */

const assert = require("node:assert")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { spawnSync } = require("node:child_process")
const { pathToFileURL } = require("node:url")

function runTest(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ ${name}`)
      return { passed: 1, failed: 0 }
    })
    .catch((error) => {
      console.log(`  ✗ ${name}`)
      console.error(`    ${error.stack || error.message}`)
      return { passed: 0, failed: 1 }
    })
}

async function loadPlugin() {
  const repoRoot = path.join(__dirname, "..")
  const buildResult = spawnSync("node", [path.join(repoRoot, "scripts", "build-opencode.js")], {
    cwd: repoRoot,
    encoding: "utf8",
  })
  assert.strictEqual(buildResult.status, 0, buildResult.stderr || buildResult.stdout)
  const pluginUrl = pathToFileURL(
    path.join(repoRoot, ".opencode", "dist", "plugins", "ecc-hooks.js")
  ).href
  return import(pluginUrl)
}

function createClient() {
  const logs = []
  return {
    logs,
    app: {
      log: ({ body }) => {
        logs.push(body)
        return Promise.resolve()
      },
    },
  }
}

function createFailingShell() {
  const calls = []
  const shell = (strings, ...values) => {
    calls.push(String.raw({ raw: strings }, ...values))
    const error = new Error("OpenCode plugin file probes must not use shell commands")
    return {
      then: (_resolve, reject) => reject(error),
      text: async () => {
        throw error
      },
    }
  }
  shell.calls = calls
  return shell
}

async function withTempProject(files, fn) {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ecc-opencode-plugin-"))
  try {
    for (const file of files) {
      const filePath = path.join(projectDir, file)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, "")
    }
    return await fn(projectDir)
  } finally {
    fs.rmSync(projectDir, { recursive: true, force: true })
  }
}

async function main() {
  console.log("\n=== Testing OpenCode plugin hooks ===\n")

  const { ECCHooksPlugin } = await loadPlugin()
  const tests = [
    [
      "shell.env detects project markers without shelling out to test -f",
      async () => withTempProject(
        ["pnpm-lock.yaml", "tsconfig.json", "pyproject.toml"],
        async (projectDir) => {
          const client = createClient()
          const $ = createFailingShell()
          const hooks = await ECCHooksPlugin({ client, $, directory: projectDir })

          const env = await hooks["shell.env"]()

          assert.deepStrictEqual($.calls, [], `Unexpected shell probes: ${$.calls.join(", ")}`)
          assert.strictEqual(env.PROJECT_ROOT, projectDir)
          assert.strictEqual(env.PACKAGE_MANAGER, "pnpm")
          assert.strictEqual(env.DETECTED_LANGUAGES, "typescript,python")
          assert.strictEqual(env.PRIMARY_LANGUAGE, "typescript")
        }
      ),
    ],
    [
      "session.created checks CLAUDE.md through fs instead of shell test",
      async () => withTempProject(["CLAUDE.md"], async (projectDir) => {
        const client = createClient()
        const $ = createFailingShell()
        const hooks = await ECCHooksPlugin({ client, $, directory: projectDir })

        await hooks["session.created"]()

        assert.deepStrictEqual($.calls, [], `Unexpected shell probes: ${$.calls.join(", ")}`)
        assert.ok(
          client.logs.some((entry) => entry.message === "[ECC] Found CLAUDE.md - loading project context"),
          "Expected CLAUDE.md detection log"
        )
      }),
    ],
  ]

  let passed = 0
  let failed = 0
  for (const [name, fn] of tests) {
    const result = await runTest(name, fn)
    passed += result.passed
    failed += result.failed
  }

  console.log(`\nPassed: ${passed}`)
  console.log(`Failed: ${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main()
