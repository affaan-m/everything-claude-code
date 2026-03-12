'use strict';

const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_CONFIG = {
  execution_sandbox: {
    dry_run: true
  }
};
const COMMAND_TIMEOUT_MS = 300000;
const CONTROL_TOKENS = new Set(['&&', '||', '|', ';', '<', '>', '>>', '<<']);
const SHELL_INTERPRETERS = new Set(['sh', 'bash', 'zsh', 'fish', 'dash', 'ksh', 'cmd', 'cmd.exe', 'powershell', 'pwsh']);
const SHELL_EXECUTION_FLAGS = new Set(['-c', '/c', '-command', '-encodedcommand']);

class TerminalInterface {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = normalizedOptions.cwd || process.cwd();
    this.config = mergeConfig(DEFAULT_CONFIG, normalizedOptions.config);
  }

  async runCommand(command) {
    const normalizedCommand = String(command || '').trim();
    if (!normalizedCommand) {
      return {
        ok: false,
        type: 'terminal_command',
        command: normalizedCommand,
        error: 'Command is required.'
      };
    }

    if (!isTerminalAllowed(this.config)) {
      return {
        ok: false,
        type: 'terminal_command',
        command: normalizedCommand,
        error: 'Terminal execution is disabled by tool permissions.'
      };
    }

    const parsedCommand = parseExecutableCommand(normalizedCommand);
    if (parsedCommand.error) {
      return {
        ok: false,
        type: 'terminal_command',
        command: normalizedCommand,
        error: parsedCommand.error
      };
    }

    if (isBlockedCommand(parsedCommand.tokens, this.config)) {
      return {
        ok: false,
        type: 'terminal_command',
        command: normalizedCommand,
        error: 'Command was blocked by the execution policy.'
      };
    }

    if (isDryRun(this.config)) {
      return {
        ok: true,
        type: 'terminal_command',
        command: normalizedCommand,
        dryRun: true,
        stdout: '[dry-run] Command execution skipped.',
        stderr: '',
        exitCode: 0
      };
    }

    const startedAt = Date.now();
    const result = await runSubprocess({
      executable: parsedCommand.executable,
      args: parsedCommand.args,
      cwd: this.cwd,
      env: {
        ...process.env,
        ...parsedCommand.env
      }
    });

    if (result.error) {
      return {
        ok: false,
        type: 'terminal_command',
        command: normalizedCommand,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        durationMs: Date.now() - startedAt,
        error: result.error
      };
    }

    return {
      ok: result.exitCode === 0,
      type: 'terminal_command',
      command: normalizedCommand,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      durationMs: Date.now() - startedAt,
      error: result.exitCode === 0 ? '' : result.stderr || `Command exited with code ${result.exitCode}.`
    };
  }
}

function mergeConfig(defaultConfig, config) {
  const normalizedConfig = config && typeof config === 'object' ? config : {};
  return {
    ...defaultConfig,
    ...normalizedConfig,
    execution_sandbox: {
      ...(defaultConfig.execution_sandbox || {}),
      ...(normalizedConfig.execution_sandbox || {})
    },
    tool_permissions: {
      ...(defaultConfig.tool_permissions || {}),
      ...(normalizedConfig.tool_permissions || {})
    }
  };
}

async function runSubprocess(options) {
  return new Promise((resolve) => {
    const child = spawn(options.executable, options.args, {
      cwd: options.cwd,
      env: options.env,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, COMMAND_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 1,
        error: `Command failed to start: ${error.message}`
      });
    });
    child.on('close', (code, signal) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      const normalizedStdout = stdout.trim();
      const normalizedStderr = stderr.trim();
      if (timedOut) {
        resolve({
          stdout: normalizedStdout,
          stderr: normalizedStderr,
          exitCode: 124,
          error: `Command timed out after ${COMMAND_TIMEOUT_MS}ms.`
        });
        return;
      }

      if (signal) {
        resolve({
          stdout: normalizedStdout,
          stderr: normalizedStderr,
          exitCode: 1,
          error: `Command exited due to signal ${signal}.`
        });
        return;
      }

      resolve({
        stdout: normalizedStdout,
        stderr: normalizedStderr,
        exitCode: typeof code === 'number' ? code : 1,
        error: ''
      });
    });
  });
}

