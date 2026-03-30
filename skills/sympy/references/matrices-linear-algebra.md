# SymPy Matrices and Linear Algebra

This document covers SymPy's matrix operations, linear algebra capabilities, and solving systems of linear equations.

## Matrix Creation

### Basic Matrix Construction

```python
from sympy import Matrix, eye, zeros, ones, diag

# From list of rows
M = Matrix([[1, 2], [3, 4]])
M = Matrix([
    [1, 2, 3],
    [4, 5, 6]
])

# Column vector
v = Matrix([1, 2, 3])

# Row vector
v = Matrix([[1, 2, 3]])
```

### Special Matrices

```python
# Identity matrix
I = eye(3)  # 3x3 identity
# [[1, 0, 0],
#  [0, 1, 0],
#  [0, 0, 1]]

# Zero matrix
Z = zeros(2, 3)  # 2 rows, 3 columns of zeros

# Ones matrix
O = ones(3, 2)   # 3 rows, 2 columns of ones

# Diagonal matrix
D = diag(1, 2, 3)
# [[1, 0, 0],
#  [0, 2, 0],
#  [0, 0, 3]]

# Block diagonal
from sympy import BlockDiagMatrix
A = Matrix([[1, 2], [3, 4]])
B = Matrix([[5, 6], [7, 8]])
BD = BlockDiagMatrix(A, B)
```

## Matrix Properties and Access

### Shape and Dimensions

```python
M = Matrix([[1, 2, 3], [4, 5, 6]])

M.shape  # (2, 3) - returns tuple (rows, cols)
M.rows   # 2
M.cols   # 3
```

### Accessing Elements

```python
M = Matrix([[1, 2, 3], [4, 5, 6]])

# Single element
M[0, 0]  # 1 (zero-indexed)
M[1, 2]  # 6

# Row access
M[0, :]   # Matrix([[1, 2, 3]])
M.row(0)  # Same as above

# Column access
M[:, 1]   # Matrix([[2], [5]])
M.col(1)  # Same as above

# Slicing
M[0:2, 0:2]  # Top-left 2x2 submatrix
```

### Modification

```python
M = Matrix([[1, 2], [3, 4]])

# Insert row
M = M.row_insert(1, Matrix([[5, 6]]))
# [[1, 2],
#  [5, 6],
#  [3, 4]]

# Insert column
M = M.col_insert(1, Matrix([7, 8]))

# Delete row
M = M.row_del(0)

# Delete column
M = M.col_del(1)
```

## Basic Matrix Operations

### Arithmetic Operations

```python
from sympy import Matrix

A = Matrix([[1, 2], [3, 4]])
B = Matrix([[5, 6], [7, 8]])

# Addition
C = A + B

# Subtraction
C = A - B

# Scalar multiplication
C = 2 * A

# Matrix multiplication
C = A * B

# Element-wise multiplication (Hadamard product)
C = A.multiply_elementwise(B)

# Power
C = A**2  # Same as A * A
C = A**3  # A * A * A
```

### Transpose and Conjugate

```python
M = Matrix([[1, 2], [3, 4]])

# Transpose
M.T
# [[1, 3],
#  [2, 4]]

# Conjugate (for complex matrices)
M.conjugate()

# Conjugate transpose (Hermitian transpose)
M.H  # Same as M.conjugate().T
```

### Inverse

```python
M = Matrix([[1, 2], [3, 4]])

# Inverse
M_inv = M**-1
M_inv = M.inv()

# Verify
M * M_inv  # Returns identity matrix

# Check if invertible
M.is_invertible()  # True or False
```

## Advanced Linear Algebra

### Determinant

```python
M = Matrix([[1, 2], [3, 4]])
M.det()  # -2

# For symbolic matrices
from sympy import symbols
a, b, c, d = symbols('a b c d')
M = Matrix([[a, b], [c, d]])
M.det()  # a*d - b*c
```

### Trace

```python
M = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
M.trace()  # 1 + 5 + 9 = 15
```

### Row Echelon Form

