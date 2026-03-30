# SymPy Core Capabilities

This document covers SymPy's fundamental operations: symbolic computation basics, algebra, calculus, simplification, and equation solving.

## Creating Symbols and Basic Operations

### Symbol Creation

**Single symbols:**
```python
from sympy import symbols, Symbol
x = Symbol('x')
# or more commonly:
x, y, z = symbols('x y z')
```

**With assumptions:**
```python
x = symbols('x', real=True, positive=True)
n = symbols('n', integer=True)
```

Common assumptions: `real`, `positive`, `negative`, `integer`, `rational`, `prime`, `even`, `odd`, `complex`

### Basic Arithmetic

SymPy supports standard Python operators for symbolic expressions:
- Addition: `x + y`
- Subtraction: `x - y`
- Multiplication: `x * y`
- Division: `x / y`
- Exponentiation: `x**y`

**Important gotcha:** Use `sympy.Rational()` or `S()` for exact rational numbers:
```python
from sympy import Rational, S
expr = Rational(1, 2) * x  # Correct: exact 1/2
expr = S(1)/2 * x          # Correct: exact 1/2
expr = 0.5 * x             # Creates floating-point approximation
```

### Substitution and Evaluation

**Substitute values:**
```python
expr = x**2 + 2*x + 1
expr.subs(x, 3)  # Returns 16
expr.subs({x: 2, y: 3})  # Multiple substitutions
```

**Numerical evaluation:**
```python
from sympy import pi, sqrt
expr = sqrt(8)
expr.evalf()      # 2.82842712474619
expr.evalf(20)    # 2.8284271247461900976 (20 digits)
pi.evalf(100)     # 100 digits of pi
```

## Simplification

SymPy provides multiple simplification functions, each with different strategies:

### General Simplification

```python
from sympy import simplify, expand, factor, collect, cancel, trigsimp

# General simplification (tries multiple methods)
simplify(sin(x)**2 + cos(x)**2)  # Returns 1

# Expand products and powers
expand((x + 1)**3)  # x**3 + 3*x**2 + 3*x + 1

# Factor polynomials
factor(x**3 - x**2 + x - 1)  # (x - 1)*(x**2 + 1)

# Collect terms by variable
collect(x*y + x - 3 + 2*x**2 - z*x**2 + x**3, x)

# Cancel common factors in rational expressions
cancel((x**2 + 2*x + 1)/(x**2 + x))  # (x + 1)/x
```

### Trigonometric Simplification

```python
from sympy import sin, cos, tan, trigsimp, expand_trig

# Simplify trig expressions
trigsimp(sin(x)**2 + cos(x)**2)  # 1
trigsimp(sin(x)/cos(x))          # tan(x)

# Expand trig functions
expand_trig(sin(x + y))  # sin(x)*cos(y) + sin(y)*cos(x)
```

### Power and Logarithm Simplification

```python
from sympy import powsimp, powdenest, log, expand_log, logcombine

# Simplify powers
powsimp(x**a * x**b)  # x**(a + b)

# Expand logarithms
expand_log(log(x*y))  # log(x) + log(y)

# Combine logarithms
logcombine(log(x) + log(y))  # log(x*y)
```

## Calculus

### Derivatives

```python
from sympy import diff, Derivative

# First derivative
diff(x**2, x)  # 2*x

# Higher derivatives
diff(x**4, x, x, x)  # 24*x (third derivative)
diff(x**4, x, 3)     # 24*x (same as above)

# Partial derivatives
diff(x**2*y**3, x, y)  # 6*x*y**2

# Unevaluated derivative (for display)
d = Derivative(x**2, x)
d.doit()  # Evaluates to 2*x
```

### Integrals

**Indefinite integrals:**
```python
from sympy import integrate

integrate(x**2, x)           # x**3/3
integrate(exp(x)*sin(x), x)  # exp(x)*sin(x)/2 - exp(x)*cos(x)/2
integrate(1/x, x)            # log(x)
```

**Note:** SymPy does not include the constant of integration. Add `+ C` manually if needed.

**Definite integrals:**
```python
from sympy import oo, pi, exp, sin

integrate(x**2, (x, 0, 1))    # 1/3
integrate(exp(-x), (x, 0, oo)) # 1
integrate(sin(x), (x, 0, pi))  # 2
```

**Multiple integrals:**
```python
integrate(x*y, (x, 0, 1), (y, 0, x))  # 1/12
```

**Numerical integration (when symbolic fails):**
```python
integrate(x**x, (x, 0, 1)).evalf()  # 0.783430510712134
```

### Limits

