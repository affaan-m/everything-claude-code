# SymPy Code Generation and Printing

This document covers SymPy's capabilities for generating executable code in various languages, converting expressions to different output formats, and customizing printing behavior.

## Code Generation

### Converting to NumPy Functions

```python
from sympy import symbols, sin, cos, lambdify
import numpy as np

x, y = symbols('x y')
expr = sin(x) + cos(y)

# Create NumPy function
f = lambdify((x, y), expr, 'numpy')

# Use with NumPy arrays
x_vals = np.linspace(0, 2*np.pi, 100)
y_vals = np.linspace(0, 2*np.pi, 100)
result = f(x_vals, y_vals)
```

### Lambdify Options

```python
from sympy import lambdify, exp, sqrt

# Different backends
f_numpy = lambdify(x, expr, 'numpy')      # NumPy
f_scipy = lambdify(x, expr, 'scipy')      # SciPy
f_mpmath = lambdify(x, expr, 'mpmath')    # mpmath (arbitrary precision)
f_math = lambdify(x, expr, 'math')        # Python math module

# Custom function mapping
custom_funcs = {'sin': lambda x: x}  # Replace sin with identity
f = lambdify(x, sin(x), modules=[custom_funcs, 'numpy'])

# Multiple expressions
exprs = [x**2, x**3, x**4]
f = lambdify(x, exprs, 'numpy')
# Returns tuple of results
```

### Generating C/C++ Code

```python
from sympy.utilities.codegen import codegen
from sympy import symbols

x, y = symbols('x y')
expr = x**2 + y**2

# Generate C code
[(c_name, c_code), (h_name, h_header)] = codegen(
    ('distance_squared', expr),
    'C',
    header=False,
    empty=False
)

print(c_code)
# Outputs valid C function
```

### Generating Fortran Code

```python
from sympy.utilities.codegen import codegen

[(f_name, f_code), (h_name, h_interface)] = codegen(
    ('my_function', expr),
    'F95',  # Fortran 95
    header=False
)

print(f_code)
```

### Advanced Code Generation

```python
from sympy.utilities.codegen import CCodeGen, make_routine
from sympy import MatrixSymbol, Matrix

# Matrix operations
A = MatrixSymbol('A', 3, 3)
expr = A + A.T

# Create routine
routine = make_routine('matrix_sum', expr)

# Generate code
gen = CCodeGen()
code = gen.write([routine], prefix='my_module')
```

### Code Printers

```python
from sympy.printing.c import C99CodePrinter, C89CodePrinter
from sympy.printing.fortran import FCodePrinter
from sympy.printing.cxx import CXX11CodePrinter

# C code
c_printer = C99CodePrinter()
c_code = c_printer.doprint(expr)

# Fortran code
f_printer = FCodePrinter()
f_code = f_printer.doprint(expr)

# C++ code
cxx_printer = CXX11CodePrinter()
cxx_code = cxx_printer.doprint(expr)
```

## Printing and Output Formats

### Pretty Printing

```python
from sympy import init_printing, pprint, pretty, symbols
from sympy import Integral, sqrt, pi

# Initialize pretty printing (for Jupyter notebooks and terminal)
init_printing()

x = symbols('x')
expr = Integral(sqrt(1/x), (x, 0, pi))

# Pretty print to terminal
pprint(expr)
#   π
#   ⌠
#   ⎮   1
#   ⎮  ───  dx
#   ⎮  √x
#   ⌡
#   0

# Get pretty string
s = pretty(expr)
print(s)
```

### LaTeX Output

```python
from sympy import latex, symbols, Integral, sin, sqrt

x, y = symbols('x y')
expr = Integral(sin(x)**2, (x, 0, pi))

# Convert to LaTeX
latex_str = latex(expr)
print(latex_str)
# \int\limits_{0}^{\pi} \sin^{2}{\left(x \right)}\, dx

# Custom LaTeX formatting
latex_str = latex(expr, mode='equation')  # Wrapped in equation environment
latex_str = latex(expr, mode='inline')    # Inline math

# For matrices
from sympy import Matrix
M = Matrix([[1, 2], [3, 4]])
latex(M)  # \left[\begin{matrix}1 & 2\\3 & 4\end{matrix}\right]
```

### MathML Output

```python
from sympy.printing.mathml import mathml, print_mathml
from sympy import sin, pi

expr = sin(pi/4)

# Content MathML
mathml_str = mathml(expr)

# Presentation MathML
mathml_str = mathml(expr, printer='presentation')

# Print to console
print_mathml(expr)
```

### String Representations