```python
M = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# Reduced Row Echelon Form
rref_M, pivot_cols = M.rref()
# rref_M is the RREF matrix
# pivot_cols is tuple of pivot column indices
```

### Rank

```python
M = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
M.rank()  # 2 (this matrix is rank-deficient)
```

### Nullspace and Column Space

```python
M = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# Nullspace (kernel)
null = M.nullspace()
# Returns list of basis vectors for nullspace

# Column space
col = M.columnspace()
# Returns list of basis vectors for column space

# Row space
row = M.rowspace()
# Returns list of basis vectors for row space
```

### Orthogonalization

```python
# Gram-Schmidt orthogonalization
vectors = [Matrix([1, 2, 3]), Matrix([4, 5, 6])]
ortho = Matrix.orthogonalize(*vectors)

# With normalization
ortho_norm = Matrix.orthogonalize(*vectors, normalize=True)
```

## Eigenvalues and Eigenvectors

### Computing Eigenvalues

```python
M = Matrix([[1, 2], [2, 1]])

# Eigenvalues with multiplicities
eigenvals = M.eigenvals()
# Returns dict: {eigenvalue: multiplicity}
# Example: {3: 1, -1: 1}

# Just the eigenvalues as a list
eigs = list(M.eigenvals().keys())
```

### Computing Eigenvectors

```python
M = Matrix([[1, 2], [2, 1]])

# Eigenvectors with eigenvalues
eigenvects = M.eigenvects()
# Returns list of tuples: (eigenvalue, multiplicity, [eigenvectors])
# Example: [(3, 1, [Matrix([1, 1])]), (-1, 1, [Matrix([1, -1])])]

# Access individual eigenvectors
for eigenval, multiplicity, eigenvecs in M.eigenvects():
    print(f"Eigenvalue: {eigenval}")
    print(f"Eigenvectors: {eigenvecs}")
```

### Diagonalization

```python
M = Matrix([[1, 2], [2, 1]])

# Check if diagonalizable
M.is_diagonalizable()  # True or False

# Diagonalize (M = P*D*P^-1)
P, D = M.diagonalize()
# P: matrix of eigenvectors
# D: diagonal matrix of eigenvalues

# Verify
P * D * P**-1 == M  # True
```

### Characteristic Polynomial

```python
from sympy import symbols
lam = symbols('lambda')

M = Matrix([[1, 2], [2, 1]])
charpoly = M.charpoly(lam)
# Returns characteristic polynomial
```

### Jordan Normal Form

```python
M = Matrix([[2, 1, 0], [0, 2, 1], [0, 0, 2]])

# Jordan form (for non-diagonalizable matrices)
P, J = M.jordan_form()
# J is the Jordan normal form
# P is the transformation matrix
```

## Matrix Decompositions

### LU Decomposition

```python
M = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 10]])

# LU decomposition
L, U, perm = M.LUdecomposition()
# L: lower triangular
# U: upper triangular
# perm: permutation indices
```

### QR Decomposition

```python
M = Matrix([[1, 2], [3, 4], [5, 6]])

# QR decomposition
Q, R = M.QRdecomposition()
# Q: orthogonal matrix
# R: upper triangular matrix
```

### Cholesky Decomposition

```python
# For positive definite symmetric matrices
M = Matrix([[4, 2], [2, 3]])

L = M.cholesky()
# L is lower triangular such that M = L*L.T
```

### Singular Value Decomposition (SVD)

```python
M = Matrix([[1, 2], [3, 4], [5, 6]])

# SVD (note: may require numerical evaluation)
U, S, V = M.singular_value_decomposition()
# M = U * S * V
```

## Solving Linear Systems

### Using Matrix Equations

```python
# Solve Ax = b
A = Matrix([[1, 2], [3, 4]])
b = Matrix([5, 6])

# Solution
x = A.solve(b)  # or A**-1 * b

# Least squares (for overdetermined systems)
x = A.solve_least_squares(b)
```

### Using linsolve

