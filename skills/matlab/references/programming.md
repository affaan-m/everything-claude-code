# Programming Reference

## Table of Contents
1. [Scripts and Functions](#scripts-and-functions)
2. [Control Flow](#control-flow)
3. [Function Types](#function-types)
4. [Error Handling](#error-handling)
5. [Performance and Debugging](#performance-and-debugging)
6. [Object-Oriented Programming](#object-oriented-programming)

## Scripts and Functions

### Scripts

```matlab
% Scripts are .m files with MATLAB commands
% They run in the base workspace (share variables)

% Example: myscript.m
% This is a comment
x = 1:10;
y = x.^2;
plot(x, y);
title('My Plot');

% Run script
myscript;           % Or: run('myscript.m')
```

### Functions

```matlab
% Functions have their own workspace
% Save in file with same name as function

% Example: myfunction.m
function y = myfunction(x)
%MYFUNCTION Brief description of function
%   Y = MYFUNCTION(X) detailed description
%
%   Example:
%       y = myfunction(5);
%
%   See also OTHERFUNCTION
    y = x.^2;
end

% Multiple outputs
function [result1, result2] = multioutput(x)
    result1 = x.^2;
    result2 = x.^3;
end

% Variable arguments
function varargout = flexfun(varargin)
    % varargin is cell array of inputs
    % varargout is cell array of outputs
    n = nargin;          % Number of inputs
    m = nargout;         % Number of outputs
end
```

### Input Validation

```matlab
function result = validatedinput(x, options)
    arguments
        x (1,:) double {mustBePositive}
        options.Normalize (1,1) logical = false
        options.Scale (1,1) double {mustBePositive} = 1
    end

    result = x * options.Scale;
    if options.Normalize
        result = result / max(result);
    end
end

% Usage
y = validatedinput([1 2 3], 'Normalize', true, 'Scale', 2);

% Common validators
% mustBePositive, mustBeNegative, mustBeNonzero
% mustBeInteger, mustBeNumeric, mustBeFinite
% mustBeNonNaN, mustBeReal, mustBeNonempty
% mustBeMember, mustBeInRange, mustBeGreaterThan
```

### Local Functions

```matlab
% Local functions appear after main function
% Only accessible within the same file

function result = mainfunction(x)
    intermediate = helper1(x);
    result = helper2(intermediate);
end

function y = helper1(x)
    y = x.^2;
end

function y = helper2(x)
    y = sqrt(x);
end
```

## Control Flow

### Conditional Statements

```matlab
% if-elseif-else
if condition1
    % statements
elseif condition2
    % statements
else
    % statements
end

% Logical operators
%   &  - AND (element-wise)
%   |  - OR (element-wise)
%   ~  - NOT
%   && - AND (short-circuit, scalars)
%   || - OR (short-circuit, scalars)
%   == - Equal
%   ~= - Not equal
%   <, <=, >, >= - Comparisons

% Example
if x > 0 && y > 0
    quadrant = 1;
elseif x < 0 && y > 0
    quadrant = 2;
elseif x < 0 && y < 0
    quadrant = 3;
else
    quadrant = 4;
end
```

### Switch Statements

```matlab
switch expression
    case value1
        % statements
    case {value2, value3}  % Multiple values
        % statements
    otherwise
        % default statements
end

% Example
switch dayOfWeek
    case {'Saturday', 'Sunday'}
        dayType = 'Weekend';
    case {'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'}
        dayType = 'Weekday';
    otherwise
        dayType = 'Unknown';
end
```

### For Loops

```matlab
% Basic for loop
for i = 1:10
    % statements using i
end

% Custom step
for i = 10:-1:1
    % count down
end

% Loop over vector
for val = [1 3 5 7 9]
    % val takes each value
end

% Loop over columns of matrix
for col = A
    % col is a column vector
end

% Loop over cell array
for i = 1:length(C)
    item = C{i};
end
```

### While Loops

```matlab
% Basic while loop
while condition
    % statements
    % Update condition
end

% Example
count = 0;
while count < 10
    count = count + 1;
    % Do something
end
```

### Loop Control

```matlab
% Break - exit loop immediately
for i = 1:100
    if someCondition
        break;
    end
end

% Continue - skip to next iteration
for i = 1:100
    if skipCondition
        continue;
    end
    % Process i
end

% Return - exit function
function y = myfunction(x)
    if x < 0
        y = NaN;
        return;
    end
    y = sqrt(x);
end
```

## Function Types

### Anonymous Functions

```matlab
% Create inline function
f = @(x) x.^2 + 2*x + 1;
g = @(x, y) x.^2 + y.^2;

% Use
y = f(5);           % 36
z = g(3, 4);        % 25

% With captured variables
a = 2;
h = @(x) a * x;     % Captures current value of a
y = h(5);           % 10
a = 3;              % Changing a doesn't affect h
y = h(5);           % Still 10

% No arguments
now_fn = @() datestr(now);
timestamp = now_fn();

% Pass to other functions
result = integral(f, 0, 1);
```

### Nested Functions

```matlab
function result = outerfunction(x)
    y = x.^2;           % Shared with nested functions

    function z = nestedfunction(a)
        z = y + a;      % Can access y from outer scope
    end

    result = nestedfunction(10);
end
```

### Function Handles

```matlab
% Create handle to existing function
h = @sin;
y = h(pi/2);        % 1

% From string
h = str2func('cos');

% Get function name
name = func2str(h);

% Get handles to local functions
handles = localfunctions;

% Function info
info = functions(h);
```

### Callbacks

```matlab
% Using function handles as callbacks

% Timer example
t = timer('TimerFcn', @myCallback, 'Period', 1);
start(t);

function myCallback(~, ~)
    disp(['Time: ' datestr(now)]);
end

% With anonymous function
t = timer('TimerFcn', @(~,~) disp('Tick'), 'Period', 1);

% GUI callbacks
uicontrol('Style', 'pushbutton', 'Callback', @buttonPressed);
```

## Error Handling

### Try-Catch

```matlab
try
    % Code that might error
    result = riskyOperation();
catch ME
    % Handle error
    disp(['Error: ' ME.message]);
    disp(['Identifier: ' ME.identifier]);

    % Optionally rethrow
    rethrow(ME);
end

% Catch specific errors
try
    result = operation();
catch ME
    switch ME.identifier
        case 'MATLAB:divideByZero'
            result = Inf;
        case 'MATLAB:nomem'
            rethrow(ME);
        otherwise
            result = NaN;
    end
end
```

### Throwing Errors

```matlab
% Simple error
error('Something went wrong');

% With identifier
error('MyPkg:InvalidInput', 'Input must be positive');

% With formatting
error('MyPkg:OutOfRange', 'Value %f is out of range [%f, %f]', val, lo, hi);

% Create and throw exception
ME = MException('MyPkg:Error', 'Error message');
throw(ME);

% Assertion
assert(condition, 'Message if false');
assert(x > 0, 'MyPkg:NotPositive', 'x must be positive');
```

### Warnings

```matlab
% Issue warning
warning('This might be a problem');
warning('MyPkg:Warning', 'Warning message');

% Control warnings
warning('off', 'MyPkg:Warning');    % Disable specific warning
warning('on', 'MyPkg:Warning');     % Enable
warning('off', 'all');              % Disable all
warning('on', 'all');               % Enable all

% Query warning state
s = warning('query', 'MyPkg:Warning');

% Temporarily disable
origState = warning('off', 'MATLAB:nearlySingularMatrix');
% ... code ...
warning(origState);
```

## Performance and Debugging

### Timing

```matlab
% Simple timing
tic;
% ... code ...
elapsed = toc;

% Multiple timers
t1 = tic;
% ... code ...
elapsed1 = toc(t1);

% CPU time
t = cputime;
% ... code ...
cpuElapsed = cputime - t;

% Profiler
profile on;
myfunction();
profile viewer;     % GUI to analyze results
p = profile('info'); % Get programmatic results
profile off;
```

### Memory

```matlab
% Memory info
[user, sys] = memory;   % Windows only
whos;                   % Variable sizes

% Clear variables
clear x y z;
clear all;              % All variables (use sparingly)
clearvars -except x y;  % Keep specific variables
```

### Debugging

```matlab
% Set breakpoints (in editor or programmatically)
dbstop in myfunction at 10
dbstop if error
dbstop if warning
dbstop if naninf          % Stop on NaN or Inf

% Step through code
dbstep                    % Next line
dbstep in                 % Step into function
dbstep out                % Step out of function
dbcont                    % Continue execution
dbquit                    % Quit debugging

% Clear breakpoints
dbclear all

% Examine state
dbstack                   % Call stack
whos                      % Variables
```

### Vectorization Tips

```matlab
% AVOID loops when possible
% Slow:
for i = 1:n
    y(i) = x(i)^2;
end

% Fast:
y = x.^2;

% Element-wise operations (use . prefix)
y = a .* b;             % Element-wise multiply
y = a ./ b;             % Element-wise divide
y = a .^ b;             % Element-wise power

% Built-in functions operate on arrays
y = sin(x);             % Apply to all elements
s = sum(x);             % Sum all
m = max(x);             % Maximum

% Logical indexing instead of find
% Slow:
idx = find(x > 0);
y = x(idx);

% Fast:
y = x(x > 0);

% Preallocate arrays
% Slow:
y = [];
for i = 1:n
    y(i) = compute(i);
end

% Fast:
y = zeros(1, n);
for i = 1:n
    y(i) = compute(i);
end
```

### Parallel Computing

```matlab
% Parallel for loop
parfor i = 1:n
    results(i) = compute(i);
end

% Note: parfor has restrictions
% - Iterations must be independent
% - Variable classifications (sliced, broadcast, etc.)

% Start parallel pool
pool = parpool;         % Default cluster
pool = parpool(4);      % 4 workers

% Delete pool
delete(gcp('nocreate'));

% Parallel array operations
spmd
    % Each worker executes this block
    localData = myData(labindex);
    result = process(localData);
end
```

## Object-Oriented Programming

### Class Definition

```matlab
% In file MyClass.m
classdef MyClass
    properties
        PublicProp
    end

    properties (Access = private)
        PrivateProp
    end

    properties (Constant)
        ConstProp = 42
    end

    methods
        % Constructor
        function obj = MyClass(value)
            obj.PublicProp = value;
        end

        % Instance method
        function result = compute(obj, x)
            result = obj.PublicProp * x;
        end
    end

    methods (Static)
        function result = staticMethod(x)
            result = x.^2;
        end
    end
end
```

### Using Classes

```matlab
% Create object
obj = MyClass(10);

% Access properties
val = obj.PublicProp;
obj.PublicProp = 20;

% Call methods
result = obj.compute(5);
result = compute(obj, 5);   % Equivalent

% Static method
result = MyClass.staticMethod(3);

% Constant property
val = MyClass.ConstProp;
```

### Inheritance

```matlab
classdef DerivedClass < BaseClass
    properties
        ExtraProp
    end

    methods
        function obj = DerivedClass(baseVal, extraVal)
            % Call superclass constructor
            obj@BaseClass(baseVal);
            obj.ExtraProp = extraVal;
        end

        % Override method
        function result = compute(obj, x)
            % Call superclass method
            baseResult = compute@BaseClass(obj, x);
            result = baseResult + obj.ExtraProp;
        end
    end
end
```

### Handle vs Value Classes

```matlab
% Value class (default) - copy semantics
classdef ValueClass
    properties
        Data
    end
end

a = ValueClass();
a.Data = 1;
b = a;          % b is a copy
b.Data = 2;     % a.Data is still 1

% Handle class - reference semantics
classdef HandleClass < handle
    properties
        Data
    end
end

a = HandleClass();
a.Data = 1;
b = a;          % b references same object
b.Data = 2;     % a.Data is now 2
```

### Events and Listeners

```matlab
classdef EventClass < handle
    events
        DataChanged
    end

    properties
        Data
    end

    methods
        function set.Data(obj, value)
            obj.Data = value;
            notify(obj, 'DataChanged');
        end
    end
end

% Usage
obj = EventClass();
listener = addlistener(obj, 'DataChanged', @(src, evt) disp('Data changed!'));
obj.Data = 42;  % Triggers event
```
