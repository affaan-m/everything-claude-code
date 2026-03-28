#!/usr/bin/env node
/**
 * PreToolUse Hook: Pre-commit Quality Check
 *
 * Runs quality checks before git commit commands:
 * - Detects staged files
 * - Runs linter on staged files (if available)
 * - Checks for common issues (console.log, TODO, etc.)
 * - Validates commit message format (if provided)
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Exit codes:
 *   0 - Success (allow commit)
 *   2 - Block commit (quality issues found)
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MAX_STDIN = 1024 * 1024; // 1MB limit

/**
 * Detect staged files for commit
 * @returns {string[]} Array of staged file paths
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output.trim().split('\n').filter(f => f.length > 0);
  } catch {
    return [];
  }
}

/**
 * Check if a file should be quality-checked
 * @param {string} filePath 
 * @returns {boolean}
 */
function shouldCheckFile(filePath) {
  const checkableExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs'];
  return checkableExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Find issues in file content
 * @param {string} filePath 
 * @returns {object[]} Array of issues found
 */
function findFileIssues(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for console.log
      if (line.includes('console.log') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        issues.push({
          type: 'console.log',
          message: `console.log found at line ${lineNum}`,
          line: lineNum,
          severity: 'warning'
        });
      }
      
      // Check for debugger statements
      if (/\bdebugger\b/.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'debugger',
          message: `debugger statement at line ${lineNum}`,
          line: lineNum,
          severity: 'error'
        });
      }
      
      // Check for TODO/FIXME without issue reference
      const todoMatch = line.match(/\/\/\s*(TODO|FIXME):?\s*(.+)/);
      if (todoMatch && !todoMatch[2].match(/#\d+|issue/i)) {
        issues.push({
          type: 'todo',
          message: `TODO/FIXME without issue reference at line ${lineNum}: "${todoMatch[2].trim()}"`,
          line: lineNum,
          severity: 'info'
        });
      }
      
      // Check for hardcoded secrets (basic patterns)
      const secretPatterns = [
        { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI API key' },
        { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub PAT' },
        { pattern: /AKIA[A-Z0-9]{16}/, name: 'AWS Access Key' },
        { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/i, name: 'API key' }
      ];
      
      for (const { pattern, name } of secretPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'secret',
            message: `Potential ${name} exposed at line ${lineNum}`,
            line: lineNum,
            severity: 'error'
          });
        }
      }
    });
  } catch {
    // File not readable, skip
  }
  
  return issues;
}

/**
 * Validate commit message format
 * @param {string} command 
 * @returns {object|null} Validation result or null if no message to validate
 */
function validateCommitMessage(command) {
  // Extract commit message from command
  const messageMatch = command.match(/(?:-m|--message)[=\s]+["']?([^"']+)["']?/);
  if (!messageMatch) return null;
  
  const message = messageMatch[1];
  const issues = [];
  
  // Check conventional commit format
  const conventionalCommit = /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?:\s*.+/;
  if (!conventionalCommit.test(message)) {
    issues.push({
      type: 'format',
      message: 'Commit message does not follow conventional commit format',
      suggestion: 'Use format: type(scope): description (e.g., "feat(auth): add login flow")'
    });
  }
  
  // Check message length
  if (message.length > 72) {
    issues.push({
      type: 'length',
      message: `Commit message too long (${message.length} chars, max 72)`,
      suggestion: 'Keep the first line under 72 characters'
    });
  }
  
  // Check for lowercase first letter (conventional)
  if (message.charAt(0) === message.charAt(0).toUpperCase() && conventionalCommit.test(message)) {
    const afterColon = message.split(':')[1];
    if (afterColon && afterColon.trim().charAt(0) === afterColon.trim().charAt(0).toUpperCase()) {
      issues.push({
        type: 'capitalization',
        message: 'Subject should start with lowercase after type',
        suggestion: 'Use lowercase for the first letter of the subject'
      });
    }
  }
  
  // Check for trailing period
  if (message.endsWith('.')) {
    issues.push({
      type: 'punctuation',
      message: 'Commit message should not end with a period',
      suggestion: 'Remove the trailing period'
    });
  }
  
  return { message, issues };
}

/**
 * Run linter on staged files
 * @param {string[]} files 
 * @returns {object} Lint results
 */