```python
from sympy import limit, oo, sin

# Basic limits
limit(sin(x)/x, x, 0)  # 1
limit(1/x, x, oo)      # 0

# One-sided limits
limit(1/x, x, 0, '+')  # oo
limit(1/x, x, 0, '-')  # -oo

# Use limit() for singularities (not subs())
limit((x**2 - 1)/(x - 1), x, 1)  # 2
```

**Important:** Use `limit()` instead of `subs()` at singularities because infinity objects don't reliably track growth rates.

### Series Expansion

```python
from sympy import series, sin, exp, cos

# Taylor series expansion
expr = sin(x)
expr.series(x, 0, 6)  # x - x**3/6 + x**5/120 + O(x**6)

# Expansion around a point
exp(x).series(x, 1, 4)  # Expands around x=1

# Remove O() term
series(exp(x), x, 0, 4).removeO()  # 1 + x + x**2/2 + x**3/6
```

### Finite Differences (Numerical Derivatives)

```python
from sympy import Function, differentiate_finite
f = Function('f')

# Approximate derivative using finite differences
differentiate_finite(f(x), x)
f(x).as_finite_difference()
```

## Equation Solving

### Algebraic Equations - solveset

**Primary function:** `solveset(equation, variable, domain)`

```python
from sympy import solveset, Eq, S

# Basic solving (assumes equation = 0)
solveset(x**2 - 1, x)  # {-1, 1}
solveset(x**2 + 1, x)  # {-I, I} (complex solutions)

# Using explicit equation
solveset(Eq(x**2, 4), x)  # {-2, 2}

# Specify domain
solveset(x**2 - 1, x, domain=S.Reals)  # {-1, 1}
solveset(x**2 + 1, x, domain=S.Reals)  # EmptySet (no real solutions)
```

**Return types:** Finite sets, intervals, or image sets

### Systems of Equations

**Linear systems - linsolve:**
```python
from sympy import linsolve, Matrix

# From equations
linsolve([x + y - 2, x - y], x, y)  # {(1, 1)}

# From augmented matrix
linsolve(Matrix([[1, 1, 2], [1, -1, 0]]), x, y)

# From A*x = b form
A = Matrix([[1, 1], [1, -1]])
b = Matrix([2, 0])
linsolve((A, b), x, y)
```

**Nonlinear systems - nonlinsolve:**
```python
from sympy import nonlinsolve

nonlinsolve([x**2 + y - 2, x + y**2 - 3], x, y)
```

**Note:** Currently nonlinsolve doesn't return solutions in form of LambertW.

### Polynomial Roots

```python
from sympy import roots, solve

# Get roots with multiplicities
roots(x**3 - 6*x**2 + 9*x, x)  # {0: 1, 3: 2}
# Means x=0 (multiplicity 1), x=3 (multiplicity 2)
```

### General Solver - solve

More flexible alternative for transcendental equations:
```python
from sympy import solve, exp, log

solve(exp(x) - 3, x)     # [log(3)]
solve(x**2 - 4, x)       # [-2, 2]
solve([x + y - 1, x - y + 1], [x, y])  # {x: 0, y: 1}
```

### Differential Equations - dsolve

```python
from sympy import Function, dsolve, Derivative, Eq

# Define function
f = symbols('f', cls=Function)

# Solve ODE
dsolve(Derivative(f(x), x) - f(x), f(x))
# Returns: Eq(f(x), C1*exp(x))

# With initial conditions
dsolve(Derivative(f(x), x) - f(x), f(x), ics={f(0): 1})
# Returns: Eq(f(x), exp(x))

# Second-order ODE
dsolve(Derivative(f(x), x, 2) + f(x), f(x))
# Returns: Eq(f(x), C1*sin(x) + C2*cos(x))
```

## Common Patterns and Best Practices

### Pattern 1: Building Complex Expressions Incrementally
```python
from sympy import *
x, y = symbols('x y')

# Build step by step
expr = x**2
expr = expr + 2*x + 1
expr = simplify(expr)
```

### Pattern 2: Working with Assumptions
```python
# Define symbols with physical constraints
x = symbols('x', positive=True, real=True)
y = symbols('y', real=True)

# SymPy can use these for simplification
sqrt(x**2)  # Returns x (not Abs(x)) due to positive assumption
```

### Pattern 3: Converting to Numerical Functions
```python
from sympy import lambdify
import numpy as np

expr = x**2 + 2*x + 1
f = lambdify(x, expr, 'numpy')

# Now can use with numpy arrays
x_vals = np.linspace(0, 10, 100)
y_vals = f(x_vals)
```

### Pattern 4: Pretty Printing
```python
from sympy import init_printing, pprint
init_printing()  # Enable pretty printing in terminal/notebook

expr = Integral(sqrt(1/x), x)
pprint(expr)  # Displays nicely formatted output
```
