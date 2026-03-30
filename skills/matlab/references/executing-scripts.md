````md
# Running MATLAB and GNU Octave Scripts from Bash

This document shows common ways to execute MATLAB-style `.m` scripts from a Bash environment using both MATLAB (MathWorks) and GNU Octave. It covers interactive use, non-interactive batch runs, passing arguments, capturing output, and practical patterns for automation and CI.

## Contents

- Requirements
- Quick comparisons
- Running MATLAB scripts from Bash
  - Interactive mode
  - Run a script non-interactively
  - Run a function with arguments
  - Run one-liners
  - Working directory and path handling
  - Capturing output and exit codes
  - Common MATLAB flags for scripting
- Running Octave scripts from Bash
  - Interactive mode
  - Run a script non-interactively
  - Run a function with arguments
  - Run one-liners
  - Making `.m` files executable (shebang)
  - Working directory and path handling
  - Capturing output and exit codes
  - Common Octave flags for scripting
- Cross-compatibility tips (MATLAB + Octave)
- Example: a portable runner script
- Troubleshooting

## Requirements

### MATLAB
- MATLAB must be installed.
- The `matlab` executable must be on your PATH, or you must reference it by full path.
- A valid license is required to run MATLAB.

Check:
```bash
matlab -help | head
````

### GNU Octave

* Octave must be installed.
* The `octave` executable must be on your PATH.

Check:

```bash
octave --version
```

## Quick comparison

| Task                          | MATLAB                            | Octave                   |
| ----------------------------- | --------------------------------- | ------------------------ |
| Interactive shell             | `matlab` (GUI by default)         | `octave`                 |
| Headless run (CI)             | `matlab -batch "cmd"` (preferred) | `octave --eval "cmd"`    |
| Run script file               | `matlab -batch "run('file.m')"`   | `octave --no-gui file.m` |
| Exit with code                | `exit(n)`                         | `exit(n)`                |
| Make `.m` directly executable | uncommon                          | common via shebang       |

## Running MATLAB scripts from Bash

### 1) Interactive mode

Starts MATLAB. Depending on your platform and install, this may launch a GUI.

```bash
matlab
```

For terminal-only use, prefer `-nodesktop` and optionally `-nosplash`:

```bash
matlab -nodesktop -nosplash
```

### 2) Run a script non-interactively

Recommended modern approach: `-batch`. It runs the command and exits when finished.

Run a script with `run()`:

```bash
matlab -batch "run('myscript.m')"
```

If the script relies on being run from its directory, set the working directory first:

```bash
matlab -batch "cd('/path/to/project'); run('myscript.m')"
```

Alternative older pattern: `-r` (less robust for automation because you must ensure MATLAB exits):

```bash
matlab -nodisplay -nosplash -r "run('myscript.m'); exit"
```

### 3) Run a function with arguments

If your file defines a function, call it directly. Prefer `-batch`:

```bash
matlab -batch "myfunc(123, 'abc')"
```

To pass values from Bash variables:

```bash
matlab -batch "myfunc(${N}, '${NAME}')"
```

If arguments may contain quotes or spaces, consider writing a small MATLAB wrapper function that reads environment variables.

### 4) Run one-liners

```bash
matlab -batch "disp(2+2)"
```

Multiple statements:

```bash
matlab -batch "a=1; b=2; fprintf('%d\n', a+b)"
```

### 5) Working directory and path handling

Common options:

* Change directory at startup:

```bash
matlab -batch "cd('/path/to/project'); myfunc()"
```

* Add code directories to MATLAB path:

```bash
matlab -batch "addpath('/path/to/lib'); myfunc()"
```

To include subfolders:

```bash
matlab -batch "addpath(genpath('/path/to/project')); myfunc()"
```

### 6) Capturing output and exit codes

Capture stdout/stderr:

```bash
matlab -batch "run('myscript.m')" > matlab.out 2>&1
```

Check exit code:

```bash
matlab -batch "run('myscript.m')"
echo $?
```

To explicitly fail a pipeline, use `exit(1)` on error. Example pattern:

```matlab
try
  run('myscript.m');
catch ME
  disp(getReport(ME));
  exit(1);
