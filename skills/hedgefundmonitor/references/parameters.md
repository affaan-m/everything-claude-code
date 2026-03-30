# Parameters Reference

## Periodicity Codes

Used in `periodicity` parameter for `/series/timeseries`, `/series/full`, `/series/multifull`, `/series/dataset`, and `/calc/spread`.

| Code | Description |
|------|-------------|
| `A` | Calendar Year End |
| `AS` | Calendar Year Start |
| `D` | Daily |
| `M` | Calendar Month End |
| `MS` | Calendar Month Start |
| `W` | Weekly (Sunday Start) |
| `B` | Business Day (Weekday) |
| `BM` | Business Month End |
| `BMS` | Business Month Start |
| `Q` | Quarter End |
| `BQ` | Business Quarter End |
| `QS` | Quarter Start |
| `BQS` | Business Quarter Start |
| `BA` | Business Year End |
| `BAS` | Business Year Start |

**Note:** When resampling, the `how` parameter specifies how to compute the value within each period.

## Aggregation Methods (`how`)

| Value | Description |
|-------|-------------|
| `last` | Last value of the period (default) |
| `first` | First value of the period |
| `mean` | Mean (average) of all values in the period |
| `median` | Median of all values in the period |
| `sum` | Sum of all values in the period |

## Vintage (`vintage` — dataset endpoint only)

| Value | Description |
|-------|-------------|
| `p` | Preliminary data |
| `f` | Final data |
| `a` | "As of" data |

If not specified, all vintages (preliminary, final, and "as of") are returned together.

## Date Parameters

- `start_date` and `end_date` use `YYYY-MM-DD` format
- Default `start_date`: `1901-01-01` (all available history)
- Default `end_date`: today's date (all available up to now)
- FPF data starts from `2013-03-31`; FICC/TFF data start dates vary by series

## Time Format (`time_format`)

| Value | Format |
|-------|--------|
| `date` | String in `YYYY-MM-DD` format (default) |
| `ms` | Integer: milliseconds since Unix epoch (1970-01-01) |

The `ms` format is useful for JavaScript charting libraries (e.g., Highcharts, D3).

## Label (`label` — timeseries endpoint only)

| Value | Description |
|-------|-------------|
| `aggregation` | Main aggregated series (default) |
| `disclosure_edits` | Series with disclosure-masked values |

## Null Handling

- `remove_nulls=true` — removes all `[date, null]` pairs from the response
- Without this parameter, nulls are included as `null` in the value position
- FPF masked values (withheld for disclosure protection) appear as `null`

## Search Wildcards

Used in the `query` parameter of `/metadata/search`:

| Wildcard | Matches |
|----------|---------|
| `*` | Zero or more characters |
| `?` | Exactly one character |

Examples:
- `Fund*` — anything starting with "Fund"
- `*credit*` — anything containing "credit"
- `FPF-ALLQHF_?` — mnemonics starting with `FPF-ALLQHF_` followed by one char

## Field Selectors

Used in `fields` parameter of `/metadata/query`. Access subfields with `/`:

```
fields=description/name
fields=schedule/start_date,schedule/observation_frequency
fields=release/long_name,description/description
```

Available top-level fields:
- `mnemonic`
- `description` (subfields: `name`, `description`, `notes`, `vintage_approach`, `vintage`, `subsetting`, `subtype`)
- `schedule` (subfields: `observation_period`, `observation_frequency`, `seasonal_adjustment`, `start_date`, `last_update`)
- `release` (subfields: `long_name`, `short_name`, and others depending on the series)
