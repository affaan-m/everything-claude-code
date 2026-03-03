/**
 * Doc file warning hook (PreToolUse - Write)
 * Warns about non-standard documentation files.
 * Exit code 0 always (warns only, never blocks).
 */

let data = '';
process.stdin.on('data', c => (data += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    if (
      /\.(md|txt)$/.test(filePath) &&
      !/(README|CLAUDE|AGENTS|CONTRIBUTING|CHANGELOG|LICENSE|SKILL|MEMORY)\.md$/i.test(filePath) &&
      !/\.claude[/\\](plans|projects)[/\\]/.test(filePath) &&
      !/(^|[/\\])(docs|skills|\.history|memory)[/\\]/.test(filePath)
    ) {
      console.error('[Hook] WARNING: Non-standard documentation file detected');
      console.error('[Hook] File: ' + filePath);
      console.error('[Hook] Consider consolidating into README.md or docs/ directory');
    }
  } catch {
    /* ignore parse errors */
  }
  console.log(data);
});
