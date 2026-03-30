# TimesFM API Reference

## Model Classes

### `timesfm.TimesFM_2p5_200M_torch`

The primary model class for TimesFM 2.5 (200M parameters, PyTorch backend).

#### `from_pretrained()`

```python
model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
    "google/timesfm-2.5-200m-pytorch",
    cache_dir=None,         # Optional: custom cache directory
    force_download=True,    # Re-download even if cached
)
```

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `model_id` | str | `"google/timesfm-2.5-200m-pytorch"` | Hugging Face model ID |
| `revision` | str \| None | None | Specific model revision |
| `cache_dir` | str \| Path \| None | None | Custom cache directory |
| `force_download` | bool | True | Force re-download of weights |

**Returns**: Initialized `TimesFM_2p5_200M_torch` instance (not yet compiled).

#### `compile()`

Compiles the model with the given forecast configuration. **Must be called before `forecast()`.**

```python
model.compile(
    timesfm.ForecastConfig(
        max_context=1024,
        max_horizon=256,
        normalize_inputs=True,
        per_core_batch_size=32,
        use_continuous_quantile_head=True,
        force_flip_invariance=True,
        infer_is_positive=True,
        fix_quantile_crossing=True,
    )
)
```

**Raises**: Nothing (but `forecast()` will raise `RuntimeError` if not compiled).

#### `forecast()`

Run inference on one or more time series.

```python
point_forecast, quantile_forecast = model.forecast(
    horizon=24,
    inputs=[array1, array2, ...],
)
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `horizon` | int | Number of future steps to forecast |
| `inputs` | list[np.ndarray] | List of 1-D numpy arrays (each is a time series) |

**Returns**: `tuple[np.ndarray, np.ndarray]`

- `point_forecast`: shape `(batch_size, horizon)` — median (0.5 quantile)
- `quantile_forecast`: shape `(batch_size, horizon, 10)` — [mean, q10, q20, ..., q90]

**Raises**: `RuntimeError` if model is not compiled.

**Key behaviors**:

- Leading NaN values are stripped automatically
- Internal NaN values are linearly interpolated
- Series longer than `max_context` are truncated (last `max_context` points used)
- Series shorter than `max_context` are padded

#### `forecast_with_covariates()`

Run inference with exogenous variables (requires `timesfm[xreg]`).

```python
point, quantiles = model.forecast_with_covariates(
    inputs=inputs,
    dynamic_numerical_covariates={"temp": [temp_array1, temp_array2]},
    dynamic_categorical_covariates={"dow": [dow_array1, dow_array2]},
    static_categorical_covariates={"region": ["east", "west"]},
    xreg_mode="xreg + timesfm",
)
```

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `inputs` | list[np.ndarray] | Target time series |
| `dynamic_numerical_covariates` | dict[str, list[np.ndarray]] | Time-varying numeric features |
| `dynamic_categorical_covariates` | dict[str, list[np.ndarray]] | Time-varying categorical features |
| `static_categorical_covariates` | dict[str, list[str]] | Fixed categorical features per series |
| `xreg_mode` | str | `"xreg + timesfm"` or `"timesfm + xreg"` |

**Note**: Dynamic covariates must have length `context + horizon` for each series.

---

## `timesfm.ForecastConfig`

Immutable dataclass controlling all forecast behavior.

```python
@dataclasses.dataclass(frozen=True)
class ForecastConfig:
    max_context: int = 0
    max_horizon: int = 0
    normalize_inputs: bool = False
    per_core_batch_size: int = 1
    use_continuous_quantile_head: bool = False
    force_flip_invariance: bool = True
    infer_is_positive: bool = True
    fix_quantile_crossing: bool = False
    return_backcast: bool = False
    quantiles: list[float] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    decode_index: int = 5
