# GTEx API v2 Reference

## Base URL

```
https://gtexportal.org/api/v2/
```

All endpoints accept GET requests. Responses are JSON. No authentication required.

## Common Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `gencodeId` | GENCODE gene ID with version | `ENSG00000130203.10` |
| `geneSymbol` | Gene symbol | `APOE` |
| `variantId` | GTEx variant ID | `chr17_45413693_C_T_b38` |
| `tissueSiteDetailId` | Tissue identifier | `Whole_Blood` |
| `datasetId` | Dataset version | `gtex_v10` |
| `itemsPerPage` | Results per page | `250` |
| `page` | Page number (0-indexed) | `0` |

## Endpoint Reference

### Expression Endpoints

#### `GET /expression/medianGeneExpression`

Median TPM expression for a gene across tissues.

**Parameters:** `gencodeId`, `datasetId`, `itemsPerPage`

**Response fields:**
```json
{
  "data": [
    {
      "gencodeId": "ENSG00000130203.10",
      "geneSymbol": "APOE",
      "tissueSiteDetailId": "Liver",
      "tissueSiteDetail": "Liver",
      "median": 2847.9,
      "unit": "TPM",
      "datasetId": "gtex_v10"
    }
  ]
}
```

#### `GET /expression/geneExpression`

Full expression distribution (box plot data) per tissue.

**Parameters:** `gencodeId`, `tissueSiteDetailId`, `datasetId`

**Response fields:**
- `data[].tissueExpressionData.data`: array of TPM values per sample

### Association (QTL) Endpoints

#### `GET /association/singleTissueEqtl`

Significant single-tissue cis-eQTLs.

**Parameters:** `gencodeId` OR `variantId`, `tissueSiteDetailId` (optional), `datasetId`

**Response fields:**
```json
{
  "data": [
    {
      "gencodeId": "ENSG00000169174.14",
      "geneSymbol": "PCSK9",
      "variantId": "chr1_55516888_G_GA_b38",
      "snpId": "rs72646508",
      "tissueSiteDetailId": "Liver",
      "slope": -0.342,
      "slopeStandardError": 0.051,
      "pval": 3.2e-11,
      "qval": 2.1e-8,
      "maf": 0.089,
      "datasetId": "gtex_v10"
    }
  ]
}
```

**Key fields:**
- `slope`: effect of alt allele on expression (log2 scale after rank normalization)
- `pval`: nominal p-value
- `qval`: FDR-adjusted q-value
- `maf`: minor allele frequency in the GTEx cohort

#### `GET /association/singleTissueSqtl`

Significant single-tissue sQTLs (splicing).

**Parameters:** Same as eQTL endpoint

#### `GET /association/egene`

All eGenes (genes with ≥1 significant eQTL) in a tissue.

**Parameters:** `tissueSiteDetailId`, `datasetId`

**Response fields:** gene ID, gene symbol, best eQTL variant, p-value, q-value

### Dataset/Metadata Endpoints

#### `GET /dataset/tissueSiteDetail`

List of all available tissues.

**Parameters:** `datasetId`, `itemsPerPage`

**Response fields:**
- `tissueSiteDetailId`: API identifier (use this in queries)
- `tissueSiteDetail`: Display name
- `colorHex`: Color for visualization
- `samplingSite`: Anatomical location

#### `GET /reference/gene`

Gene metadata from GENCODE.

**Parameters:** `geneSymbol` OR `gencodeId`, `referenceGenomeId` (GRCh38)

### Variant Endpoints

#### `GET /variant/variantPage`

Variant metadata and lookup.

**Parameters:** `snpId` (rsID) OR `variantId`

## Tissue IDs Reference (Common Tissues)

| ID | Display Name |
|----|-------------|
| `Whole_Blood` | Whole Blood |
| `Brain_Cortex` | Brain - Cortex |
| `Brain_Hippocampus` | Brain - Hippocampus |
| `Brain_Frontal_Cortex_BA9` | Brain - Frontal Cortex (BA9) |
| `Liver` | Liver |
| `Kidney_Cortex` | Kidney - Cortex |
| `Heart_Left_Ventricle` | Heart - Left Ventricle |
| `Lung` | Lung |
| `Muscle_Skeletal` | Muscle - Skeletal |
| `Adipose_Subcutaneous` | Adipose - Subcutaneous |
| `Colon_Transverse` | Colon - Transverse |
| `Small_Intestine_Terminal_Ileum` | Small Intestine - Terminal Ileum |
| `Skin_Sun_Exposed_Lower_leg` | Skin - Sun Exposed (Lower leg) |
| `Thyroid` | Thyroid |
| `Nerve_Tibial` | Nerve - Tibial |
| `Artery_Coronary` | Artery - Coronary |
| `Artery_Aorta` | Artery - Aorta |
| `Pancreas` | Pancreas |
| `Pituitary` | Pituitary |
| `Spleen` | Spleen |
| `Prostate` | Prostate |
| `Ovary` | Ovary |
| `Uterus` | Uterus |
| `Testis` | Testis |

## Error Handling

```python
import requests
from requests.exceptions import HTTPError, Timeout

def safe_gtex_query(endpoint, params):
    url = f"https://gtexportal.org/api/v2/{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except HTTPError as e:
        print(f"HTTP error {e.response.status_code}: {e.response.text}")
    except Timeout:
        print("Request timed out")
    except Exception as e:
        print(f"Error: {e}")
    return None
```

## Rate Limiting

GTEx API does not publish explicit rate limits but:
- Add 0.5–1s delays between bulk queries
- Use data downloads for genome-wide analyses instead of API
- Cache results locally for repeated queries