```python
from sympy import symbols, sin, pi, srepr, sstr

x = symbols('x')
expr = sin(x)**2

# Standard string (what you see in Python)
str(expr)  # 'sin(x)**2'

# String representation (prettier)
sstr(expr)  # 'sin(x)**2'

# Reproducible representation
srepr(expr)  # "Pow(sin(Symbol('x')), Integer(2))"
# This can be eval()'ed to recreate the expression
```

### Custom Printing

```python
from sympy.printing.str import StrPrinter

class MyPrinter(StrPrinter):
    def _print_Symbol(self, expr):
        return f"<{expr.name}>"

    def _print_Add(self, expr):
        return " PLUS ".join(self._print(arg) for arg in expr.args)

printer = MyPrinter()
x, y = symbols('x y')
print(printer.doprint(x + y))  # "<x> PLUS <y>"
```

## Python Code Generation

### autowrap - Compile and Import

```python
from sympy.utilities.autowrap import autowrap
from sympy import symbols

x, y = symbols('x y')
expr = x**2 + y**2

# Automatically compile C code and create Python wrapper
f = autowrap(expr, backend='cython')
# or backend='f2py' for Fortran

# Use like a regular function
result = f(3, 4)  # 25
```

### ufuncify - Create NumPy ufuncs

```python
from sympy.utilities.autowrap import ufuncify
import numpy as np

x, y = symbols('x y')
expr = x**2 + y**2

# Create universal function
f = ufuncify((x, y), expr)

# Works with NumPy broadcasting
x_arr = np.array([1, 2, 3])
y_arr = np.array([4, 5, 6])
result = f(x_arr, y_arr)  # [17, 29, 45]
```

## Expression Tree Manipulation

### Walking Expression Trees

```python
from sympy import symbols, sin, cos, preorder_traversal, postorder_traversal

x, y = symbols('x y')
expr = sin(x) + cos(y)

# Preorder traversal (parent before children)
for arg in preorder_traversal(expr):
    print(arg)

# Postorder traversal (children before parent)
for arg in postorder_traversal(expr):
    print(arg)

# Get all subexpressions
subexprs = list(preorder_traversal(expr))
```

### Expression Substitution in Trees

```python
from sympy import Wild, symbols, sin, cos

x, y = symbols('x y')
a = Wild('a')

expr = sin(x) + cos(y)

# Pattern matching and replacement
new_expr = expr.replace(sin(a), a**2)  # sin(x) -> x**2
```

## Jupyter Notebook Integration

### Display Math

```python
from sympy import init_printing, display
from IPython.display import display as ipy_display

# Initialize printing for Jupyter
init_printing(use_latex='mathjax')  # or 'png', 'svg'

# Display expressions beautifully
expr = Integral(sin(x)**2, x)
display(expr)  # Renders as LaTeX in notebook

# Multiple outputs
ipy_display(expr1, expr2, expr3)
```

### Interactive Widgets

```python
from sympy import symbols, sin
from IPython.display import display
from ipywidgets import interact, FloatSlider
import matplotlib.pyplot as plt
import numpy as np

x = symbols('x')
expr = sin(x)

@interact(a=FloatSlider(min=0, max=10, step=0.1, value=1))
def plot_expr(a):
    f = lambdify(x, a * expr, 'numpy')
    x_vals = np.linspace(-np.pi, np.pi, 100)
    plt.plot(x_vals, f(x_vals))
    plt.show()
```

## Converting Between Representations

### String to SymPy

```python
from sympy.parsing.sympy_parser import parse_expr
from sympy import symbols

x, y = symbols('x y')

# Parse string to expression
expr = parse_expr('x**2 + 2*x + 1')
expr = parse_expr('sin(x) + cos(y)')

# With transformations
from sympy.parsing.sympy_parser import (
    standard_transformations,
    implicit_multiplication_application
)

transformations = standard_transformations + (implicit_multiplication_application,)
expr = parse_expr('2x', transformations=transformations)  # Treats '2x' as 2*x
```

### LaTeX to SymPy

```python
from sympy.parsing.latex import parse_latex

# Parse LaTeX
expr = parse_latex(r'\frac{x^2}{y}')
# Returns: x**2/y

expr = parse_latex(r'\int_0^\pi \sin(x) dx')
```

### Mathematica to SymPy

```python
from sympy.parsing.mathematica import parse_mathematica

# Parse Mathematica code
expr = parse_mathematica('Sin[x]^2 + Cos[y]^2')
# Returns SymPy expression
```

## Exporting Results

### Export to File

```python
from sympy import symbols, sin
import json

x = symbols('x')
expr = sin(x)**2

# Export as LaTeX to file
with open('output.tex', 'w') as f:
    f.write(latex(expr))

# Export as string
with open('output.txt', 'w') as f:
    f.write(str(expr))

# Export as Python code
with open('output.py', 'w') as f:
    f.write(f"from numpy import sin\n")
    f.write(f"def f(x):\n")
    f.write(f"    return {lambdify(x, expr, 'numpy')}\n")
```