```python
from sympy import linsolve, symbols

x, y = symbols('x y')

# Method 1: List of equations
eqs = [x + y - 5, 2*x - y - 1]
sol = linsolve(eqs, [x, y])
# {(2, 3)}

# Method 2: Augmented matrix
M = Matrix([[1, 1, 5], [2, -1, 1]])
sol = linsolve(M, [x, y])

# Method 3: A*x = b form
A = Matrix([[1, 1], [2, -1]])
b = Matrix([5, 1])
sol = linsolve((A, b), [x, y])
```

### Underdetermined and Overdetermined Systems

```python
# Underdetermined (infinite solutions)
A = Matrix([[1, 2, 3]])
b = Matrix([6])
sol = A.solve(b)  # Returns parametric solution

# Overdetermined (least squares)
A = Matrix([[1, 2], [3, 4], [5, 6]])
b = Matrix([1, 2, 3])
sol = A.solve_least_squares(b)
```

## Symbolic Matrices

### Working with Symbolic Entries

```python
from sympy import symbols, Matrix

a, b, c, d = symbols('a b c d')
M = Matrix([[a, b], [c, d]])

# All operations work symbolically
M.det()  # a*d - b*c
M.inv()  # Matrix([[d/(a*d - b*c), -b/(a*d - b*c)], ...])
M.eigenvals()  # Symbolic eigenvalues
```

### Matrix Functions

```python
from sympy import exp, sin, cos, Matrix

M = Matrix([[0, 1], [-1, 0]])

# Matrix exponential
exp(M)

# Trigonometric functions
sin(M)
cos(M)
```

## Mutable vs Immutable Matrices

```python
from sympy import Matrix, ImmutableMatrix

# Mutable (default)
M = Matrix([[1, 2], [3, 4]])
M[0, 0] = 5  # Allowed

# Immutable (for use as dictionary keys, etc.)
I = ImmutableMatrix([[1, 2], [3, 4]])
# I[0, 0] = 5  # Error: ImmutableMatrix cannot be modified
```

## Sparse Matrices

For large matrices with many zero entries:

```python
from sympy import SparseMatrix

# Create sparse matrix
S = SparseMatrix(1000, 1000, {(0, 0): 1, (100, 100): 2})
# Only stores non-zero elements

# Convert dense to sparse
M = Matrix([[1, 0, 0], [0, 2, 0]])
S = SparseMatrix(M)
```

## Common Linear Algebra Patterns

### Pattern 1: Solving Ax = b for Multiple b Vectors

```python
A = Matrix([[1, 2], [3, 4]])
A_inv = A.inv()

b1 = Matrix([5, 6])
b2 = Matrix([7, 8])

x1 = A_inv * b1
x2 = A_inv * b2
```

### Pattern 2: Change of Basis

```python
# Given vectors in old basis, convert to new basis
old_basis = [Matrix([1, 0]), Matrix([0, 1])]
new_basis = [Matrix([1, 1]), Matrix([1, -1])]

# Change of basis matrix
P = Matrix.hstack(*new_basis)
P_inv = P.inv()

# Convert vector v from old to new basis
v = Matrix([3, 4])
v_new = P_inv * v
```

### Pattern 3: Matrix Condition Number

```python
# Estimate condition number (ratio of largest to smallest singular value)
M = Matrix([[1, 2], [3, 4]])
eigenvals = M.eigenvals()
cond = max(eigenvals.keys()) / min(eigenvals.keys())
```

### Pattern 4: Projection Matrices

```python
# Project onto column space of A
A = Matrix([[1, 0], [0, 1], [1, 1]])
P = A * (A.T * A).inv() * A.T
# P is projection matrix onto column space of A
```

## Important Notes

1. **Zero-testing:** SymPy's symbolic zero-testing can affect accuracy. For numerical work, consider using `evalf()` or numerical libraries.

2. **Performance:** For large numerical matrices, consider converting to NumPy using `lambdify` or using numerical linear algebra libraries directly.

3. **Symbolic computation:** Matrix operations with symbolic entries can be computationally expensive for large matrices.

4. **Assumptions:** Use symbol assumptions (e.g., `real=True`, `positive=True`) to help SymPy simplify matrix expressions correctly.