```

### Parameter Details

#### `max_context` (int, default=0)

Maximum number of historical time points to use as context.

- **0**: Use the model's maximum supported context (16,384 for v2.5)
- **N**: Truncate series to last N points
- **Best practice**: Set to the length of your longest series, or 512–2048 for speed

#### `max_horizon` (int, default=0)

Maximum forecast horizon.

- **0**: Use the model's maximum
- **N**: Forecasts up to N steps (can still call `forecast(horizon=M)` where M ≤ N)
- **Best practice**: Set to your expected maximum forecast length

#### `normalize_inputs` (bool, default=False)

Whether to z-normalize each series before feeding to the model.

- **True** (RECOMMENDED): Normalizes each series to zero mean, unit variance
- **False**: Raw values are passed directly
- **When False is OK**: Only if your series are already normalized or very close to scale 1.0

#### `per_core_batch_size` (int, default=1)

Number of series processed per device in each batch.

- Increase for throughput, decrease if OOM
- See `references/system_requirements.md` for recommended values by hardware

#### `use_continuous_quantile_head` (bool, default=False)

Use the 30M-parameter continuous quantile head for better interval calibration.

- **True** (RECOMMENDED): More accurate prediction intervals, especially for longer horizons
- **False**: Uses fixed quantile buckets (faster but less accurate intervals)

#### `force_flip_invariance` (bool, default=True)

Ensures the model satisfies `f(-x) = -f(x)`.

- **True** (RECOMMENDED): Mathematical consistency — forecasts are invariant to sign flip
- **False**: Slightly faster but may produce asymmetric forecasts

#### `infer_is_positive` (bool, default=True)

Automatically detect if all input values are positive and clamp forecasts ≥ 0.

- **True**: Safe for sales, demand, counts, prices, volumes
- **False**: Required for temperature, returns, PnL, any series that can be negative

#### `fix_quantile_crossing` (bool, default=False)

Post-process quantiles to ensure monotonicity (q10 ≤ q20 ≤ ... ≤ q90).

- **True** (RECOMMENDED): Guarantees well-ordered quantiles
- **False**: Slightly faster but quantiles may occasionally cross

#### `return_backcast` (bool, default=False)

Return the model's reconstruction of the input (backcast) in addition to forecast.

- **True**: Used for covariate workflows and diagnostics
- **False**: Only return forecast

---

## Available Model Checkpoints

| Model ID | Version | Params | Backend | Context |
| -------- | ------- | ------ | ------- | ------- |
| `google/timesfm-2.5-200m-pytorch` | 2.5 | 200M | PyTorch | 16,384 |
| `google/timesfm-2.5-200m-flax` | 2.5 | 200M | JAX/Flax | 16,384 |
| `google/timesfm-2.5-200m-transformers` | 2.5 | 200M | Transformers | 16,384 |
| `google/timesfm-2.0-500m-pytorch` | 2.0 | 500M | PyTorch | 2,048 |
| `google/timesfm-2.0-500m-jax` | 2.0 | 500M | JAX | 2,048 |
| `google/timesfm-1.0-200m-pytorch` | 1.0 | 200M | PyTorch | 2,048 |
| `google/timesfm-1.0-200m` | 1.0 | 200M | JAX | 2,048 |

---

## Output Shape Reference

| Output | Shape | Description |
| ------ | ----- | ----------- |
| `point_forecast` | `(B, H)` | Median forecast for B series, H steps |
| `quantile_forecast` | `(B, H, 10)` | Full quantile distribution |
| `quantile_forecast[:,:,0]` | `(B, H)` | Mean |
| `quantile_forecast[:,:,1]` | `(B, H)` | 10th percentile |
| `quantile_forecast[:,:,5]` | `(B, H)` | 50th percentile (= point_forecast) |
| `quantile_forecast[:,:,9]` | `(B, H)` | 90th percentile |

Where `B` = batch size (number of input series), `H` = forecast horizon.

---

## Error Handling

| Error | Cause | Fix |
| ----- | ----- | --- |
| `RuntimeError: Model is not compiled` | Called `forecast()` before `compile()` | Call `model.compile(ForecastConfig(...))` first |
| `torch.cuda.OutOfMemoryError` | Batch too large for GPU | Reduce `per_core_batch_size` |
| `ValueError: inputs must be list` | Passed array instead of list | Wrap in list: `[array]` |
| `HfHubHTTPError` | Download failed | Check internet, set `HF_HOME` to writable dir |
