#!/usr/bin/env node
/**
 * Setup daily AI News Digest automation
 *
 * Cross-platform cron/scheduler setup for daily 6:30 AM news delivery.
 *
 * Supports:
 * - Linux/macOS: crontab
 * - macOS: launchd (launchctl)
 * - All platforms: generates a config file you can import manually
 *
 * Usage:
 *   node scripts/setup-ai-news-cron.js              # Interactive setup
 *   node scripts/setup-ai-news-cron.js --install     # Auto-install cron job
 *   node scripts/setup-ai-news-cron.js --uninstall   # Remove cron job
 *   node scripts/setup-ai-news-cron.js --show        # Show current config
 *   node scripts/setup-ai-news-cron.js --time=07:00  # Set custom time (default: 06:30)
 *   node scripts/setup-ai-news-cron.js --lang=zh-TW  # Set language
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';

// ─── Argument parsing ──────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    action: 'show', // show | install | uninstall
    time: '06:30',
    lang: process.env.AI_NEWS_LANG || 'zh-TW',
    outputFile: true,
    help: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--install') args.action = 'install';
    else if (arg === '--uninstall') args.action = 'uninstall';
    else if (arg === '--show') args.action = 'show';
    else if (arg.startsWith('--time=')) args.time = arg.split('=')[1];
    else if (arg.startsWith('--lang=')) args.lang = arg.split('=')[1];
    else if (arg === '--no-file') args.outputFile = false;
  }

  return args;
}

// ─── Path helpers ──────────────────────────────────────────────

function getScriptPath() {
  return path.resolve(__dirname, 'ai-news-digest.js');
}

function getNodePath() {
  return process.execPath;
}

function getOutputDir() {
  return process.env.AI_NEWS_OUTPUT_DIR || path.join(os.homedir(), '.claude', 'news');
}

// ─── Crontab (Linux/macOS) ────────────────────────────────────

function getCronLine(time, lang, outputFile) {
  const [hours, minutes] = time.split(':');
  const scriptPath = getScriptPath();
  const nodePath = getNodePath();
  const outputFlag = outputFile ? ' --output=file' : '';

  return `${minutes} ${hours} * * * ${nodePath} ${scriptPath} --lang=${lang}${outputFlag} >> ${getOutputDir()}/cron.log 2>&1`;
}

const CRON_MARKER = '# AI-NEWS-DIGEST-CRON';

function getCurrentCrontab() {
  try {
    const result = spawnSync('crontab', ['-l'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return result.status === 0 ? result.stdout : '';
  } catch {
    return '';
  }
}

function installCron(time, lang, outputFile) {
  const currentCrontab = getCurrentCrontab();
  const cronLine = getCronLine(time, lang, outputFile);

  // Remove existing AI news cron line if present
  const filteredLines = currentCrontab
    .split('\n')
    .filter((line) => !line.includes(CRON_MARKER) && !line.includes('ai-news-digest'));

  // Add new line
  filteredLines.push(`${cronLine} ${CRON_MARKER}`);
  const newCrontab = filteredLines.filter((line) => line.trim() !== '').join('\n') + '\n';

  // Ensure output directory exists
  const outDir = getOutputDir();
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Install via pipe to crontab
  const result = spawnSync('crontab', ['-'], {
    input: newCrontab,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(`Failed to install crontab: ${result.stderr}`);
  }

  return cronLine;
}

function uninstallCron() {
  const currentCrontab = getCurrentCrontab();
  const filteredLines = currentCrontab
    .split('\n')
    .filter((line) => !line.includes(CRON_MARKER) && !line.includes('ai-news-digest'));

  const newCrontab = filteredLines.filter((line) => line.trim() !== '').join('\n') + '\n';

  const result = spawnSync('crontab', ['-'], {
    input: newCrontab,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(`Failed to update crontab: ${result.stderr}`);
  }
}

// ─── Launchd (macOS) ──────────────────────────────────────────

function getLaunchdPlistPath() {
  return path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.claude-code.ai-news-digest.plist');
}

function generateLaunchdPlist(time, lang, outputFile) {
  const [hours, minutes] = time.split(':');
  const scriptPath = getScriptPath();
  const nodePath = getNodePath();
  const args = ['--lang=' + lang];
  if (outputFile) args.push('--output=file');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-code.ai-news-digest</string>

    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${scriptPath}</string>
${args.map((a) => `        <string>${a}</string>`).join('\n')}
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>${parseInt(hours, 10)}</integer>
        <key>Minute</key>
        <integer>${parseInt(minutes, 10)}</integer>
    </dict>

    <key>StandardOutPath</key>
    <string>${getOutputDir()}/launchd-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>${getOutputDir()}/launchd-stderr.log</string>

    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>`;
}

// ─── Windows Task Scheduler ───────────────────────────────────

function generateWindowsTask(time, lang, outputFile) {
  const scriptPath = getScriptPath();
  const nodePath = getNodePath();
  const args = `--lang=${lang}${outputFile ? ' --output=file' : ''}`;

  return `@echo off
REM AI News Digest - Windows Task Scheduler setup
REM Run this script as Administrator to install the scheduled task

schtasks /create /tn "AI News Digest" /tr "${nodePath} ${scriptPath} ${args}" /sc daily /st ${time} /f

echo Task "AI News Digest" created successfully.
echo It will run daily at ${time}.
pause`;
}

// ─── GitHub Actions workflow ──────────────────────────────────

function generateGitHubActionsWorkflow(time, lang) {
  const [hours, minutes] = time.split(':');

  return `# .github/workflows/ai-news-digest.yml
# Automated daily AI news digest
name: AI News Digest

on:
  schedule:
    # Runs daily at ${time} UTC - adjust timezone as needed
    - cron: '${minutes} ${hours} * * *'
  workflow_dispatch: # Allow manual triggers

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generate AI News Digest
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          AI_NEWS_LANG: ${lang}
        run: node scripts/ai-news-digest.js --output=file --lang=${lang}

      - name: Upload digest artifact
        uses: actions/upload-artifact@v4
        with:
          name: ai-news-digest
          path: ~/.claude/news/
          retention-days: 30
`;
}

// ─── Main ──────────────────────────────────────────────────────

function printUsage() {
  console.log(`
AI News Digest - Scheduler Setup

Usage:
  node scripts/setup-ai-news-cron.js [options]

Options:
  --install        Install the scheduled task
  --uninstall      Remove the scheduled task
  --show           Show configuration (default)
  --time=HH:MM     Set daily run time (default: 06:30)
  --lang=LANG      Set language: en, zh-TW, zh-CN, ja (default: zh-TW)
  --no-file        Don't save to file, console output only
  --help, -h       Show this help

Examples:
  # Install cron job for daily 6:30 AM in Traditional Chinese
  node scripts/setup-ai-news-cron.js --install --time=06:30 --lang=zh-TW

  # Remove the scheduled task
  node scripts/setup-ai-news-cron.js --uninstall

  # Show what would be configured
  node scripts/setup-ai-news-cron.js --show --time=07:00
`);
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        AI News Digest - Scheduler Setup         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Platform:    ${process.platform} (${os.arch()})`);
  console.log(`  Time:        ${args.time}`);
  console.log(`  Language:    ${args.lang}`);
  console.log(`  Output dir:  ${getOutputDir()}`);
  console.log(`  Script:      ${getScriptPath()}`);
  console.log(`  Node:        ${getNodePath()}`);
  console.log('');

  if (args.action === 'show') {
    showConfig(args);
  } else if (args.action === 'install') {
    install(args);
  } else if (args.action === 'uninstall') {
    uninstall(args);
  }
}

function showConfig(args) {
  console.log('─── Crontab (Linux/macOS) ───');
  console.log(getCronLine(args.time, args.lang, args.outputFile));
  console.log('');

  if (isMacOS) {
    console.log('─── Launchd (macOS) ───');
    console.log(`Plist path: ${getLaunchdPlistPath()}`);
    console.log(generateLaunchdPlist(args.time, args.lang, args.outputFile));
    console.log('');
  }

  if (isWindows) {
    console.log('─── Windows Task Scheduler ───');
    console.log(generateWindowsTask(args.time, args.lang, args.outputFile));
    console.log('');
  }

  console.log('─── GitHub Actions Workflow ───');
  console.log(generateGitHubActionsWorkflow(args.time, args.lang));
  console.log('');

  console.log('To install automatically, run:');
  console.log(`  node scripts/setup-ai-news-cron.js --install --time=${args.time} --lang=${args.lang}`);
}

function install(args) {
  if (isWindows) {
    // Generate batch file for Windows
    const batchContent = generateWindowsTask(args.time, args.lang, args.outputFile);
    const batchPath = path.join(getOutputDir(), 'install-task.bat');

    const outDir = getOutputDir();
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(batchPath, batchContent, 'utf8');
    console.log(`[Windows] Batch file generated: ${batchPath}`);
    console.log('Run this file as Administrator to install the scheduled task.');
    return;
  }

  // Linux/macOS: install crontab
  try {
    const cronLine = installCron(args.time, args.lang, args.outputFile);
    console.log('[Cron] Successfully installed:');
    console.log(`  ${cronLine}`);
    console.log('');
    console.log(`News will be generated daily at ${args.time} and saved to:`);
    console.log(`  ${getOutputDir()}/`);
  } catch (err) {
    console.error(`[Cron] Installation failed: ${err.message}`);
    process.exit(1);
  }

  // macOS: also install launchd
  if (isMacOS) {
    try {
      const plistPath = getLaunchdPlistPath();
      const plistDir = path.dirname(plistPath);
      if (!fs.existsSync(plistDir)) {
        fs.mkdirSync(plistDir, { recursive: true });
      }
      const plistContent = generateLaunchdPlist(args.time, args.lang, args.outputFile);
      fs.writeFileSync(plistPath, plistContent, 'utf8');

      // Load the plist
      spawnSync('launchctl', ['unload', plistPath], { stdio: 'pipe' });
      const loadResult = spawnSync('launchctl', ['load', plistPath], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (loadResult.status === 0) {
        console.log(`[launchd] Successfully installed: ${plistPath}`);
      } else {
        console.log(`[launchd] Plist saved but loading failed: ${loadResult.stderr}`);
        console.log('  You may need to load it manually:');
        console.log(`  launchctl load ${plistPath}`);
      }
    } catch (err) {
      console.log(`[launchd] Optional setup failed (cron will still work): ${err.message}`);
    }
  }

  console.log('');
  console.log('Setup complete! Test it now with:');
  console.log(`  node scripts/ai-news-digest.js --lang=${args.lang}`);
}

function uninstall(args) {
  if (isWindows) {
    console.log('[Windows] Run as Administrator:');
    console.log('  schtasks /delete /tn "AI News Digest" /f');
    return;
  }

  try {
    uninstallCron();
    console.log('[Cron] Successfully removed AI News Digest cron job.');
  } catch (err) {
    console.error(`[Cron] Removal failed: ${err.message}`);
  }

  if (isMacOS) {
    try {
      const plistPath = getLaunchdPlistPath();
      if (fs.existsSync(plistPath)) {
        spawnSync('launchctl', ['unload', plistPath], { stdio: 'pipe' });
        fs.unlinkSync(plistPath);
        console.log(`[launchd] Removed: ${plistPath}`);
      }
    } catch (err) {
      console.log(`[launchd] Removal note: ${err.message}`);
    }
  }

  console.log('');
  console.log('Uninstall complete. News files in the output directory were preserved.');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  getCronLine,
  generateLaunchdPlist,
  generateWindowsTask,
  generateGitHubActionsWorkflow,
  getScriptPath,
  getOutputDir,
  CRON_MARKER,
};
