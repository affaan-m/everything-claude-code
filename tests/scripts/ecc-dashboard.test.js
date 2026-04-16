/**
 * Behavioral tests for ecc_dashboard.py helper functions.
 */

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..', '..');
const runtimeHelpersPath = path.join(repoRoot, 'scripts', 'lib', 'ecc_dashboard_runtime.py');

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

function runPython(source) {
  const candidates = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
  let lastError = null;

  for (const command of candidates) {
    const result = spawnSync(command, ['-c', source], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    if (result.error && result.error.code === 'ENOENT') {
      lastError = result.error;
      continue;
    }

    if (result.status !== 0) {
      throw new Error((result.stderr || result.stdout || '').trim() || `${command} exited ${result.status}`);
    }

    return result.stdout.trim();
  }

  throw lastError || new Error('No Python interpreter available');
}

function runTests() {
  console.log('\n=== Testing ecc_dashboard.py ===\n');

  let passed = 0;
  let failed = 0;

  if (test('build_terminal_launch keeps Linux path separate from shell command text', () => {
    const output = runPython(`
import importlib.util, json
spec = importlib.util.spec_from_file_location("ecc_dashboard_runtime", r"""${runtimeHelpersPath}""")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
argv, kwargs = module.build_terminal_launch('/tmp/proj; rm -rf ~', os_name='posix', system_name='Linux')
print(json.dumps({'argv': argv, 'kwargs': kwargs}))
`);
    const parsed = JSON.parse(output);
    assert.deepStrictEqual(
      parsed.argv,
      ['x-terminal-emulator', '-e', 'bash', '-lc', 'cd -- "$1"; exec bash', 'bash', '/tmp/proj; rm -rf ~']
    );
    assert.deepStrictEqual(parsed.kwargs, {});
  })) passed++; else failed++;

  if (test('build_terminal_launch keeps Windows metachar paths out of the cmd.exe command string', () => {
    const output = runPython(`
import importlib.util, json, subprocess
spec = importlib.util.spec_from_file_location("ecc_dashboard_runtime", r"""${runtimeHelpersPath}""")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
path = r'C:\\\\tmp\\\\proj&del'
argv, kwargs = module.build_terminal_launch(path, os_name='nt', system_name='Windows')
print(json.dumps({'argv': argv, 'kwargs': kwargs, 'cmdline': subprocess.list2cmdline(argv), 'path': path}))
`);
    const parsed = JSON.parse(output);
    assert.deepStrictEqual(parsed.argv, ['cmd.exe']);
    assert.strictEqual(parsed.kwargs.cwd, parsed.path);
    assert.ok(!parsed.cmdline.includes(parsed.path), 'metachar path should not appear in the cmd.exe command string');
    assert.ok(Object.prototype.hasOwnProperty.call(parsed.kwargs, 'creationflags'));
  })) passed++; else failed++;

  if (test('maximize_window falls back to Linux zoom attribute when zoomed state is unsupported', () => {
    const output = runPython(`
import importlib.util, json
spec = importlib.util.spec_from_file_location("ecc_dashboard_runtime", r"""${runtimeHelpersPath}""")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class FakeWindow:
    def __init__(self):
        self.calls = []

    def state(self, value):
        self.calls.append(['state', value])
        raise RuntimeError('bad argument "zoomed"')

    def attributes(self, name, value):
        self.calls.append(['attributes', name, value])

original = module.platform.system
module.platform.system = lambda: 'Linux'
try:
    window = FakeWindow()
    module.maximize_window(window)
finally:
    module.platform.system = original

print(json.dumps(window.calls))
`);
    const parsed = JSON.parse(output);
    assert.deepStrictEqual(parsed, [
      ['state', 'zoomed'],
      ['attributes', '-zoomed', true],
    ]);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
