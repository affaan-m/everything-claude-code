'use strict';

const { spawnSync } = require('child_process');

class TerminalInterface {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = normalizedOptions.cwd || process.cwd();
    this.config = normalizedOptions.config || {};
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

    if (isBlockedCommand(normalizedCommand, this.config)) {
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
    const result = spawnSync(normalizedCommand, {
      cwd: this.cwd,
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 300000
    });

    return {
      ok: !result.error && result.status === 0,
      type: 'terminal_command',
      command: normalizedCommand,
      stdout: String(result.stdout || '').trim(),
      stderr: String(result.stderr || '').trim(),
      exitCode: typeof result.status === 'number' ? result.status : 1,
      durationMs: Date.now() - startedAt,
      error: result.error ? result.error.message : ''
    };
  }
}

function isTerminalAllowed(config) {
  return !config.tool_permissions || config.tool_permissions.allow_terminal !== false;
}

function isDryRun(config) {
  return Boolean(config.execution_sandbox && config.execution_sandbox.dry_run);
}

function isBlockedCommand(command, config) {
  const blockedCommands = Array.isArray(config.tool_permissions && config.tool_permissions.blocked_commands)
    ? config.tool_permissions.blocked_commands
    : [];

  const normalizedCommand = String(command || '').toLowerCase();
  return blockedCommands.some((blockedFragment) => normalizedCommand.includes(String(blockedFragment).toLowerCase()));
}

module.exports = {
  TerminalInterface
};
