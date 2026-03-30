# FluidSim Installation

## Requirements

- Python >= 3.9
- Virtual environment recommended

## Installation Methods

### Basic Installation

Install fluidsim using uv:

```bash
uv pip install fluidsim
```

### With FFT Support (Required for Pseudospectral Solvers)

Most fluidsim solvers use Fourier-based methods and require FFT libraries:

```bash
uv pip install "fluidsim[fft]"
```

This installs fluidfft and pyfftw dependencies.

### With MPI and FFT (For Parallel Simulations)

For high-performance parallel computing:

```bash
uv pip install "fluidsim[fft,mpi]"
```

Note: This triggers local compilation of mpi4py.

## Environment Configuration

### Output Directories

Set environment variables to control where simulation data is stored:

```bash
export FLUIDSIM_PATH=/path/to/simulation/outputs
export FLUIDDYN_PATH_SCRATCH=/path/to/working/directory
```

### FFT Method Selection

Specify FFT implementation (optional):

```bash
export FLUIDSIM_TYPE_FFT2D=fft2d.with_fftw
export FLUIDSIM_TYPE_FFT3D=fft3d.with_fftw
```

## Verification

Test the installation:

```bash
pytest --pyargs fluidsim
```

## No Authentication Required

FluidSim does not require API keys or authentication tokens.