end
exit(0);
```

Run it:

```bash
matlab -batch "try, run('myscript.m'); catch ME, disp(getReport(ME)); exit(1); end; exit(0);"
```

### 7) Common MATLAB flags for scripting

Commonly useful options:

* `-batch "cmd"`: run command, return a process exit code, then exit
* `-nodisplay`: no display (useful on headless systems)
* `-nodesktop`: no desktop GUI
* `-nosplash`: no startup splash
* `-r "cmd"`: run command; must include `exit` if you want it to terminate

Exact availability varies by MATLAB release, so use `matlab -help` for your version.

## Running GNU Octave scripts from Bash

### 1) Interactive mode

```bash
octave
```

Quieter:

```bash
octave --quiet
```

### 2) Run a script non-interactively

Run a file and exit:

```bash
octave --no-gui myscript.m
```

Quieter:

```bash
octave --quiet --no-gui myscript.m
```

Some environments use:

```bash
octave --no-window-system myscript.m
```

### 3) Run a function with arguments

If `myfunc.m` defines a function `myfunc`, call it via `--eval`:

```bash
octave --quiet --eval "myfunc(123, 'abc')"
```

If your function is not on the Octave path, add paths first:

```bash
octave --quiet --eval "addpath('/path/to/project'); myfunc()"
```

### 4) Run one-liners

```bash
octave --quiet --eval "disp(2+2)"
```

Multiple statements:

```bash
octave --quiet --eval "a=1; b=2; printf('%d\n', a+b);"
```

### 5) Making `.m` files executable (shebang)

This is a common "standalone script" pattern in Octave.

Create `myscript.m`:

```matlab
#!/usr/bin/env octave
disp("Hello from Octave");
```

Make executable:

```bash
chmod +x myscript.m
```

Run:

```bash
./myscript.m
```

If you need flags (quiet, no GUI), use a wrapper script instead, because the shebang line typically supports limited arguments across platforms.

### 6) Working directory and path handling

Change directory from the shell before running:

```bash
cd /path/to/project
octave --quiet --no-gui myscript.m
```

Or change directory within Octave:

```bash
octave --quiet --eval "cd('/path/to/project'); run('myscript.m');"
```

Add paths:

```bash
octave --quiet --eval "addpath('/path/to/lib'); run('myscript.m');"
```

### 7) Capturing output and exit codes

Capture stdout/stderr:

```bash
octave --quiet --no-gui myscript.m > octave.out 2>&1
```

Exit code:

```bash
octave --quiet --no-gui myscript.m
echo $?
```

To force non-zero exit on error, wrap execution:

```matlab
try
  run('myscript.m');
catch err
  disp(err.message);
  exit(1);
end
exit(0);
```

Run it:

```bash
octave --quiet --eval "try, run('myscript.m'); catch err, disp(err.message); exit(1); end; exit(0);"
```

### 8) Common Octave flags for scripting

Useful options:

* `--eval "cmd"`: run a command string
* `--quiet`: suppress startup messages
* `--no-gui`: disable GUI
* `--no-window-system`: similar headless mode on some installs
* `--persist`: keep Octave open after running commands (opposite of batch behavior)

Check:

```bash
octave --help | head -n 50
```

## Cross-compatibility tips (MATLAB and Octave)

1. Prefer functions over scripts for automation
   Functions give cleaner parameter passing and namespace handling.

2. Avoid toolbox-specific calls if you need portability
   Many MATLAB toolboxes have no Octave equivalent.

3. Be careful with strings and quoting
   MATLAB and Octave both support `'single quotes'`, and newer MATLAB supports `"double quotes"` strings. For maximum compatibility, prefer single quotes unless you know your Octave version supports double quotes the way you need.

4. Use `fprintf` or `disp` for output
   For CI logs, keep output simple and deterministic.

5. Ensure exit codes reflect success or failure
   In both environments, `exit(0)` indicates success, `exit(1)` indicates failure.

## Example: a portable Bash runner

This script tries MATLAB first if available, otherwise Octave.

Create `run_mfile.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

FILE="${1:?Usage: run_mfile.sh path/to/script_or_function.m}"
CMD="${2:-}"  # optional command override

if command -v matlab >/dev/null 2>&1; then
  if [[ -n "$CMD" ]]; then
    matlab -batch "$CMD"
  else
    matlab -batch "run('${FILE}')"
  fi
elif command -v octave >/dev/null 2>&1; then
  if [[ -n "$CMD" ]]; then
    octave --quiet --no-gui --eval "$CMD"
  else
    octave --quiet --no-gui "$FILE"
  fi
else
  echo "Neither matlab nor octave found on PATH" >&2
  exit 127
fi
```

Make executable:

```bash
chmod +x run_mfile.sh
```

Run:

```bash
./run_mfile.sh myscript.m
```

Or run a function call:

```bash
./run_mfile.sh myfunc.m "myfunc(1, 'abc')"
```

## Troubleshooting

### MATLAB: command not found

* Add MATLAB to PATH, or invoke it by full path, for example:

```bash
/Applications/MATLAB_R202x?.app/bin/matlab -batch "disp('ok')"
```

### Octave: GUI issues on servers

* Use `--no-gui` or `--no-window-system`.

### Scripts depend on relative paths

* `cd` into the script directory before launching, or do `cd()` within MATLAB/Octave before calling `run()`.

### Quoting problems when passing strings

* Avoid complex quoting in `--eval` or `-batch`.
* Use environment variables and read them inside MATLAB/Octave when inputs are complicated.

### Different behavior between MATLAB and Octave

* Check for unsupported functions or toolbox calls.
* Run minimal repro steps using `--eval` or `-batch` to isolate incompatibilities.
