#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const { listAvailableLanguages } = require('./lib/install-executor');

const COMMANDS = {
  install: {
    script: 'install-apply.js',
    description: 'Install ECC content into a supported target',
  },
  plan: {
    script: 'install-plan.js',
    description: 'Inspect selective-install manifests and resolved plans',
  },
  'install-plan': {
    script: 'install-plan.js',
    description: 'Alias for plan',
  },
  'list-installed': {
    script: 'list-installed.js',
    description: 'Inspect install-state files for the current context',
  },
  doctor: {
    script: 'doctor.js',
    description: 'Diagnose missing or drifted ECC-managed files',
  },
  repair: {
    script: 'repair.js',
    description: 'Restore drifted or missing ECC-managed files',
  },
  status: {
    script: 'status.js',
    description: 'Query the ECC SQLite state store status summary',
  },
  sessions: {
    script: 'sessions-cli.js',
    description: 'List or inspect ECC sessions from the SQLite state store',
  },
  'session-inspect': {
    script: 'session-inspect.js',
    description: 'Emit canonical ECC session snapshots from dmux or Claude history targets',
  },
  uninstall: {
    script: 'uninstall.js',
    description: 'Remove ECC-managed files recorded in install-state',
  },
};

const PRIMARY_COMMANDS = [
  'install',
  'plan',
  'list-installed',
  'doctor',
  'repair',
  'status',
  'sessions',
  'session-inspect',
  'uninstall',
];

function showHelp(exitCode = 0) {
  console.log(`
ECC selective-install CLI

Usage:
  ecc <command> [args...]
  ecc [install args...]

Commands:
${PRIMARY_COMMANDS.map(command => `  ${command.padEnd(15)} ${COMMANDS[command].description}`).join('\n')}

Compatibility:
  ecc-install        Legacy install entrypoint retained for existing flows
  ecc [args...]      Without a command, args are routed to "install"
  ecc help <command> Show help for a specific command

Examples:
  ecc typescript
  ecc install --profile developer --target claude
  ecc plan --profile core --target cursor
  ecc list-installed --json
  ecc doctor --target cursor
  ecc repair --dry-run
  ecc status --json
  ecc sessions
  ecc sessions session-active --json
  ecc session-inspect claude:latest
  ecc uninstall --target antigravity --dry-run
`);

  process.exit(exitCode);
}

function resolveCommand(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    return { mode: 'help' };
  }

  const [firstArg, ...restArgs] = args;

  if (firstArg === '--help' || firstArg === '-h') {
    return { mode: 'help' };
  }

  if (firstArg === 'help') {
    return {
      mode: 'help-command',
      command: restArgs[0] || null,
    };
  }

  if (COMMANDS[firstArg]) {
    return {
      mode: 'command',
      command: firstArg,
      args: restArgs,
    };
  }

  const knownLegacyLanguages = listAvailableLanguages();
  const shouldTreatAsImplicitInstall = (
    firstArg.startsWith('-')
    || knownLegacyLanguages.includes(firstArg)
  );

  if (!shouldTreatAsImplicitInstall) {
    throw new Error(`Unknown command: ${firstArg}`);
  }

  return {
    mode: 'command',
    command: 'install',
    args,
  };
}

function runCommand(commandName, args) {
  const command = COMMANDS[commandName];
  if (!command) {
    throw new Error(`Unknown command: ${commandName}`);
  }

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, command.script), ...args],
    {
      cwd: process.cwd(),
      env: process.env,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (typeof result.status === 'number') {
    return result.status;
  }

  if (result.signal) {
    throw new Error(`Command "${commandName}" terminated by signal ${result.signal}`);
  }

  return 1;
}

function main() {
  try {
    const resolution = resolveCommand(process.argv);

    if (resolution.mode === 'help') {
      showHelp(0);
    }

    if (resolution.mode === 'help-command') {
      if (!resolution.command) {
        showHelp(0);
      }

      if (!COMMANDS[resolution.command]) {
        throw new Error(`Unknown command: ${resolution.command}`);
      }

      process.exitCode = runCommand(resolution.command, ['--help']);
      return;
    }

    process.exitCode = runCommand(resolution.command, resolution.args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
