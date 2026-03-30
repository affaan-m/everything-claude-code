# Mathematics Reference

## Table of Contents
1. [Linear Algebra](#linear-algebra)
2. [Elementary Math](#elementary-math)
3. [Calculus and Integration](#calculus-and-integration)
4. [Differential Equations](#differential-equations)
5. [Optimization](#optimization)
6. [Statistics](#statistics)
7. [Signal Processing](#signal-processing)
8. [Interpolation and Fitting](#interpolation-and-fitting)

## Linear Algebra

### Solving Linear Systems

```matlab
% Ax = b
x = A \ b;                      % Preferred method (mldivide)
x = linsolve(A, b);             % With options
x = inv(A) * b;                 % Less efficient, avoid

% Options for linsolve
opts.LT = true;                 % Lower triangular
opts.UT = true;                 % Upper triangular
opts.SYM = true;                % Symmetric
opts.POSDEF = true;             % Positive definite
x = linsolve(A, b, opts);

% xA = b
x = b / A;                      % mrdivide

% Least squares (overdetermined system)
x = A \ b;                      % Minimum norm solution
x = lsqminnorm(A, b);           % Explicit minimum norm

% Nonnegative least squares
x = lsqnonneg(A, b);            % x >= 0 constraint
```

### Matrix Decompositions

```matlab
% LU decomposition: A = L*U or P*A = L*U
[L, U] = lu(A);                 % L may not be lower triangular
[L, U, P] = lu(A);              % P*A = L*U

% QR decomposition: A = Q*R
[Q, R] = qr(A);                 % Full decomposition
[Q, R] = qr(A, 0);              % Economy size
[Q, R, P] = qr(A);              % Column pivoting: A*P = Q*R

% Cholesky: A = R'*R (symmetric positive definite)
R = chol(A);                    % Upper triangular
L = chol(A, 'lower');           % Lower triangular

% LDL': A = L*D*L' (symmetric)
[L, D] = ldl(A);

% Schur decomposition: A = U*T*U'
[U, T] = schur(A);              % T is quasi-triangular
[U, T] = schur(A, 'complex');   % T is triangular
```

### Eigenvalues and Eigenvectors

```matlab
% Eigenvalues
e = eig(A);                     % Eigenvalues only
[V, D] = eig(A);                % V: eigenvectors, D: diagonal eigenvalues
                                % A*V = V*D

% Generalized eigenvalues: A*v = lambda*B*v
e = eig(A, B);
[V, D] = eig(A, B);

% Sparse/large matrices (subset of eigenvalues)
e = eigs(A, k);                 % k largest magnitude
e = eigs(A, k, 'smallestabs');  % k smallest magnitude
[V, D] = eigs(A, k, 'largestreal');
```

### Singular Value Decomposition

```matlab
% SVD: A = U*S*V'
[U, S, V] = svd(A);             % Full decomposition
[U, S, V] = svd(A, 'econ');     % Economy size
s = svd(A);                     % Singular values only

% Sparse/large matrices
[U, S, V] = svds(A, k);         % k largest singular values

% Applications
r = rank(A);                    % Rank (count nonzero singular values)
p = pinv(A);                    % Pseudoinverse (via SVD)
n = norm(A, 2);                 % 2-norm = largest singular value
c = cond(A);                    % Condition number = ratio of largest/smallest
```

### Matrix Properties

```matlab
d = det(A);                     % Determinant
t = trace(A);                   % Trace (sum of diagonal)
r = rank(A);                    % Rank
n = norm(A);                    % 2-norm (default)
n = norm(A, 1);                 % 1-norm (max column sum)
n = norm(A, inf);               % Inf-norm (max row sum)
n = norm(A, 'fro');             % Frobenius norm
c = cond(A);                    % Condition number
c = rcond(A);                   % Reciprocal condition (fast estimate)
```

## Elementary Math

### Trigonometric Functions

```matlab
% Radians
y = sin(x);   y = cos(x);   y = tan(x);
y = asin(x);  y = acos(x);  y = atan(x);
y = atan2(y, x);            % Four-quadrant arctangent

% Degrees
y = sind(x);  y = cosd(x);  y = tand(x);
y = asind(x); y = acosd(x); y = atand(x);

% Hyperbolic
y = sinh(x);  y = cosh(x);  y = tanh(x);
y = asinh(x); y = acosh(x); y = atanh(x);

% Secant, cosecant, cotangent
y = sec(x);   y = csc(x);   y = cot(x);
```

### Exponentials and Logarithms

```matlab
y = exp(x);                     % e^x
y = log(x);                     % Natural log (ln)
y = log10(x);                   % Log base 10
y = log2(x);                    % Log base 2
y = log1p(x);                   % log(1+x), accurate for small x
[F, E] = log2(x);               % F * 2^E = x

y = sqrt(x);                    % Square root
y = nthroot(x, n);              % Real n-th root
y = realsqrt(x);                % Real square root (error if x < 0)

y = pow2(x);                    % 2^x
y = x .^ y;                     % Element-wise power
```

### Complex Numbers

```matlab
z = complex(a, b);              % a + bi
z = 3 + 4i;                     % Direct creation

r = real(z);                    % Real part
i = imag(z);                    % Imaginary part
m = abs(z);                     % Magnitude
p = angle(z);                   % Phase angle (radians)
c = conj(z);                    % Complex conjugate

[theta, rho] = cart2pol(x, y);  % Cartesian to polar
[x, y] = pol2cart(theta, rho);  % Polar to Cartesian
```

### Rounding and Remainders

```matlab
y = round(x);                   % Round to nearest integer
y = round(x, n);                % Round to n decimal places
y = floor(x);                   % Round toward -infinity
y = ceil(x);                    % Round toward +infinity
y = fix(x);                     % Round toward zero

y = mod(x, m);                  % Modulo (sign of m)
y = rem(x, m);                  % Remainder (sign of x)
[q, r] = deconv(x, m);          % Quotient and remainder

y = sign(x);                    % Sign (-1, 0, or 1)
y = abs(x);                     % Absolute value
```

### Special Functions

```matlab
y = gamma(x);                   % Gamma function
y = gammaln(x);                 % Log gamma (avoid overflow)
y = factorial(n);               % n!
y = nchoosek(n, k);             % Binomial coefficient

y = erf(x);                     % Error function
y = erfc(x);                    % Complementary error function
y = erfcinv(x);                 % Inverse complementary error function

y = besselj(nu, x);             % Bessel J
y = bessely(nu, x);             % Bessel Y
y = besseli(nu, x);             % Modified Bessel I
y = besselk(nu, x);             % Modified Bessel K

y = legendre(n, x);             % Legendre polynomials
```

## Calculus and Integration

### Numerical Integration

```matlab
% Definite integrals
q = integral(fun, a, b);        % Integrate fun from a to b
q = integral(@(x) x.^2, 0, 1);  % Example: integral of x^2

% Options
q = integral(fun, a, b, 'AbsTol', 1e-10);
q = integral(fun, a, b, 'RelTol', 1e-6);

% Improper integrals
q = integral(fun, 0, Inf);      % Integrate to infinity
q = integral(fun, -Inf, Inf);   % Full real line

% Multidimensional
q = integral2(fun, xa, xb, ya, yb);  % Double integral
q = integral3(fun, xa, xb, ya, yb, za, zb);  % Triple integral

% From discrete data
q = trapz(x, y);                % Trapezoidal rule
q = trapz(y);                   % Unit spacing
q = cumtrapz(x, y);             % Cumulative integral
```

### Numerical Differentiation

```matlab
% Finite differences
dy = diff(y);                   % First differences
dy = diff(y, n);                % n-th differences
dy = diff(y, n, dim);           % Along dimension

% Gradient (numerical derivative)
g = gradient(y);                % dy/dx, unit spacing
g = gradient(y, h);             % dy/dx, spacing h
[gx, gy] = gradient(Z, hx, hy); % Gradient of 2D data
```

## Differential Equations

### ODE Solvers

```matlab
% Standard form: dy/dt = f(t, y)
odefun = @(t, y) -2*y;          % Example: dy/dt = -2y
[t, y] = ode45(odefun, tspan, y0);

% Solver selection:
% ode45  - Nonstiff, medium accuracy (default choice)
% ode23  - Nonstiff, low accuracy
% ode113 - Nonstiff, variable order
% ode15s - Stiff, variable order (try if ode45 is slow)
% ode23s - Stiff, low order
% ode23t - Moderately stiff, trapezoidal
% ode23tb - Stiff, TR-BDF2

% With options
options = odeset('RelTol', 1e-6, 'AbsTol', 1e-9);
options = odeset('MaxStep', 0.1);
options = odeset('Events', @myEventFcn);  % Stop conditions
[t, y] = ode45(odefun, tspan, y0, options);
```

### Higher-Order ODEs

```matlab
% y'' + 2y' + y = 0, y(0) = 1, y'(0) = 0
% Convert to system: y1 = y, y2 = y'
% y1' = y2
% y2' = -2*y2 - y1

odefun = @(t, y) [y(2); -2*y(2) - y(1)];
y0 = [1; 0];                    % [y(0); y'(0)]
[t, y] = ode45(odefun, [0 10], y0);
plot(t, y(:,1));                % Plot y (first component)
```

### Boundary Value Problems

```matlab
% y'' + |y| = 0, y(0) = 0, y(4) = -2
solinit = bvpinit(linspace(0, 4, 5), [0; 0]);
sol = bvp4c(@odefun, @bcfun, solinit);

function dydx = odefun(x, y)
    dydx = [y(2); -abs(y(1))];
end

function res = bcfun(ya, yb)
    res = [ya(1); yb(1) + 2];   % y(0) = 0, y(4) = -2
end
```

## Optimization

### Unconstrained Optimization

```matlab
% Single variable, bounded
[x, fval] = fminbnd(fun, x1, x2);
[x, fval] = fminbnd(@(x) x.^2 - 4*x, 0, 5);

% Multivariable, unconstrained
[x, fval] = fminsearch(fun, x0);
options = optimset('TolX', 1e-8, 'TolFun', 1e-8);
[x, fval] = fminsearch(fun, x0, options);

% Display iterations
options = optimset('Display', 'iter');
```

### Root Finding

```matlab
% Find where f(x) = 0
x = fzero(fun, x0);             % Near x0
x = fzero(fun, [x1 x2]);        % In interval [x1, x2]
x = fzero(@(x) cos(x) - x, 0.5);

% Polynomial roots
r = roots([1 0 -4]);            % Roots of x^2 - 4 = 0
                                % Returns [2; -2]
```

### Least Squares

```matlab
% Linear least squares: minimize ||Ax - b||
x = A \ b;                      % Standard solution
x = lsqminnorm(A, b);           % Minimum norm solution

% Nonnegative least squares
x = lsqnonneg(A, b);            % x >= 0

% Nonlinear least squares
x = lsqnonlin(fun, x0);         % Minimize sum(fun(x).^2)
x = lsqcurvefit(fun, x0, xdata, ydata);  % Curve fitting
```

## Statistics

### Descriptive Statistics

```matlab
% Central tendency
m = mean(x);                    % Arithmetic mean
m = mean(x, 'all');             % Mean of all elements
m = mean(x, dim);               % Mean along dimension
m = mean(x, 'omitnan');         % Ignore NaN values
gm = geomean(x);                % Geometric mean
hm = harmmean(x);               % Harmonic mean
med = median(x);                % Median
mo = mode(x);                   % Mode

% Dispersion
s = std(x);                     % Standard deviation (N-1)
s = std(x, 1);                  % Population std (N)
v = var(x);                     % Variance
r = range(x);                   % max - min
iqr_val = iqr(x);               % Interquartile range

% Extremes
[minv, mini] = min(x);
[maxv, maxi] = max(x);
[lo, hi] = bounds(x);           % Min and max together
```

### Correlation and Covariance

```matlab
% Correlation
R = corrcoef(X, Y);             % Correlation matrix
r = corrcoef(x, y);             % Correlation coefficient

% Covariance
C = cov(X, Y);                  % Covariance matrix
c = cov(x, y);                  % Covariance

% Cross-correlation (signal processing)
[r, lags] = xcorr(x, y);        % Cross-correlation
[r, lags] = xcorr(x, y, 'coeff');  % Normalized
```

### Percentiles and Quantiles

```matlab
p = prctile(x, [25 50 75]);     % Percentiles
q = quantile(x, [0.25 0.5 0.75]);  % Quantiles
```

### Moving Statistics

```matlab
y = movmean(x, k);              % k-point moving average
y = movmedian(x, k);            % Moving median
y = movstd(x, k);               % Moving standard deviation
y = movvar(x, k);               % Moving variance
y = movmin(x, k);               % Moving minimum
y = movmax(x, k);               % Moving maximum
y = movsum(x, k);               % Moving sum

% Window options
y = movmean(x, [kb kf]);        % kb back, kf forward
y = movmean(x, k, 'omitnan');   % Ignore NaN
```

### Histograms and Distributions

```matlab
% Histogram counts
[N, edges] = histcounts(x);     % Automatic binning
[N, edges] = histcounts(x, nbins);  % Specify number of bins
[N, edges] = histcounts(x, edges);  % Specify edges

% Probability/normalized
[N, edges] = histcounts(x, 'Normalization', 'probability');
[N, edges] = histcounts(x, 'Normalization', 'pdf');

% 2D histogram
[N, xedges, yedges] = histcounts2(x, y);
```

## Signal Processing

### Fourier Transform

```matlab
% FFT
Y = fft(x);                     % 1D FFT
Y = fft(x, n);                  % n-point FFT (zero-pad/truncate)
Y = fft2(X);                    % 2D FFT
Y = fftn(X);                    % N-D FFT

% Inverse FFT
x = ifft(Y);
X = ifft2(Y);
X = ifftn(Y);

% Shift zero-frequency to center
Y_shifted = fftshift(Y);
Y = ifftshift(Y_shifted);

% Frequency axis
n = length(x);
fs = 1000;                      % Sampling frequency
f = (0:n-1) * fs / n;           % Frequency vector
f = (-n/2:n/2-1) * fs / n;      % Centered frequency vector
```

### Filtering

```matlab
% 1D filtering
y = filter(b, a, x);            % Apply IIR/FIR filter
y = filtfilt(b, a, x);          % Zero-phase filtering

% Simple moving average
b = ones(1, k) / k;
y = filter(b, 1, x);

% Convolution
y = conv(x, h);                 % Full convolution
y = conv(x, h, 'same');         % Same size as x
y = conv(x, h, 'valid');        % Valid part only

% Deconvolution
[q, r] = deconv(y, h);          % y = conv(q, h) + r

% 2D filtering
Y = filter2(H, X);              % 2D filter
Y = conv2(X, H, 'same');        % 2D convolution
```

## Interpolation and Fitting

### Interpolation

```matlab
% 1D interpolation
yi = interp1(x, y, xi);         % Linear (default)
yi = interp1(x, y, xi, 'spline');  % Spline
yi = interp1(x, y, xi, 'pchip');   % Piecewise cubic
yi = interp1(x, y, xi, 'nearest'); % Nearest neighbor

% 2D interpolation
zi = interp2(X, Y, Z, xi, yi);
zi = interp2(X, Y, Z, xi, yi, 'spline');

% 3D interpolation
vi = interp3(X, Y, Z, V, xi, yi, zi);

% Scattered data
F = scatteredInterpolant(x, y, v);
vi = F(xi, yi);
```

### Polynomial Fitting

```matlab
% Polynomial fit
p = polyfit(x, y, n);           % Fit degree-n polynomial
                                % p = [p1, p2, ..., pn+1]
                                % y = p1*x^n + p2*x^(n-1) + ... + pn+1

% Evaluate polynomial
yi = polyval(p, xi);

% With fit quality
[p, S] = polyfit(x, y, n);
[yi, delta] = polyval(p, xi, S);  % delta = error estimate

% Polynomial operations
r = roots(p);                   % Find roots
p = poly(r);                    % Polynomial from roots
q = polyder(p);                 % Derivative
q = polyint(p);                 % Integral
c = conv(p1, p2);               % Multiply polynomials
[q, r] = deconv(p1, p2);        % Divide polynomials
```

### Curve Fitting

```matlab
% Using fit function (Curve Fitting Toolbox or basic forms)
% Linear: y = a*x + b
p = polyfit(x, y, 1);
a = p(1); b = p(2);

% Exponential: y = a*exp(b*x)
% Linearize: log(y) = log(a) + b*x
p = polyfit(x, log(y), 1);
b = p(1); a = exp(p(2));

% Power: y = a*x^b
% Linearize: log(y) = log(a) + b*log(x)
p = polyfit(log(x), log(y), 1);
b = p(1); a = exp(p(2));

% General nonlinear fitting with lsqcurvefit
model = @(p, x) p(1)*exp(-p(2)*x);  % Example: a*exp(-b*x)
p0 = [1, 1];                        % Initial guess
p = lsqcurvefit(model, p0, xdata, ydata);
```
