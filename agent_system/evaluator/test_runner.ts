'use strict';

class TestRunner {
  constructor(options) {
    const normalizedOptions = options || {};
    this.terminal = normalizedOptions.terminal;
  }

  async run(commands) {
    const normalizedCommands = Array.isArray(commands) ? commands.filter(Boolean) : [];
    const results = [];

    for (const command of normalizedCommands) {
      const result = await this.terminal.runCommand(command);
      results.push({
        command,
        ...result
      });
    }

    return {
      results,
      passedCount: results.filter((result) => result.ok).length,
      failedCount: results.filter((result) => !result.ok).length
    };
  }
}

module.exports = {
  TestRunner
};
