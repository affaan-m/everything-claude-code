'use strict';

class ToolRunner {
  constructor(options) {
    const normalizedOptions = options || {};
    this.terminal = normalizedOptions.terminal;
    this.fileSystem = normalizedOptions.fileSystem;
    this.apiTools = normalizedOptions.apiTools;
  }

  async run(action) {
    const normalizedAction = action || {};
    const type = normalizedAction.type;

    if (type === 'terminal_command') {
      return this.terminal.runCommand(normalizedAction.command);
    }

    if (type === 'write_file') {
      return this.fileSystem.writeFile(normalizedAction.path, normalizedAction.content);
    }

    if (type === 'append_file') {
      return this.fileSystem.appendFile(normalizedAction.path, normalizedAction.content);
    }

    if (type === 'read_file') {
      return this.fileSystem.readFile(normalizedAction.path);
    }

    if (type === 'replace_in_file') {
      return this.fileSystem.replaceInFile(
        normalizedAction.path,
        normalizedAction.search,
        normalizedAction.replace
      );
    }

    if (type === 'http_request') {
      return this.apiTools.request(normalizedAction);
    }

    if (type === 'web_search') {
      return this.apiTools.webSearch(normalizedAction.query);
    }

    if (type === 'finish') {
      return {
        ok: true,
        type: 'finish',
        summary: normalizedAction.summary || ''
      };
    }

    return {
      ok: false,
      type: type || 'unknown',
      error: `Unsupported action type: ${type || 'undefined'}`
    };
  }
}

module.exports = {
  ToolRunner
};
