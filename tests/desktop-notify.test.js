const assert = require("assert")
const path = require("path")
const fs = require("fs")

const builtPath = path.join(__dirname, "..", ".opencode", "dist", "plugins", "lib", "desktop-notify.js")
if (!fs.existsSync(builtPath)) {
  console.log("Skipping desktop-notify tests (run: cd .opencode && npm run build)")
  console.log("Passed: 0, Failed: 0")
  process.exit(0)
}

function test(name, fn) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    return true
  } catch (err) {
    console.log(`  ✗ ${name}`)
    console.log(`    ${err.message}`)
    return false
  }
}

function runTests() {
  let passed = 0
  let failed = 0

  return import(pathToFileURL(builtPath).href).then(
    (mod) => {
      const { buildNotifyCommand, sanitize, isInQuietHours, isEventEnabled } = mod
      const origEnv = { ...process.env }

      function restoreEnv() {
        for (const k of Object.keys(process.env)) {
          if (origEnv[k] === undefined) delete process.env[k]
          else process.env[k] = origEnv[k]
        }
      }

      console.log("\n=== desktop-notify tests ===\n")

      console.log("sanitize:")
      if (
        test("strips shell metacharacters", () => {
          const out = sanitize("hello; rm -rf /", 100)
          assert.ok(!out.includes(";") && !out.includes("/"), "must strip ; and /")
        })
      )
        passed++
      else failed++
      if (
        test("truncates to maxLen", () => {
          assert.strictEqual(sanitize("abcdefghij", 4).length, 4)
        })
      )
        passed++
      else failed++
      if (
        test("returns fallback for empty result", () => {
          assert.strictEqual(sanitize(";;;", 10), "Notification")
        })
      )
        passed++
      else failed++

      console.log("\nisInQuietHours:")
      if (
        test("returns false when env unset", () => {
          delete process.env.ECC_QUIET_HOURS_START
          delete process.env.ECC_QUIET_HOURS_END
          assert.strictEqual(isInQuietHours(new Date("2025-01-15T12:00:00")), false)
        })
      )
        passed++
      else failed++
      if (
        test("returns true when in range (same day)", () => {
          process.env.ECC_QUIET_HOURS_START = "22:00"
          process.env.ECC_QUIET_HOURS_END = "08:00"
          assert.strictEqual(isInQuietHours(new Date("2025-01-15T23:30:00")), true)
        })
      )
        passed++
      else failed++
      if (
        test("returns false when outside range", () => {
          process.env.ECC_QUIET_HOURS_START = "22:00"
          process.env.ECC_QUIET_HOURS_END = "08:00"
          assert.strictEqual(isInQuietHours(new Date("2025-01-15T12:00:00")), false)
        })
      )
        passed++
      else failed++
      restoreEnv()

      console.log("\nisEventEnabled:")
      if (
        test("returns false when ECC_DESKTOP_NOTIFY=0", () => {
          process.env.ECC_DESKTOP_NOTIFY = "0"
          assert.strictEqual(isEventEnabled("completion"), false)
        })
      )
        passed++
      else failed++
      if (
        test("returns false when ECC_NOTIFY_COMPLETION=0", () => {
          process.env.ECC_DESKTOP_NOTIFY = "1"
          process.env.ECC_NOTIFY_COMPLETION = "0"
          assert.strictEqual(isEventEnabled("completion"), false)
        })
      )
        passed++
      else failed++
      restoreEnv()

      console.log("\nbuildNotifyCommand:")
      if (
        test("returns { executable, args } on supported platform", () => {
          process.env.ECC_DESKTOP_NOTIFY = "1"
          const result = buildNotifyCommand("completion", "ECC", "Done", "normal")
          if (process.platform === "darwin") {
            assert.strictEqual(result.executable, "osascript")
            assert.ok(Array.isArray(result.args))
            assert.strictEqual(result.args[0], "-e")
          } else if (process.platform === "linux") {
            assert.strictEqual(result.executable, "notify-send")
            assert.ok(Array.isArray(result.args))
            assert.strictEqual(result.args.includes("ECC"), true)
            assert.strictEqual(result.args.includes("Done"), true)
          } else {
            assert.strictEqual(result, null)
          }
        })
      )
        passed++
      else failed++
      if (
        test("returns null during quiet hours", () => {
          process.env.ECC_DESKTOP_NOTIFY = "1"
          process.env.ECC_QUIET_HOURS_START = "00:00"
          process.env.ECC_QUIET_HOURS_END = "23:59"
          const result = buildNotifyCommand("completion", "ECC", "Done", "normal")
          assert.strictEqual(result, null)
        })
      )
        passed++
      else failed++
      if (
        test("args contain no shell metacharacters for injection", () => {
          process.env.ECC_DESKTOP_NOTIFY = "1"
          const evil = "x; rm -rf /"
          const result = buildNotifyCommand("completion", "ECC", evil, "normal")
          if (result) {
            for (const arg of result.args) {
              assert.ok(!arg.includes(";"), "args must not contain ;")
              assert.ok(!arg.includes("|"), "args must not contain |")
              assert.ok(!arg.includes("&"), "args must not contain &")
            }
          }
        })
      )
        passed++
      else failed++
      restoreEnv()

      console.log(`\nPassed: ${passed}, Failed: ${failed}`)
      process.exit(failed > 0 ? 1 : 0)
    },
    (err) => {
      console.error("Failed to load desktop-notify module:", err.message)
      process.exit(1)
    }
  )
}

function pathToFileURL(p) {
  return require("url").pathToFileURL(path.resolve(p))
}

runTests()
