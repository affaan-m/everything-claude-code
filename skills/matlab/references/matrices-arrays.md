# Matrices and Arrays Reference

## Table of Contents
1. [Array Creation](#array-creation)
2. [Indexing and Subscripting](#indexing-and-subscripting)
3. [Array Manipulation](#array-manipulation)
4. [Concatenation and Reshaping](#concatenation-and-reshaping)
5. [Array Information](#array-information)
6. [Sorting and Searching](#sorting-and-searching)

## Array Creation

### Basic Creation

```matlab
% Direct specification
A = [1 2 3; 4 5 6; 7 8 9];    % 3x3 matrix (rows separated by ;)
v = [1, 2, 3, 4, 5];           % Row vector
v = [1; 2; 3; 4; 5];           % Column vector

% Range operators
v = 1:10;                       % 1 to 10, step 1
v = 0:0.5:5;                    % 0 to 5, step 0.5
v = 10:-1:1;                    % 10 down to 1

% Linearly/logarithmically spaced
v = linspace(0, 1, 100);        % 100 points from 0 to 1
v = logspace(0, 3, 50);         % 50 points from 10^0 to 10^3
```

### Special Matrices

```matlab
% Common patterns
I = eye(n);                     % n×n identity matrix
I = eye(m, n);                  % m×n identity matrix
Z = zeros(m, n);                % m×n zeros
O = ones(m, n);                 % m×n ones
D = diag([1 2 3]);              % Diagonal matrix from vector
d = diag(A);                    % Extract diagonal from matrix

% Random matrices
R = rand(m, n);                 % Uniform [0,1]
R = randn(m, n);                % Normal (mean=0, std=1)
R = randi([a b], m, n);         % Random integers in [a,b]
R = randperm(n);                % Random permutation of 1:n

% Logical arrays
T = true(m, n);                 % All true
F = false(m, n);                % All false

% Grids for 2D/3D
[X, Y] = meshgrid(x, y);        % 2D grid from vectors
[X, Y, Z] = meshgrid(x, y, z);  % 3D grid
[X, Y] = ndgrid(x, y);          % Alternative (different orientation)
```

### Creating from Existing

```matlab
A_like = zeros(size(B));        % Same size as B
A_like = ones(size(B), 'like', B);  % Same size and type as B
A_copy = A;                     % Copy (by value, not reference)
```

## Indexing and Subscripting

### Basic Indexing

```matlab
% Single element (1-based indexing)
elem = A(2, 3);                 % Row 2, column 3
elem = A(5);                    % Linear index (column-major order)

% Ranges
row = A(2, :);                  % Entire row 2
col = A(:, 3);                  % Entire column 3
sub = A(1:2, 2:3);              % Rows 1-2, columns 2-3

% End keyword
last = A(end, :);               % Last row
last3 = A(end-2:end, :);        % Last 3 rows
```

### Logical Indexing

```matlab
% Find elements meeting condition
idx = A > 5;                    % Logical array
elements = A(A > 5);            % Extract elements > 5
A(A < 0) = 0;                   % Set negative elements to 0

% Combine conditions
idx = (A > 0) & (A < 10);       % AND
idx = (A < 0) | (A > 10);       % OR
idx = ~(A == 0);                % NOT
```

### Linear Indexing

```matlab
% Convert between linear and subscript indices
[row, col] = ind2sub(size(A), linearIdx);
linearIdx = sub2ind(size(A), row, col);

% Find indices of nonzero/condition
idx = find(A > 5);              % Linear indices where A > 5
idx = find(A > 5, k);           % First k indices
idx = find(A > 5, k, 'last');   % Last k indices
[row, col] = find(A > 5);       % Subscript indices
```

### Advanced Indexing

```matlab
% Index with arrays
rows = [1 3 5];
cols = [2 4];
sub = A(rows, cols);            % Submatrix

% Logical indexing with another array
B = A(logical_mask);            % Elements where mask is true

% Assignment with indexing
A(1:2, 1:2) = [10 20; 30 40];   % Assign submatrix
A(:) = 1:numel(A);              % Assign all elements (column-major)
```

## Array Manipulation

### Element-wise Operations

```matlab
% Arithmetic (element-wise uses . prefix)
C = A + B;                      % Addition
C = A - B;                      % Subtraction
C = A .* B;                     % Element-wise multiplication
C = A ./ B;                     % Element-wise division
C = A .\ B;                     % Element-wise left division (B./A)
C = A .^ n;                     % Element-wise power

% Comparison (element-wise)
C = A == B;                     % Equal
C = A ~= B;                     % Not equal
C = A < B;                      % Less than
C = A <= B;                     % Less than or equal
C = A > B;                      % Greater than
C = A >= B;                     % Greater than or equal
```

### Matrix Operations

```matlab
% Matrix arithmetic
C = A * B;                      % Matrix multiplication
C = A ^ n;                      % Matrix power
C = A';                         % Conjugate transpose
C = A.';                        % Transpose (no conjugate)

% Matrix functions
B = inv(A);                     % Inverse
B = pinv(A);                    % Pseudoinverse
d = det(A);                     % Determinant
t = trace(A);                   % Trace (sum of diagonal)
r = rank(A);                    % Rank
n = norm(A);                    % Matrix/vector norm
n = norm(A, 'fro');             % Frobenius norm

% Solve linear systems
x = A \ b;                      % Solve Ax = b
x = b' / A';                    % Solve xA = b
```

### Common Functions

```matlab
% Apply to each element
B = abs(A);                     % Absolute value
B = sqrt(A);                    % Square root
B = exp(A);                     % Exponential
B = log(A);                     % Natural log
B = log10(A);                   % Log base 10
B = sin(A);                     % Sine (radians)
B = sind(A);                    % Sine (degrees)
B = round(A);                   % Round to nearest integer
B = floor(A);                   % Round down
B = ceil(A);                    % Round up
B = real(A);                    % Real part
B = imag(A);                    % Imaginary part
B = conj(A);                    % Complex conjugate
```

## Concatenation and Reshaping

### Concatenation

```matlab
% Horizontal (side by side)
C = [A B];                      % Concatenate columns
C = [A, B];                     % Same as above
C = horzcat(A, B);              % Function form
C = cat(2, A, B);               % Concatenate along dimension 2

% Vertical (stacked)
C = [A; B];                     % Concatenate rows
C = vertcat(A, B);              % Function form
C = cat(1, A, B);               % Concatenate along dimension 1

% Block diagonal
C = blkdiag(A, B, C);           % Block diagonal matrix
```

### Reshaping

```matlab
% Reshape
B = reshape(A, m, n);           % Reshape to m×n (same total elements)
B = reshape(A, [], n);          % Auto-compute rows
v = A(:);                       % Flatten to column vector

% Transpose and permute
B = A';                         % Transpose 2D
B = permute(A, [2 1 3]);        % Permute dimensions
B = ipermute(A, [2 1 3]);       % Inverse permute

% Remove/add dimensions
B = squeeze(A);                 % Remove singleton dimensions
B = shiftdim(A, n);             % Shift dimensions

% Replication
B = repmat(A, m, n);            % Tile m×n times
B = repelem(A, m, n);           % Repeat elements
```

### Flipping and Rotating

```matlab
B = flip(A);                    % Flip along first non-singleton dimension
B = flip(A, dim);               % Flip along dimension dim
B = fliplr(A);                  % Flip left-right (columns)
B = flipud(A);                  % Flip up-down (rows)
B = rot90(A);                   % Rotate 90° counterclockwise
B = rot90(A, k);                % Rotate k×90°
B = circshift(A, k);            % Circular shift
```

## Array Information

### Size and Dimensions

```matlab
[m, n] = size(A);               % Rows and columns
m = size(A, 1);                 % Number of rows
n = size(A, 2);                 % Number of columns
sz = size(A);                   % Size vector
len = length(A);                % Largest dimension
num = numel(A);                 % Total number of elements
ndim = ndims(A);                % Number of dimensions
```

### Type Checking

```matlab
tf = isempty(A);                % Is empty?
tf = isscalar(A);               % Is scalar (1×1)?
tf = isvector(A);               % Is vector (1×n or n×1)?
tf = isrow(A);                  % Is row vector?
tf = iscolumn(A);               % Is column vector?
tf = ismatrix(A);               % Is 2D matrix?
tf = isnumeric(A);              % Is numeric?
tf = isreal(A);                 % Is real (no imaginary)?
tf = islogical(A);              % Is logical?
tf = isnan(A);                  % Which elements are NaN?
tf = isinf(A);                  % Which elements are Inf?
tf = isfinite(A);               % Which elements are finite?
```

### Comparison

```matlab
tf = isequal(A, B);             % Are arrays equal?
tf = isequaln(A, B);            % Equal, treating NaN as equal?
tf = all(A);                    % All nonzero/true?
tf = any(A);                    % Any nonzero/true?
tf = all(A, dim);               % All along dimension
tf = any(A, dim);               % Any along dimension
```

## Sorting and Searching

### Sorting

```matlab
B = sort(A);                    % Sort columns ascending
B = sort(A, 'descend');         % Sort descending
B = sort(A, dim);               % Sort along dimension
[B, idx] = sort(A);             % Also return original indices
B = sortrows(A);                % Sort rows by first column
B = sortrows(A, col);           % Sort by specific column(s)
B = sortrows(A, col, 'descend');
```

### Unique and Set Operations

```matlab
B = unique(A);                  % Unique elements
[B, ia, ic] = unique(A);        % With index information
B = unique(A, 'rows');          % Unique rows

% Set operations
C = union(A, B);                % Union
C = intersect(A, B);            % Intersection
C = setdiff(A, B);              % A - B (in A but not B)
C = setxor(A, B);               % Symmetric difference
tf = ismember(A, B);            % Is each element of A in B?
```

### Min/Max

```matlab
m = min(A);                     % Column minimums
m = min(A, [], 'all');          % Global minimum
[m, idx] = min(A);              % With indices
m = min(A, B);                  % Element-wise minimum

M = max(A);                     % Column maximums
M = max(A, [], 'all');          % Global maximum
[M, idx] = max(A);              % With indices

[minVal, minIdx] = min(A(:));   % Global min with linear index
[maxVal, maxIdx] = max(A(:));   % Global max with linear index

% k smallest/largest
B = mink(A, k);                 % k smallest elements
B = maxk(A, k);                 % k largest elements
```

### Sum and Product

```matlab
s = sum(A);                     % Column sums
s = sum(A, 'all');              % Total sum
s = sum(A, dim);                % Sum along dimension
s = cumsum(A);                  % Cumulative sum

p = prod(A);                    % Column products
p = prod(A, 'all');             % Total product
p = cumprod(A);                 % Cumulative product
```
