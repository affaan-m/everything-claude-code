# GNU Octave Compatibility Reference

## Table of Contents
1. [Overview](#overview)
2. [Syntax Differences](#syntax-differences)
3. [Operator Differences](#operator-differences)
4. [Function Differences](#function-differences)
5. [Features Unique to Octave](#features-unique-to-octave)
6. [Features Missing in Octave](#features-missing-in-octave)
7. [Writing Compatible Code](#writing-compatible-code)
8. [Octave Packages](#octave-packages)

## Overview

GNU Octave is a free, open-source alternative to MATLAB with high compatibility. Most MATLAB scripts run in Octave with no or minimal modifications. However, there are some differences to be aware of.

### Installation

```bash
# macOS (Homebrew)
brew install octave

# Ubuntu/Debian
sudo apt install octave

# Fedora
sudo dnf install octave

# Windows
# Download installer from https://octave.org/download
```

### Running Octave

```bash
# Interactive mode
octave

# Run script
octave script.m
octave --eval "disp('Hello')"

# GUI mode
octave --gui

# Command-line only (no graphics)
octave --no-gui
octave-cli
```

## Syntax Differences

### Comments

```matlab
% MATLAB style (works in both)
% This is a comment

# Octave style (Octave only)
# This is also a comment in Octave

% For compatibility, always use %
```

### String Quotes

```matlab
% MATLAB: Single quotes only (char arrays)
str = 'Hello';              % char array
str = "Hello";              % string (R2017a+)

% Octave: Both work, but different behavior
str1 = 'Hello';             % char array, no escape sequences
str2 = "Hello\n";           % Interprets \n as newline

% For compatibility, use single quotes for char arrays
% Avoid double quotes with escape sequences
```

### Line Continuation

```matlab
% MATLAB style (works in both)
x = 1 + 2 + 3 + ...
    4 + 5;

% Octave also accepts backslash
x = 1 + 2 + 3 + \
    4 + 5;

% For compatibility, use ...
```

### Block Terminators

```matlab
% MATLAB style (works in both)
if condition
    % code
end

for i = 1:10
    % code
end

% Octave also accepts specific terminators
if condition
    # code
endif

for i = 1:10
    # code
endfor

while condition
    # code
endwhile

% For compatibility, always use 'end'
```

### Function Definitions

```matlab
% MATLAB requires function in file with same name
% Octave allows command-line function definitions

% Octave command-line function
function y = f(x)
    y = x^2;
endfunction

% For compatibility, define functions in .m files
```

## Operator Differences

### Increment/Decrement Operators

```matlab
% Octave has C-style operators (MATLAB does not)
x++;                        % x = x + 1
x--;                        % x = x - 1
++x;                        % Pre-increment
--x;                        % Pre-decrement

% For compatibility, use explicit assignment
x = x + 1;
x = x - 1;
```

### Compound Assignment

```matlab
% Octave supports (MATLAB does not)
x += 5;                     % x = x + 5
x -= 3;                     % x = x - 3
x *= 2;                     % x = x * 2
x /= 4;                     % x = x / 4
x ^= 2;                     % x = x ^ 2

% Element-wise versions
x .+= y;
x .-= y;
x .*= y;
x ./= y;
x .^= y;

% For compatibility, use explicit assignment
x = x + 5;
x = x .* y;
```

### Logical Operators

```matlab
% Both support
& | ~ && ||

% Short-circuit behavior difference:
% MATLAB: & and | short-circuit in if/while conditions
% Octave: Only && and || short-circuit

% For predictable behavior, use:
% && || for scalar short-circuit logic
% & | for element-wise operations
```

### Indexing After Expression

```matlab
% Octave allows indexing immediately after expression
result = sin(x)(1:10);      % First 10 elements of sin(x)
value = func(arg).field;    % Access field of returned struct

% MATLAB requires intermediate variable
temp = sin(x);
result = temp(1:10);

temp = func(arg);
value = temp.field;

% For compatibility, use intermediate variables
```

## Function Differences

### Built-in Functions

Most basic functions are compatible. Some differences:

```matlab
% Function name differences
% MATLAB          Octave Alternative
% ------          ------------------
% inputname       (not available)
% inputParser     (partial support)
% validateattributes  (partial support)

% Behavior differences in edge cases
% Check documentation for specific functions
```

### Random Number Generation

```matlab
% Both use Mersenne Twister by default
% Seed setting is similar
rng(42);                    % MATLAB
rand('seed', 42);           % Octave (also accepts rng syntax)

% For compatibility
rng(42);                    % Works in modern Octave
```

### Graphics

```matlab
% Basic plotting is compatible
plot(x, y);
xlabel('X'); ylabel('Y');
title('Title');
legend('Data');

% Some advanced features differ
% - Octave uses gnuplot or Qt graphics
% - Some property names may differ
% - Animation/GUI features vary

% Test graphics code in both environments
```

### File I/O

```matlab
% Basic I/O is compatible
save('file.mat', 'x', 'y');
load('file.mat');
dlmread('file.txt');
dlmwrite('file.txt', data);

% MAT-file versions
save('file.mat', '-v7');    % Compatible format
save('file.mat', '-v7.3');  % HDF5 format (partial Octave support)

% For compatibility, use -v7 or -v6
```

## Features Unique to Octave

### do-until Loop

```matlab
% Octave only
do
    x = x + 1;
until (x > 10)

% Equivalent MATLAB/compatible code
x = x + 1;
while x <= 10
    x = x + 1;
end
```

### unwind_protect

```matlab
% Octave only - guaranteed cleanup
unwind_protect
    % code that might error
    result = risky_operation();
unwind_protect_cleanup
    % always executed (like finally)
    cleanup();
end_unwind_protect

% MATLAB equivalent
try
    result = risky_operation();
catch
end
cleanup();  % Not guaranteed if error not caught
```

### Built-in Documentation

```matlab
% Octave supports Texinfo documentation in functions
function y = myfunction(x)
    %% -*- texinfo -*-
    %% @deftypefn {Function File} {@var{y} =} myfunction (@var{x})
    %% Description of myfunction.
    %% @end deftypefn
    y = x.^2;
endfunction
```

### Package System

```matlab
% Octave Forge packages
pkg install -forge control
pkg load control

% List installed packages
pkg list

% For MATLAB compatibility, use equivalent toolboxes
% or include package functionality directly
```

## Features Missing in Octave

### Simulink

```matlab
% No Octave equivalent
% Simulink models (.slx, .mdl) cannot run in Octave
```

### MATLAB Toolboxes

```matlab
% Many toolbox functions not available
% Some have Octave Forge equivalents:

% MATLAB Toolbox        Octave Forge Package
% ---------------       --------------------
% Control System        control
% Signal Processing     signal
% Image Processing      image
% Statistics            statistics
% Optimization          optim

% Check pkg list for available packages
```

### App Designer / GUIDE

```matlab
% MATLAB GUI tools not available in Octave
% Octave has basic UI functions:
uicontrol, uimenu, figure properties

% For cross-platform GUIs, consider:
% - Web-based interfaces
% - Qt (via Octave's Qt graphics)
```

### Object-Oriented Programming

```matlab
% Octave has partial classdef support
% Some features missing or behave differently:
% - Handle class events
% - Property validation
% - Some access modifiers

% For compatibility, use simpler OOP patterns
% or struct-based approaches
```

### Live Scripts

```matlab
% .mlx files are MATLAB-only
% Use regular .m scripts for compatibility
```

## Writing Compatible Code

### Detection

```matlab
function tf = isOctave()
    tf = exist('OCTAVE_VERSION', 'builtin') ~= 0;
end

% Use for conditional code
if isOctave()
    % Octave-specific code
else
    % MATLAB-specific code
end
```

### Best Practices

```matlab
% 1. Use % for comments, not #
% Good
% This is a comment

% Avoid
# This is a comment (Octave only)

% 2. Use ... for line continuation
% Good
x = 1 + 2 + 3 + ...
    4 + 5;

% Avoid
x = 1 + 2 + 3 + \
    4 + 5;

% 3. Use 'end' for all blocks
% Good
if condition
    code
end

% Avoid
if condition
    code
endif

% 4. Avoid compound operators
% Good
x = x + 1;

% Avoid
x++;
x += 1;

% 5. Use single quotes for strings
% Good
str = 'Hello World';

% Avoid (escape sequence issues)
str = "Hello\nWorld";

% 6. Use intermediate variables for indexing
% Good
temp = func(arg);
result = temp(1:10);

% Avoid (Octave only)
result = func(arg)(1:10);

% 7. Save MAT-files in compatible format
save('data.mat', 'x', 'y', '-v7');
```

### Testing Compatibility

```bash
# Test in both environments
matlab -nodisplay -nosplash -r "run('test_script.m'); exit;"
octave --no-gui test_script.m

# Create test script
# test_script.m:
# try
#     main_function();
#     disp('Test passed');
# catch ME
#     disp(['Test failed: ' ME.message]);
# end
```

## Octave Packages

### Installing Packages

```matlab
% Install from Octave Forge
pkg install -forge package_name

% Install from file
pkg install package_file.tar.gz

% Install from URL
pkg install 'http://example.com/package.tar.gz'

% Uninstall
pkg uninstall package_name
```

### Using Packages

```matlab
% Load package (required before use)
pkg load control
pkg load signal
pkg load image

% Load at startup (add to .octaverc)
pkg load control

% List loaded packages
pkg list

% Unload package
pkg unload control
```

### Common Packages

| Package | Description |
|---------|-------------|
| control | Control systems design |
| signal | Signal processing |
| image | Image processing |
| statistics | Statistical functions |
| optim | Optimization algorithms |
| io | Input/output functions |
| struct | Structure manipulation |
| symbolic | Symbolic math (via SymPy) |
| parallel | Parallel computing |
| netcdf | NetCDF file support |

### Package Management

```matlab
% Update all packages
pkg update

% Get package description
pkg describe package_name

% Check for updates
pkg list  % Compare with Octave Forge website
```
