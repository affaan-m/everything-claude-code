# JASPAR API v1 Reference

## Base URL

```
https://jaspar.elixir.no/api/v1/
```

No authentication required. Responses are JSON.

## Core Endpoints

### `GET /matrix/`

Search and list TF binding profiles.

**Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `name` | string | TF name (partial match) | `CTCF` |
| `matrix_id` | string | Exact matrix ID | `MA0139.1` |
| `collection` | string | Collection name | `CORE` |
| `tax_group` | string | Taxonomic group | `vertebrates` |
| `species` | string | Species name or tax ID | `9606`, `Homo sapiens` |
| `tf_class` | string | TF structural class | `C2H2 zinc finger factors` |
| `tf_family` | string | TF family | `BEN domain factors` |
| `type` | string | Experimental method | `ChIP-seq`, `SELEX` |
| `version` | string | `latest` or specific version | `latest` |
| `page` | int | Page number | `1` |
| `page_size` | int | Results per page (max 500) | `25` |

**Response:**
```json
{
  "count": 1210,
  "next": "https://jaspar.elixir.no/api/v1/matrix/?page=2",
  "previous": null,
  "results": [
    {
      "matrix_id": "MA0139.1",
      "name": "CTCF",
      "collection": "CORE",
      "tax_group": "vertebrates"
    }
  ]
}
```

### `GET /matrix/{id}/`

Fetch a specific matrix with full details.

**Response:**
```json
{
  "matrix_id": "MA0139.1",
  "name": "CTCF",
  "collection": "CORE",
  "tax_group": "vertebrates",
  "pfm": {
    "A": [87, 167, 281, ...],
    "C": [291, 145, 49, ...],
    "G": [76, 414, 504, ...],
    "T": [205, 114, 27, ...]
  },
  "consensus": "CCGCGNGGNGGCAG",
  "length": 19,
  "species": [{"tax_id": 9606, "name": "Homo sapiens"}],
  "class": ["C2H2 zinc finger factors"],
  "family": ["BEN domain factors"],
  "type": "ChIP-seq",
  "uniprot_ids": ["P49711"],
  "pubmed_ids": ["19172222"],
  "version": 1,
  "latest": true
}
```

### `GET /matrix/{id}/logo/`

Returns SVG/PNG logo for the matrix.

**Parameters:** `format` = `svg` (default) or `png`

### `GET /taxon/`

List available species/taxa.

### `GET /tf_class/`

List available TF structural classes.

### `GET /tf_family/`

List available TF families.

### `GET /collection/`

List available collections.

## Matrix ID Format

```
MA{number}.{version}
```

- `MA` prefix = Manual curation
- `PB` prefix = Published (automatic)
- `UN` prefix = Unvalidated
- Version increments when profile is updated

## Common Matrix IDs

| Matrix ID | TF | Species | Method |
|-----------|-----|---------|--------|
| `MA0139.1` | CTCF | Human | ChIP-seq |
| `MA0098.3` | ETS1 | Human | SELEX |
| `MA0107.1` | RELA (NF-kB p65) | Human | SELEX |
| `MA0048.2` | NHLH1 | Human | SELEX |
| `MA0079.4` | SP1 | Human | SELEX |
| `MA0080.4` | SPI1 (PU.1) | Human | ChIP-seq |
| `MA0025.2` | NFIL3 | Human | SELEX |
| `MA0002.2` | RUNX1 | Human | SELEX |
| `MA0004.1` | Arnt | Mouse | SELEX |
| `MA0009.2` | TAL1::GATA1 | Human | SELEX |

## TF Classes (partial list)

- `C2H2 zinc finger factors`
- `Basic leucine zipper factors (bZIP)`
- `Basic helix-loop-helix factors (bHLH)`
- `Homeodomain factors`
- `Forkhead box (FOX) factors`
- `ETS-domain factors`
- `Nuclear hormone receptors`
- `Tryptophan cluster factors`
- `p53-like transcription factors`
- `STAT factors`
- `MADS box factors`
- `T-box factors`

## Python Example: Batch Download

```python
import requests, json, time

def download_all_human_profiles(output_file="jaspar_human_profiles.json"):
    """Download all human TF profiles from JASPAR CORE collection."""
    url = "https://jaspar.elixir.no/api/v1/matrix/"
    params = {
        "collection": "CORE",
        "species": "9606",
        "version": "latest",
        "page_size": 500,
        "page": 1
    }

    profiles = []
    while True:
        response = requests.get(url, params=params)
        data = response.json()
        profiles.extend(data["results"])

        if not data["next"]:
            break
        params["page"] += 1
        time.sleep(0.5)

    # Fetch full details for each profile
    full_profiles = []
    for p in profiles:
        detail_url = f"https://jaspar.elixir.no/api/v1/matrix/{p['matrix_id']}/"
        detail = requests.get(detail_url).json()
        full_profiles.append(detail)
        time.sleep(0.1)  # Be respectful

    with open(output_file, "w") as f:
        json.dump(full_profiles, f)

    return full_profiles
```
