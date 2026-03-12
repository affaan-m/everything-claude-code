'use strict';

const fs = require('fs');
const path = require('path');
const { ensureDir, resolveWithinCwd } = require('../shared/file_utils.ts');

class FileSystemTools {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = path.resolve(normalizedOptions.cwd || process.cwd());
    this.config = normalizedOptions.config || {};
  }

  async readFile(targetPath) {
    try {
      const resolvedPath = this.resolvePath(targetPath, false);
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return {
        ok: true,
        type: 'read_file',
        path: resolvedPath,
        content
      };
    } catch (err) {
      return {
        ok: false,
        type: 'read_file',
        path: String(targetPath || ''),
        error: err.message
      };
    }
  }

  async writeFile(targetPath, content) {
    try {
      const resolvedPath = this.resolvePath(targetPath, true);

      if (isDryRun(this.config)) {
        return {
          ok: true,
          type: 'write_file',
          path: resolvedPath,
          dryRun: true,
          bytesWritten: Buffer.byteLength(String(content || ''), 'utf8')
        };
      }

      ensureDir(path.dirname(resolvedPath));
      fs.writeFileSync(resolvedPath, String(content || ''), 'utf8');
      return {
        ok: true,
        type: 'write_file',
        path: resolvedPath,
        bytesWritten: Buffer.byteLength(String(content || ''), 'utf8')
      };
    } catch (err) {
      return {
        ok: false,
        type: 'write_file',
        path: String(targetPath || ''),
        error: err.message
      };
    }
  }

  async appendFile(targetPath, content) {
    try {
      const resolvedPath = this.resolvePath(targetPath, true);

      if (isDryRun(this.config)) {
        return {
          ok: true,
          type: 'append_file',
          path: resolvedPath,
          dryRun: true,
          bytesWritten: Buffer.byteLength(String(content || ''), 'utf8')
        };
      }

      ensureDir(path.dirname(resolvedPath));
      fs.appendFileSync(resolvedPath, String(content || ''), 'utf8');
      return {
        ok: true,
        type: 'append_file',
        path: resolvedPath,
        bytesWritten: Buffer.byteLength(String(content || ''), 'utf8')
      };
    } catch (err) {
      return {
        ok: false,
        type: 'append_file',
        path: String(targetPath || ''),
        error: err.message
      };
    }
  }

  async replaceInFile(targetPath, searchValue, replaceValue) {
    try {
      if (!String(searchValue ?? '')) {
        throw new Error('Search value is required for replace_in_file.');
      }

      const resolvedPath = this.resolvePath(targetPath, true);
      const currentContent = fs.readFileSync(resolvedPath, 'utf8');
      const nextContent = currentContent.split(String(searchValue)).join(String(replaceValue || ''));

      if (isDryRun(this.config)) {
        return {
          ok: true,
          type: 'replace_in_file',
          path: resolvedPath,
          dryRun: true
        };
      }

      fs.writeFileSync(resolvedPath, nextContent, 'utf8');
      return {
        ok: true,
        type: 'replace_in_file',
        path: resolvedPath
      };
    } catch (err) {
      return {
        ok: false,
        type: 'replace_in_file',
        path: String(targetPath || ''),
        error: err.message
      };
    }
  }

  resolvePath(targetPath, isWriteOperation) {
    if (this.config.execution_sandbox && this.config.execution_sandbox.mode === 'read-only' && isWriteOperation) {
      throw new Error('Write operations are disabled in read-only sandbox mode.');
    }

    if (this.config.tool_permissions && this.config.tool_permissions.allow_file_system === false) {
      throw new Error('Filesystem tools are disabled by tool permissions.');
    }

    const resolved = resolveWithinCwd(this.cwd, targetPath);

    if (this.config.execution_sandbox && this.config.execution_sandbox.mode === 'full-access') {
      return resolved.resolvedPath;
    }

    if (!resolved.isInside) {
      throw new Error(`Path escapes the workspace sandbox: ${targetPath}`);
    }

    return resolved.resolvedPath;
  }
}

function isDryRun(config) {
  return Boolean(config.execution_sandbox && config.execution_sandbox.dry_run);
}

module.exports = {
  FileSystemTools
};
