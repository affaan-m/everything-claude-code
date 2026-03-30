# Data Import and Export Reference

## Table of Contents
1. [Text and CSV Files](#text-and-csv-files)
2. [Spreadsheets](#spreadsheets)
3. [MAT Files](#mat-files)
4. [Images](#images)
5. [Tables and Data Types](#tables-and-data-types)
6. [Low-Level File I/O](#low-level-file-io)

## Text and CSV Files

### Reading Text Files

```matlab
% Recommended high-level functions
T = readtable('data.csv');          % Read as table (mixed types)
M = readmatrix('data.csv');         % Read as numeric matrix
C = readcell('data.csv');           % Read as cell array
S = readlines('data.txt');          % Read as string array (lines)
str = fileread('data.txt');         % Read entire file as string

% With options
T = readtable('data.csv', 'ReadVariableNames', true);
T = readtable('data.csv', 'Delimiter', ',');
T = readtable('data.csv', 'NumHeaderLines', 2);
M = readmatrix('data.csv', 'Range', 'B2:D100');

% Detect import options
opts = detectImportOptions('data.csv');
opts.VariableNames = {'Col1', 'Col2', 'Col3'};
opts.VariableTypes = {'double', 'string', 'double'};
opts.SelectedVariableNames = {'Col1', 'Col3'};
T = readtable('data.csv', opts);
```

### Writing Text Files

```matlab
% High-level functions
writetable(T, 'output.csv');
writematrix(M, 'output.csv');
writecell(C, 'output.csv');
writelines(S, 'output.txt');

% With options
writetable(T, 'output.csv', 'Delimiter', '\t');
writetable(T, 'output.csv', 'WriteVariableNames', false);
writematrix(M, 'output.csv', 'Delimiter', ',');
```

### Tab-Delimited Files

```matlab
% Reading
T = readtable('data.tsv', 'Delimiter', '\t');
T = readtable('data.txt', 'FileType', 'text', 'Delimiter', '\t');

% Writing
writetable(T, 'output.tsv', 'Delimiter', '\t');
writetable(T, 'output.txt', 'FileType', 'text', 'Delimiter', '\t');
```

## Spreadsheets

### Reading Excel Files

```matlab
% Basic reading
T = readtable('data.xlsx');
M = readmatrix('data.xlsx');
C = readcell('data.xlsx');

% Specific sheet
T = readtable('data.xlsx', 'Sheet', 'Sheet2');
T = readtable('data.xlsx', 'Sheet', 2);

% Specific range
M = readmatrix('data.xlsx', 'Range', 'B2:D100');
M = readmatrix('data.xlsx', 'Sheet', 2, 'Range', 'A1:F50');

% With options
opts = detectImportOptions('data.xlsx');
opts.Sheet = 'Data';
opts.DataRange = 'A2';
preview(opts.VariableNames)     % Check column names
T = readtable('data.xlsx', opts);

% Get sheet names
[~, sheets] = xlsfinfo('data.xlsx');
```

### Writing Excel Files

```matlab
% Basic writing
writetable(T, 'output.xlsx');
writematrix(M, 'output.xlsx');
writecell(C, 'output.xlsx');

% Specific sheet and range
writetable(T, 'output.xlsx', 'Sheet', 'Results');
writetable(T, 'output.xlsx', 'Sheet', 'Data', 'Range', 'B2');
writematrix(M, 'output.xlsx', 'Sheet', 2, 'Range', 'A1');

% Append to existing sheet (use Range to specify start position)
writetable(T2, 'output.xlsx', 'Sheet', 'Data', 'WriteMode', 'append');
```

## MAT Files

### Saving Variables

```matlab
% Save all workspace variables
save('data.mat');

% Save specific variables
save('data.mat', 'x', 'y', 'results');

% Save with options
save('data.mat', 'x', 'y', '-v7.3');    % Large files (>2GB)
save('data.mat', 'x', '-append');        % Append to existing file
save('data.mat', '-struct', 's');        % Save struct fields as variables

% Compression options
save('data.mat', 'x', '-v7');            % Compressed (default)
save('data.mat', 'x', '-v6');            % Uncompressed, faster
```

### Loading Variables

```matlab
% Load all variables
load('data.mat');

% Load specific variables
load('data.mat', 'x', 'y');

% Load into structure
S = load('data.mat');
S = load('data.mat', 'x', 'y');
x = S.x;
y = S.y;

% List contents without loading
whos('-file', 'data.mat');
vars = who('-file', 'data.mat');
```

### MAT-File Object (Large Files)

```matlab
% Create MAT-file object for partial access
m = matfile('data.mat');
m.Properties.Writable = true;

% Read partial data
x = m.bigArray(1:100, :);       % First 100 rows only

% Write partial data
m.bigArray(1:100, :) = newData;

% Get variable info
sz = size(m, 'bigArray');
```

## Images

### Reading Images

```matlab
% Read image
img = imread('image.png');
img = imread('image.jpg');
img = imread('image.tiff');

% Get image info
info = imfinfo('image.png');
info.Width
info.Height
info.ColorType
info.BitDepth

% Read specific frames (multi-page TIFF, GIF)
img = imread('animation.gif', 3);  % Frame 3
[img, map] = imread('indexed.gif');  % Indexed image with colormap
```

### Writing Images

```matlab
% Write image
imwrite(img, 'output.png');
imwrite(img, 'output.jpg');
imwrite(img, 'output.tiff');

% With options
imwrite(img, 'output.jpg', 'Quality', 95);
imwrite(img, 'output.png', 'BitDepth', 16);
imwrite(img, 'output.tiff', 'Compression', 'lzw');

% Write indexed image with colormap
imwrite(X, map, 'indexed.gif');

% Append to multi-page TIFF
imwrite(img1, 'multipage.tiff');
imwrite(img2, 'multipage.tiff', 'WriteMode', 'append');
```

### Image Formats

```matlab
% Supported formats (partial list)
% BMP  - Windows Bitmap
% GIF  - Graphics Interchange Format
% JPEG - Joint Photographic Experts Group
% PNG  - Portable Network Graphics
% TIFF - Tagged Image File Format
% PBM, PGM, PPM - Portable bitmap formats

% Check supported formats
formats = imformats;
```

## Tables and Data Types

### Creating Tables

```matlab
% From variables
T = table(var1, var2, var3);
T = table(var1, var2, 'VariableNames', {'Col1', 'Col2'});

% From arrays
T = array2table(M);
T = array2table(M, 'VariableNames', {'A', 'B', 'C'});

% From cell array
T = cell2table(C);
T = cell2table(C, 'VariableNames', {'Name', 'Value'});

% From struct
T = struct2table(S);
```

### Accessing Table Data

```matlab
% By variable name
col = T.VariableName;
col = T.('VariableName');
col = T{:, 'VariableName'};

% By index
row = T(5, :);              % Row 5
col = T(:, 3);              % Column 3 as table
data = T{:, 3};             % Column 3 as array
subset = T(1:10, 2:4);      % Subset as table
data = T{1:10, 2:4};        % Subset as array

% Logical indexing
subset = T(T.Value > 5, :);
```

### Modifying Tables

```matlab
% Add variable
T.NewVar = newData;
T = addvars(T, newData, 'NewName', 'Col4');
T = addvars(T, newData, 'Before', 'ExistingCol');

% Remove variable
T.OldVar = [];
T = removevars(T, 'OldVar');
T = removevars(T, {'Col1', 'Col2'});

% Rename variable
T = renamevars(T, 'OldName', 'NewName');
T.Properties.VariableNames{'OldName'} = 'NewName';

% Reorder variables
T = movevars(T, 'Col3', 'Before', 'Col1');
T = T(:, {'Col2', 'Col1', 'Col3'});
```

### Table Operations

```matlab
% Sorting
T = sortrows(T, 'Column');
T = sortrows(T, 'Column', 'descend');
T = sortrows(T, {'Col1', 'Col2'}, {'ascend', 'descend'});

% Unique rows
T = unique(T);
T = unique(T, 'rows');

% Join tables
T = join(T1, T2);                   % Inner join on common keys
T = join(T1, T2, 'Keys', 'ID');
T = innerjoin(T1, T2);
T = outerjoin(T1, T2);

% Stack/unstack
T = stack(T, {'Var1', 'Var2'});
T = unstack(T, 'Values', 'Keys');

% Group operations
G = groupsummary(T, 'GroupVar', 'mean', 'ValueVar');
G = groupsummary(T, 'GroupVar', {'mean', 'std'}, 'ValueVar');
```

### Cell Arrays

```matlab
% Create cell array
C = {1, 'text', [1 2 3]};
C = cell(m, n);             % Empty m×n cell array

% Access contents
contents = C{1, 2};         % Contents of cell (1,2)
subset = C(1:2, :);         % Subset of cells (still cell array)

% Convert
A = cell2mat(C);            % To matrix (if compatible)
T = cell2table(C);          % To table
S = cell2struct(C, fields); % To struct
```

### Structures

```matlab
% Create structure
S.field1 = value1;
S.field2 = value2;
S = struct('field1', value1, 'field2', value2);

% Access fields
val = S.field1;
val = S.('field1');

% Field names
names = fieldnames(S);
tf = isfield(S, 'field1');

% Structure arrays
S(1).name = 'Alice';
S(2).name = 'Bob';
names = {S.name};           % Extract all names
```

## Low-Level File I/O

### Opening and Closing Files

```matlab
% Open file
fid = fopen('file.txt', 'r');   % Read
fid = fopen('file.txt', 'w');   % Write (overwrite)
fid = fopen('file.txt', 'a');   % Append
fid = fopen('file.bin', 'rb');  % Read binary
fid = fopen('file.bin', 'wb');  % Write binary

% Check for errors
if fid == -1
    error('Could not open file');
end

% Close file
fclose(fid);
fclose('all');              % Close all files
```

### Text File I/O

```matlab
% Read formatted data
data = fscanf(fid, '%f');           % Read floats
data = fscanf(fid, '%f %f', [2 Inf]);  % Two columns
C = textscan(fid, '%f %s %f');      % Mixed types

% Read lines
line = fgetl(fid);          % One line (no newline)
line = fgets(fid);          % One line (with newline)

% Write formatted data
fprintf(fid, '%d, %f, %s\n', intVal, floatVal, strVal);
fprintf(fid, '%6.2f\n', data);

% Read/write strings
str = fscanf(fid, '%s');
fprintf(fid, '%s', str);
```

### Binary File I/O

```matlab
% Read binary data
data = fread(fid, n, 'double');     % n doubles
data = fread(fid, [m n], 'int32');  % m×n int32s
data = fread(fid, Inf, 'uint8');    % All bytes

% Write binary data
fwrite(fid, data, 'double');
fwrite(fid, data, 'int32');

% Data types: 'int8', 'uint8', 'int16', 'uint16', 'int32', 'uint32',
%             'int64', 'uint64', 'single', 'double', 'char'
```

### File Position

```matlab
% Get position
pos = ftell(fid);

% Set position
fseek(fid, 0, 'bof');       % Beginning of file
fseek(fid, 0, 'eof');       % End of file
fseek(fid, offset, 'cof'); % Current position + offset

% Rewind to beginning
frewind(fid);

% Check end of file
tf = feof(fid);
```

### File and Directory Operations

```matlab
% Check existence
tf = exist('file.txt', 'file');
tf = exist('folder', 'dir');
tf = isfile('file.txt');
tf = isfolder('folder');

% List files
files = dir('*.csv');           % Struct array
files = dir('folder/*.mat');
names = {files.name};

% File info
info = dir('file.txt');
info.name
info.bytes
info.date
info.datenum

% File operations
copyfile('src.txt', 'dst.txt');
movefile('src.txt', 'dst.txt');
delete('file.txt');

% Directory operations
mkdir('newfolder');
rmdir('folder');
rmdir('folder', 's');           % Remove with contents
cd('path');
pwd                             % Current directory
```

### Path Operations

```matlab
% Construct paths
fullpath = fullfile('folder', 'subfolder', 'file.txt');
fullpath = fullfile(pwd, 'file.txt');

% Parse paths
[path, name, ext] = fileparts('/path/to/file.txt');
% path = '/path/to', name = 'file', ext = '.txt'

% Temporary files/folders
tmpfile = tempname;
tmpdir = tempdir;
```
