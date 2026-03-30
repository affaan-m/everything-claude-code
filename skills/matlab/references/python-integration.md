# Python Integration Reference

## Table of Contents
1. [Calling Python from MATLAB](#calling-python-from-matlab)
2. [Data Type Conversion](#data-type-conversion)
3. [Working with Python Objects](#working-with-python-objects)
4. [Calling MATLAB from Python](#calling-matlab-from-python)
5. [Common Workflows](#common-workflows)

## Calling Python from MATLAB

### Setup

```matlab
% Check Python configuration
pyenv

% Set Python version (before calling any Python)
pyenv('Version', '/usr/bin/python3');
pyenv('Version', '3.10');

% Check if Python is available
pe = pyenv;
disp(pe.Version);
disp(pe.Executable);
```

### Basic Python Calls

```matlab
% Call built-in functions with py. prefix
result = py.len([1, 2, 3, 4]);  % 4
result = py.sum([1, 2, 3, 4]);  % 10
result = py.max([1, 2, 3, 4]);  % 4
result = py.abs(-5);            % 5

% Create Python objects
pyList = py.list({1, 2, 3});
pyDict = py.dict(pyargs('a', 1, 'b', 2));
pySet = py.set({1, 2, 3});
pyTuple = py.tuple({1, 2, 3});

% Call module functions
result = py.math.sqrt(16);
result = py.os.getcwd();
wrapped = py.textwrap.wrap('This is a long string');
```

### Import and Use Modules

```matlab
% Import module
np = py.importlib.import_module('numpy');
pd = py.importlib.import_module('pandas');

% Use module
arr = np.array({1, 2, 3, 4, 5});
result = np.mean(arr);

% Alternative: direct py. syntax
arr = py.numpy.array({1, 2, 3, 4, 5});
result = py.numpy.mean(arr);
```

### Run Python Code

```matlab
% Run Python statements
pyrun("x = 5")
pyrun("y = x * 2")
result = pyrun("z = y + 1", "z");

% Run Python file
pyrunfile("script.py");
result = pyrunfile("script.py", "output_variable");

% Run with input variables
x = 10;
result = pyrun("y = x * 2", "y", x=x);
```

### Keyword Arguments

```matlab
% Use pyargs for keyword arguments
result = py.sorted({3, 1, 4, 1, 5}, pyargs('reverse', true));

% Multiple keyword arguments
df = py.pandas.DataFrame(pyargs( ...
    'data', py.dict(pyargs('A', {1, 2, 3}, 'B', {4, 5, 6})), ...
    'index', {'x', 'y', 'z'}));
```

## Data Type Conversion

### MATLAB to Python

| MATLAB Type | Python Type |
|-------------|-------------|
| double, single | float |
| int8, int16, int32, int64 | int |
| uint8, uint16, uint32, uint64 | int |
| logical | bool |
| char, string | str |
| cell array | list |
| struct | dict |
| numeric array | numpy.ndarray (if numpy available) |

```matlab
% Automatic conversion examples
py.print(3.14);         % float
py.print(int32(42));    % int
py.print(true);         % bool (True)
py.print("hello");      % str
py.print({'a', 'b'});   % list

% Explicit conversion to Python types
pyInt = py.int(42);
pyFloat = py.float(3.14);
pyStr = py.str('hello');
pyList = py.list({1, 2, 3});
pyDict = py.dict(pyargs('key', 'value'));
```

### Python to MATLAB

```matlab
% Convert Python types to MATLAB
matlabDouble = double(py.float(3.14));
matlabInt = int64(py.int(42));
matlabChar = char(py.str('hello'));
matlabString = string(py.str('hello'));
matlabCell = cell(py.list({1, 2, 3}));

% Convert numpy arrays
pyArr = py.numpy.array({1, 2, 3, 4, 5});
matlabArr = double(pyArr);

% Convert pandas DataFrame to MATLAB table
pyDf = py.pandas.read_csv('data.csv');
matlabTable = table(pyDf);  % Requires pandas2table or similar

% Manual DataFrame conversion
colNames = cell(pyDf.columns.tolist());
data = cell(pyDf.values.tolist());
T = cell2table(data, 'VariableNames', colNames);
```

### Array Conversion

```matlab
% MATLAB array to numpy
matlabArr = [1 2 3; 4 5 6];
pyArr = py.numpy.array(matlabArr);

% numpy to MATLAB
pyArr = py.numpy.random.rand(int64(3), int64(4));
matlabArr = double(pyArr);

% Note: numpy uses row-major (C) order, MATLAB uses column-major (Fortran)
% Transposition may be needed for correct layout
```

## Working with Python Objects

### Object Methods and Properties

```matlab
% Call methods
pyList = py.list({3, 1, 4, 1, 5});
pyList.append(9);
pyList.sort();

% Access properties/attributes
pyStr = py.str('hello world');
upper = pyStr.upper();
words = pyStr.split();

% Check attributes
methods(pyStr)          % List methods
fieldnames(pyDict)      % List keys
```

### Iterating Python Objects

```matlab
% Iterate over Python list
pyList = py.list({1, 2, 3, 4, 5});
for item = py.list(pyList)
    disp(item{1});
end

% Convert to cell and iterate
items = cell(pyList);
for i = 1:length(items)
    disp(items{i});
end

% Iterate dict keys
pyDict = py.dict(pyargs('a', 1, 'b', 2, 'c', 3));
keys = cell(pyDict.keys());
for i = 1:length(keys)
    key = keys{i};
    value = pyDict{key};
    fprintf('%s: %d\n', char(key), int64(value));
end
```

### Error Handling

```matlab
try
    result = py.some_module.function_that_might_fail();
catch ME
    if isa(ME, 'matlab.exception.PyException')
        disp('Python error occurred:');
        disp(ME.message);
    else
        rethrow(ME);
    end
end
```

## Calling MATLAB from Python

### Setup MATLAB Engine

```python
# Install MATLAB Engine API for Python
# From MATLAB: cd(fullfile(matlabroot,'extern','engines','python'))
# Then: python setup.py install

import matlab.engine

# Start MATLAB engine
eng = matlab.engine.start_matlab()

# Or connect to shared session (MATLAB: matlab.engine.shareEngine)
eng = matlab.engine.connect_matlab()

# List available sessions
matlab.engine.find_matlab()
```

### Call MATLAB Functions

```python
import matlab.engine

eng = matlab.engine.start_matlab()

# Call built-in functions
result = eng.sqrt(16.0)
result = eng.sin(3.14159 / 2)

# Multiple outputs
mean_val, std_val = eng.std([1, 2, 3, 4, 5], nargout=2)

# Matrix operations
A = matlab.double([[1, 2], [3, 4]])
B = eng.inv(A)
C = eng.mtimes(A, B)  # Matrix multiplication

# Call custom function (must be on MATLAB path)
result = eng.myfunction(arg1, arg2)

# Cleanup
eng.quit()
```

### Data Conversion (Python to MATLAB)

```python
import matlab.engine
import numpy as np

eng = matlab.engine.start_matlab()

# Python to MATLAB types
matlab_double = matlab.double([1.0, 2.0, 3.0])
matlab_int = matlab.int32([1, 2, 3])
matlab_complex = matlab.double([1+2j, 3+4j], is_complex=True)

# 2D array
matlab_matrix = matlab.double([[1, 2, 3], [4, 5, 6]])

# numpy to MATLAB
np_array = np.array([[1, 2], [3, 4]], dtype=np.float64)
matlab_array = matlab.double(np_array.tolist())

# Call MATLAB with numpy data
result = eng.sum(matlab.double(np_array.flatten().tolist()))
```

### Async Calls

```python
import matlab.engine

eng = matlab.engine.start_matlab()

# Asynchronous call
future = eng.sqrt(16.0, background=True)

# Do other work...

# Get result when ready
result = future.result()

# Check if done
if future.done():
    result = future.result()

# Cancel if needed
future.cancel()
```

## Common Workflows

### Using Python Libraries in MATLAB

```matlab
% Use scikit-learn from MATLAB
sklearn = py.importlib.import_module('sklearn.linear_model');

% Prepare data
X = rand(100, 5);
y = X * [1; 2; 3; 4; 5] + randn(100, 1) * 0.1;

% Convert to Python/numpy
X_py = py.numpy.array(X);
y_py = py.numpy.array(y);

% Train model
model = sklearn.LinearRegression();
model.fit(X_py, y_py);

% Get coefficients
coefs = double(model.coef_);
intercept = double(model.intercept_);

% Predict
y_pred = double(model.predict(X_py));
```

### Using MATLAB in Python Scripts

```python
import matlab.engine
import numpy as np

# Start MATLAB
eng = matlab.engine.start_matlab()

# Use MATLAB's optimization
def matlab_fmincon(objective, x0, A, b, Aeq, beq, lb, ub):
    """Wrapper for MATLAB's fmincon."""
    # Convert to MATLAB types
    x0_m = matlab.double(x0.tolist())
    A_m = matlab.double(A.tolist()) if A is not None else matlab.double([])
    b_m = matlab.double(b.tolist()) if b is not None else matlab.double([])

    # Call MATLAB (assuming objective is a MATLAB function)
    x, fval = eng.fmincon(objective, x0_m, A_m, b_m, nargout=2)

    return np.array(x).flatten(), fval

# Use MATLAB's plotting
def matlab_plot(x, y, title_str):
    """Create plot using MATLAB."""
    eng.figure(nargout=0)
    eng.plot(matlab.double(x.tolist()), matlab.double(y.tolist()), nargout=0)
    eng.title(title_str, nargout=0)
    eng.saveas(eng.gcf(), 'plot.png', nargout=0)

eng.quit()
```

### Sharing Data Between MATLAB and Python

```matlab
% Save data for Python
data = rand(100, 10);
labels = randi([0 1], 100, 1);
save('data_for_python.mat', 'data', 'labels');

% In Python:
% import scipy.io
% mat = scipy.io.loadmat('data_for_python.mat')
% data = mat['data']
% labels = mat['labels']

% Load data from Python (saved with scipy.io.savemat)
loaded = load('data_from_python.mat');
data = loaded.data;
labels = loaded.labels;

% Alternative: use CSV for simple data exchange
writematrix(data, 'data.csv');
% Python: pd.read_csv('data.csv')

% Python writes: df.to_csv('results.csv')
results = readmatrix('results.csv');
```

### Using Python Packages Not Available in MATLAB

```matlab
% Example: Use Python's requests library
requests = py.importlib.import_module('requests');

% Make HTTP request
response = requests.get('https://api.example.com/data');
status = int64(response.status_code);

if status == 200
    data = response.json();
    % Convert to MATLAB structure
    dataStruct = struct(data);
end

% Example: Use Python's PIL/Pillow for advanced image processing
PIL = py.importlib.import_module('PIL.Image');

% Open image
img = PIL.open('image.png');

% Resize
img_resized = img.resize(py.tuple({int64(256), int64(256)}));

% Save
img_resized.save('image_resized.png');
```