### Pickle SymPy Objects

```python
import pickle
from sympy import symbols, sin

x = symbols('x')
expr = sin(x)**2 + x

# Save
with open('expr.pkl', 'wb') as f:
    pickle.dump(expr, f)

# Load
with open('expr.pkl', 'rb') as f:
    loaded_expr = pickle.load(f)
```

## Numerical Evaluation and Precision

### High-Precision Evaluation

```python
from sympy import symbols, pi, sqrt, E, exp, sin
from mpmath import mp

x = symbols('x')

# Standard precision
pi.evalf()  # 3.14159265358979

# High precision (1000 digits)
pi.evalf(1000)

# Set global precision with mpmath
mp.dps = 50  # 50 decimal places
expr = exp(pi * sqrt(163))
float(expr.evalf())

# For expressions
result = (sqrt(2) + sqrt(3)).evalf(100)
```

### Numerical Substitution

```python
from sympy import symbols, sin, cos

x, y = symbols('x y')
expr = sin(x) + cos(y)

# Numerical evaluation
result = expr.evalf(subs={x: 1.5, y: 2.3})

# With units
from sympy.physics.units import meter, second
distance = 100 * meter
time = 10 * second
speed = distance / time
speed.evalf()
```

## Common Patterns

### Pattern 1: Generate and Execute Code

```python
from sympy import symbols, lambdify
import numpy as np

# 1. Define symbolic expression
x, y = symbols('x y')
expr = x**2 + y**2

# 2. Generate function
f = lambdify((x, y), expr, 'numpy')

# 3. Execute with numerical data
data_x = np.random.rand(1000)
data_y = np.random.rand(1000)
results = f(data_x, data_y)
```

### Pattern 2: Create LaTeX Documentation

```python
from sympy import symbols, Integral, latex
from sympy.abc import x

# Define mathematical content
expr = Integral(x**2, (x, 0, 1))
result = expr.doit()

# Generate LaTeX document
latex_doc = f"""
\\documentclass{{article}}
\\usepackage{{amsmath}}
\\begin{{document}}

We compute the integral:
\\begin{{equation}}
{latex(expr)} = {latex(result)}
\\end{{equation}}

\\end{{document}}
"""

with open('document.tex', 'w') as f:
    f.write(latex_doc)
```

### Pattern 3: Interactive Computation

```python
from sympy import symbols, simplify, expand
from sympy.parsing.sympy_parser import parse_expr

x, y = symbols('x y')

# Interactive input
user_input = input("Enter expression: ")
expr = parse_expr(user_input)

# Process
simplified = simplify(expr)
expanded = expand(expr)

# Display
print(f"Simplified: {simplified}")
print(f"Expanded: {expanded}")
print(f"LaTeX: {latex(expr)}")
```

### Pattern 4: Batch Code Generation

```python
from sympy import symbols, lambdify
from sympy.utilities.codegen import codegen

# Multiple functions
x = symbols('x')
functions = {
    'f1': x**2,
    'f2': x**3,
    'f3': x**4
}

# Generate C code for all
for name, expr in functions.items():
    [(c_name, c_code), _] = codegen((name, expr), 'C')
    with open(f'{name}.c', 'w') as f:
        f.write(c_code)
```

### Pattern 5: Performance Optimization

```python
from sympy import symbols, sin, cos, cse
import numpy as np

x, y = symbols('x y')

# Complex expression with repeated subexpressions
expr = sin(x + y)**2 + cos(x + y)**2 + sin(x + y)

# Common subexpression elimination
replacements, reduced = cse(expr)
# replacements: [(x0, sin(x + y)), (x1, cos(x + y))]
# reduced: [x0**2 + x1**2 + x0]

# Generate optimized code
for var, subexpr in replacements:
    print(f"{var} = {subexpr}")
print(f"result = {reduced[0]}")
```

## Important Notes

1. **NumPy compatibility:** When using `lambdify` with NumPy, ensure your expression uses functions available in NumPy.

2. **Performance:** For numerical work, always use `lambdify` or code generation rather than `subs()` + `evalf()` in loops.

3. **Precision:** Use `mpmath` for arbitrary precision arithmetic when needed.

4. **Code generation caveats:** Generated code may not handle all edge cases. Test thoroughly.

5. **Compilation:** `autowrap` and `ufuncify` require a C/Fortran compiler and may need configuration on your system.

6. **Parsing:** When parsing user input, validate and sanitize to avoid code injection vulnerabilities.

7. **Jupyter:** For best results in Jupyter notebooks, call `init_printing()` at the start of your session.