function parseExecutableCommand(command) {
  const tokens = tokenizeShellCommand(command);
  if (tokens.length === 0) {
    return {
      error: 'Command is required.'
    };
  }

  if (tokens.some((token) => CONTROL_TOKENS.has(token))) {
    return {
      error: 'Shell control operators are not supported. Run a single executable with arguments.'
    };
  }

  const env = {};
  const commandTokens = [...tokens];
  while (commandTokens.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*=.*$/.test(commandTokens[0])) {
    const [key, ...rest] = commandTokens.shift().split('=');
    env[key] = rest.join('=');
  }

  if (commandTokens.length === 0) {
    return {
      error: 'Command is required after environment assignments.'
    };
  }

  const executableName = normalizeExecutableToken(commandTokens[0]);
  if (SHELL_INTERPRETERS.has(executableName) && commandTokens.slice(1).some((token) => SHELL_EXECUTION_FLAGS.has(String(token).toLowerCase()))) {
    return {
      error: 'Shell interpreters with inline execution flags are blocked by the execution policy.'
    };
  }

  return {
    executable: commandTokens[0],
    args: commandTokens.slice(1),
    env,
    tokens: commandTokens
  };
}

function normalizeExecutableToken(token) {
  return path.basename(String(token || '').trim()).toLowerCase();
}

function isTerminalAllowed(config) {
  return !config.tool_permissions || config.tool_permissions.allow_terminal !== false;
}

function isDryRun(config) {
  return Boolean(config.execution_sandbox && config.execution_sandbox.dry_run);
}

function isBlockedCommand(tokens, config) {
  const blockedCommands = Array.isArray(config.tool_permissions && config.tool_permissions.blocked_commands)
    ? config.tool_permissions.blocked_commands
    : [];

  const commandTokens = normalizeCommandTokens(tokens);
  return blockedCommands.some((blockedCommand) => matchesBlockedPattern(commandTokens, normalizeCommandTokens(tokenizeShellCommand(blockedCommand))));
}

function matchesBlockedPattern(commandTokens, blockedTokens) {
  if (commandTokens.length === 0 || blockedTokens.length === 0) {
    return false;
  }

  if (commandTokens[0] !== blockedTokens[0]) {
    return false;
  }

  const blockedRemainder = blockedTokens.slice(1);
  if (blockedRemainder.length === 0) {
    return true;
  }

  if (blockedRemainder.every(isFlagToken)) {
    const commandFlags = collectLeadingFlags(commandTokens.slice(1));
    const commandFlagSet = new Set(commandFlags);
    return blockedRemainder.every((flag) => commandFlagSet.has(flag));
  }

  if (commandTokens.length < blockedTokens.length) {
    return false;
  }

  return blockedTokens.every((token, index) => commandTokens[index] === token);
}

function collectLeadingFlags(tokens) {
  const flags = [];
  for (const token of tokens) {
    if (!isFlagToken(token)) {
      break;
    }

    flags.push(token);
  }

  return flags;
}

function isFlagToken(token) {
  return typeof token === 'string' && token.startsWith('-');
}

function normalizeCommandTokens(tokens) {
  return stripLeadingEnvAssignments(tokens)
    .map((token, index) => {
      const normalized = String(token || '').trim().toLowerCase();
      return index === 0 ? normalizeExecutableToken(normalized) : normalized;
    })
    .filter(Boolean)
    .flatMap(expandShortFlags);
}

function stripLeadingEnvAssignments(tokens) {
  const normalizedTokens = Array.isArray(tokens) ? [...tokens] : [];
  while (normalizedTokens.length > 0 && /^[a-z_][a-z0-9_]*=.*$/i.test(normalizedTokens[0])) {
    normalizedTokens.shift();
  }

  return normalizedTokens;
}

function expandShortFlags(token) {
  if (!/^-[a-zA-Z]{2,}$/.test(token)) {
    return [token];
  }

  return token
    .slice(1)
    .split('')
    .map((flag) => `-${flag.toLowerCase()}`);
}

function tokenizeShellCommand(command) {
  const input = String(command || '');
  const tokens = [];
  let current = '';
  let quote = '';

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      if (char === '\\' && quote === '"' && index + 1 < input.length) {
        current += input[index + 1];
        index += 1;
        continue;
      }

      if (char === quote) {
        quote = '';
        continue;
      }

      current += char;
      continue;
    }

    if (char === '"' || char === '\'') {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    if (char === '\\' && index + 1 < input.length) {
      current += input[index + 1];
      index += 1;
      continue;
    }

    if ((char === '&' || char === '|') && index + 1 < input.length && input[index + 1] === char) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char + input[index + 1]);
      index += 1;
      continue;
    }

    if ((char === ';' || char === '<' || char === '>') && !quote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      const nextChar = input[index + 1];
      if ((char === '<' || char === '>') && nextChar === char) {
        tokens.push(char + nextChar);
        index += 1;
      } else {
        tokens.push(char);
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

module.exports = {
  TerminalInterface
};