function runLinter(files) {
  const jsFiles = files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
  const pyFiles = files.filter(f => f.endsWith('.py'));
  const goFiles = files.filter(f => f.endsWith('.go'));
  
  const results = {
    eslint: null,
    pylint: null,
    golint: null
  };
  
  // Run ESLint if available
  if (jsFiles.length > 0) {
    try {
      const eslintPath = path.join(process.cwd(), 'node_modules', '.bin', 'eslint');
      if (fs.existsSync(eslintPath)) {
        const result = spawnSync(eslintPath, ['--format', 'compact', ...jsFiles], {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000
        });
        results.eslint = {
          success: result.status === 0,
          output: result.stdout || result.stderr
        };
      }
    } catch {
      // ESLint not available
    }
  }
  
  // Run Pylint if available
  if (pyFiles.length > 0) {
    try {
      const result = spawnSync('pylint', ['--output-format=text', ...pyFiles], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000
      });
      results.pylint = {
        success: result.status === 0,
        output: result.stdout || result.stderr
      };
    } catch {
      // Pylint not available
    }
  }
  
  // Run golint if available
  if (goFiles.length > 0) {
    try {
      const result = spawnSync('golint', goFiles, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000
      });
      results.golint = {
        success: !result.stdout || result.stdout.trim() === '',
        output: result.stdout
      };
    } catch {
      // golint not available
    }
  }
  
  return results;
}

/**
 * Core logic — exported for direct invocation
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const command = input.tool_input?.command || '';
    
    // Only run for git commit commands
    if (!command.includes('git commit')) {
      return rawInput;
    }
    
    // Check if this is an amend (skip checks for amends to avoid blocking)
    if (command.includes('--amend')) {
      return rawInput;
    }
    
    const issues = [];
    const warnings = [];
    
    // Get staged files
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.error('[Hook] No staged files found. Use "git add" to stage files first.');
      return rawInput;
    }
    
    console.error(`[Hook] Checking ${stagedFiles.length} staged file(s)...`);
    
    // Check each staged file
    const filesToCheck = stagedFiles.filter(shouldCheckFile);
    let totalIssues = 0;
    let errorCount = 0;
    
    for (const file of filesToCheck) {
      const fileIssues = findFileIssues(file);
      if (fileIssues.length > 0) {
        console.error(`\n📁 ${file}`);
        for (const issue of fileIssues) {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.error(`  ${icon} Line ${issue.line}: ${issue.message}`);
          totalIssues++;
          if (issue.severity === 'error') errorCount++;
        }
      }
    }
    
    // Validate commit message if provided
    const messageValidation = validateCommitMessage(command);
    if (messageValidation && messageValidation.issues.length > 0) {
      console.error('\n📝 Commit Message Issues:');
      for (const issue of messageValidation.issues) {
        console.error(`  ⚠️ ${issue.message}`);
        if (issue.suggestion) {
          console.error(`     💡 ${issue.suggestion}`);
        }
      }
    }
    
    // Run linter
    const lintResults = runLinter(filesToCheck);
    
    if (lintResults.eslint && !lintResults.eslint.success) {
      console.error('\n🔍 ESLint Issues:');
      console.error(lintResults.eslint.output);
    }
    
    if (lintResults.pylint && !lintResults.pylint.success) {
      console.error('\n🔍 Pylint Issues:');
      console.error(lintResults.pylint.output);
    }
    
    if (lintResults.golint && !lintResults.golint.success) {
      console.error('\n🔍 golint Issues:');
      console.error(lintResults.golint.output);
    }
    
    // Summary
    if (totalIssues > 0) {
      console.error(`\n📊 Summary: ${totalIssues} issue(s) found (${errorCount} error(s), ${totalIssues - errorCount} warning(s))`);
      
      if (errorCount > 0) {
        console.error('\n[Hook] ❌ Commit blocked due to critical issues. Fix them before committing.');
        process.exit(2);
      } else {
        console.error('\n[Hook] ⚠️ Warnings found. Consider fixing them, but commit is allowed.');
        console.error('[Hook] To bypass these checks, use: git commit --no-verify');
      }
    } else {
      console.error('\n[Hook] ✅ All checks passed!');
    }
    
  } catch (error) {
    console.error(`[Hook] Error: ${error.message}`);
    // Non-blocking on error
  }
  
  return rawInput;
}

// ── stdin entry point ────────────────────────────────────────────
if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) {
      const remaining = MAX_STDIN - data.length;
      data += chunk.substring(0, remaining);
    }
  });
  
  process.stdin.on('end', () => {
    data = run(data);
    process.stdout.write(data);
    process.exit(0);
  });
}

module.exports = { run };