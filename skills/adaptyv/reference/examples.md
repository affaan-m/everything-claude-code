# Code Examples

## Setup and Authentication

### Basic Setup

```python
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_KEY = os.getenv("ADAPTYV_API_KEY")
BASE_URL = "https://kq5jp7qj7wdqklhsxmovkzn4l40obksv.lambda-url.eu-central-1.on.aws"

# Standard headers
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def check_api_connection():
    """Verify API connection and credentials"""
    try:
        response = requests.get(f"{BASE_URL}/organization/credits", headers=HEADERS)
        response.raise_for_status()
        print("✓ API connection successful")
        print(f"  Credits remaining: {response.json()['balance']}")
        return True
    except requests.exceptions.HTTPError as e:
        print(f"✗ API authentication failed: {e}")
        return False
```

### Environment Setup

Create a `.env` file:
```bash
ADAPTYV_API_KEY=your_api_key_here
```

Install dependencies:
```bash
uv pip install requests python-dotenv
```

## Experiment Submission

### Submit Single Sequence

```python
def submit_single_experiment(sequence, experiment_type="binding", target_id=None):
    """
    Submit a single protein sequence for testing

    Args:
        sequence: Amino acid sequence string
        experiment_type: Type of experiment (binding, expression, thermostability, enzyme_activity)
        target_id: Optional target identifier for binding assays

    Returns:
        Experiment ID and status
    """

    # Format as FASTA
    fasta_content = f">protein_sequence\n{sequence}\n"

    payload = {
        "sequences": fasta_content,
        "experiment_type": experiment_type
    }

    if target_id:
        payload["target_id"] = target_id

    response = requests.post(
        f"{BASE_URL}/experiments",
        headers=HEADERS,
        json=payload
    )

    response.raise_for_status()
    result = response.json()

    print(f"✓ Experiment submitted")
    print(f"  Experiment ID: {result['experiment_id']}")
    print(f"  Status: {result['status']}")
    print(f"  Estimated completion: {result['estimated_completion']}")

    return result

# Example usage
sequence = "MKVLWAALLGLLGAAAAFPAVTSAVKPYKAAVSAAVSKPYKAAVSAAVSKPYK"
experiment = submit_single_experiment(sequence, experiment_type="expression")
```

### Submit Multiple Sequences (Batch)

```python
def submit_batch_experiment(sequences_dict, experiment_type="binding", metadata=None):
    """
    Submit multiple protein sequences in a single batch

    Args:
        sequences_dict: Dictionary of {name: sequence}
        experiment_type: Type of experiment
        metadata: Optional dictionary of additional information

    Returns:
        Experiment details
    """

    # Format all sequences as FASTA
    fasta_content = ""
    for name, sequence in sequences_dict.items():
        fasta_content += f">{name}\n{sequence}\n"

    payload = {
        "sequences": fasta_content,
        "experiment_type": experiment_type
    }

    if metadata:
        payload["metadata"] = metadata

    response = requests.post(
        f"{BASE_URL}/experiments",
        headers=HEADERS,
        json=payload
    )

    response.raise_for_status()
    result = response.json()

    print(f"✓ Batch experiment submitted")
    print(f"  Experiment ID: {result['experiment_id']}")
    print(f"  Sequences: {len(sequences_dict)}")
    print(f"  Status: {result['status']}")

    return result

# Example usage
sequences = {
    "variant_1": "MKVLWAALLGLLGAAA...",
    "variant_2": "MKVLSAALLGLLGAAA...",
    "variant_3": "MKVLAAALLGLLGAAA...",
    "wildtype": "MKVLWAALLGLLGAAA..."
}

metadata = {
    "project": "antibody_optimization",
    "round": 3,
    "notes": "Testing solubility-optimized variants"
}

experiment = submit_batch_experiment(sequences, "expression", metadata)
```

### Submit with Webhook Notification

```python
def submit_with_webhook(sequences_dict, experiment_type, webhook_url):
    """
    Submit experiment with webhook for completion notification

    Args:
        sequences_dict: Dictionary of {name: sequence}
        experiment_type: Type of experiment
        webhook_url: URL to receive notification when complete
    """

    fasta_content = ""
    for name, sequence in sequences_dict.items():
        fasta_content += f">{name}\n{sequence}\n"

    payload = {
        "sequences": fasta_content,
        "experiment_type": experiment_type,
        "webhook_url": webhook_url
    }

    response = requests.post(
        f"{BASE_URL}/experiments",
        headers=HEADERS,
        json=payload
    )

    response.raise_for_status()
    result = response.json()

    print(f"✓ Experiment submitted with webhook")
    print(f"  Experiment ID: {result['experiment_id']}")
    print(f"  Webhook: {webhook_url}")

    return result

# Example
webhook_url = "https://your-server.com/adaptyv-webhook"
experiment = submit_with_webhook(sequences, "binding", webhook_url)
```

## Tracking Experiments

### Check Experiment Status

```python
def check_experiment_status(experiment_id):
    """
    Get current status of an experiment

    Args:
        experiment_id: Experiment identifier

    Returns:
        Status information
    """

    response = requests.get(
        f"{BASE_URL}/experiments/{experiment_id}",
        headers=HEADERS
    )

    response.raise_for_status()
    status = response.json()

    print(f"Experiment: {experiment_id}")
    print(f"  Status: {status['status']}")
    print(f"  Created: {status['created_at']}")
    print(f"  Updated: {status['updated_at']}")

    if 'progress' in status:
        print(f"  Progress: {status['progress']['percentage']}%")
        print(f"  Current stage: {status['progress']['stage']}")

    return status

# Example
status = check_experiment_status("exp_abc123xyz")
```

### List All Experiments

```python
def list_experiments(status_filter=None, limit=50):
    """
    List experiments with optional status filtering

    Args:
        status_filter: Filter by status (submitted, processing, completed, failed)
        limit: Maximum number of results

    Returns:
        List of experiments
    """

    params = {"limit": limit}
    if status_filter:
        params["status"] = status_filter

    response = requests.get(
        f"{BASE_URL}/experiments",
        headers=HEADERS,
        params=params
    )

    response.raise_for_status()
    result = response.json()

    print(f"Found {result['total']} experiments")
    for exp in result['experiments']:
        print(f"  {exp['experiment_id']}: {exp['status']} ({exp['experiment_type']})")

    return result['experiments']

# Example - list all completed experiments
completed_experiments = list_experiments(status_filter="completed")
```

### Poll Until Complete

```python
import time

def wait_for_completion(experiment_id, check_interval=3600):
    """
    Poll experiment status until completion

    Args:
        experiment_id: Experiment identifier
        check_interval: Seconds between status checks (default: 1 hour)

    Returns:
        Final status
    """

    print(f"Monitoring experiment {experiment_id}...")

    while True:
        status = check_experiment_status(experiment_id)

        if status['status'] == 'completed':
            print("✓ Experiment completed!")
            return status
        elif status['status'] == 'failed':
            print("✗ Experiment failed")
            return status

        print(f"  Status: {status['status']} - checking again in {check_interval}s")
        time.sleep(check_interval)

# Example (not recommended - use webhooks instead!)
# status = wait_for_completion("exp_abc123xyz", check_interval=3600)
```

## Retrieving Results

### Download Experiment Results

```python
import json

def download_results(experiment_id, output_dir="results"):
    """
    Download and parse experiment results

    Args:
        experiment_id: Experiment identifier
        output_dir: Directory to save results

    Returns:
        Parsed results data
    """

    # Get results
    response = requests.get(
        f"{BASE_URL}/experiments/{experiment_id}/results",
        headers=HEADERS
    )

    response.raise_for_status()
    results = response.json()

    # Save results JSON
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/{experiment_id}_results.json"

    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"✓ Results downloaded: {output_file}")
    print(f"  Sequences tested: {len(results['results'])}")

    # Download raw data if available
    if 'download_urls' in results:
        for data_type, url in results['download_urls'].items():
            print(f"  {data_type} available at: {url}")

    return results

# Example
results = download_results("exp_abc123xyz")
```

### Parse Binding Results

```python
import pandas as pd

def parse_binding_results(results):
    """
    Parse binding assay results into DataFrame

    Args:
        results: Results dictionary from API

    Returns:
        pandas DataFrame with organized results
    """

    data = []
    for result in results['results']:
        row = {
            'sequence_id': result['sequence_id'],
            'kd': result['measurements']['kd'],
            'kd_error': result['measurements']['kd_error'],
            'kon': result['measurements']['kon'],
            'koff': result['measurements']['koff'],
            'confidence': result['quality_metrics']['confidence'],
            'r_squared': result['quality_metrics']['r_squared']
        }
        data.append(row)

    df = pd.DataFrame(data)

    # Sort by affinity (lower KD = stronger binding)
    df = df.sort_values('kd')

    print("Top 5 binders:")
    print(df.head())

    return df

# Example
experiment_id = "exp_abc123xyz"
results = download_results(experiment_id)
binding_df = parse_binding_results(results)

# Export to CSV
binding_df.to_csv(f"{experiment_id}_binding_results.csv", index=False)
```

### Parse Expression Results

```python
def parse_expression_results(results):
    """
    Parse expression testing results into DataFrame

    Args:
        results: Results dictionary from API

    Returns:
        pandas DataFrame with organized results
    """

    data = []
    for result in results['results']:
        row = {
            'sequence_id': result['sequence_id'],
            'yield_mg_per_l': result['measurements']['total_yield_mg_per_l'],
            'soluble_fraction': result['measurements']['soluble_fraction_percent'],
            'purity': result['measurements']['purity_percent'],
            'percentile': result['ranking']['percentile']
        }
        data.append(row)

    df = pd.DataFrame(data)

    # Sort by yield
    df = df.sort_values('yield_mg_per_l', ascending=False)

    print(f"Mean yield: {df['yield_mg_per_l'].mean():.2f} mg/L")
    print(f"Top performer: {df.iloc[0]['sequence_id']} ({df.iloc[0]['yield_mg_per_l']:.2f} mg/L)")

    return df

# Example
results = download_results("exp_expression123")
expression_df = parse_expression_results(results)
```

## Target Catalog

### Search for Targets

```python
def search_targets(query, species=None, category=None):
    """
    Search the antigen catalog

    Args:
        query: Search term (protein name, UniProt ID, etc.)
        species: Optional species filter
        category: Optional category filter

    Returns:
        List of matching targets
    """

    params = {"search": query}
    if species:
        params["species"] = species
    if category:
        params["category"] = category

    response = requests.get(
        f"{BASE_URL}/targets",
        headers=HEADERS,
        params=params
    )

    response.raise_for_status()
    targets = response.json()['targets']

    print(f"Found {len(targets)} targets matching '{query}':")
    for target in targets:
        print(f"  {target['target_id']}: {target['name']}")
        print(f"    Species: {target['species']}")
        print(f"    Availability: {target['availability']}")
        print(f"    Price: ${target['price_usd']}")

    return targets

# Example
targets = search_targets("PD-L1", species="Homo sapiens")
```

### Request Custom Target

```python
def request_custom_target(target_name, uniprot_id=None, species=None, notes=None):
    """
    Request a custom antigen not in the standard catalog

    Args:
        target_name: Name of the target protein
        uniprot_id: Optional UniProt identifier
        species: Species name
        notes: Additional requirements or notes

    Returns:
        Request confirmation
    """

    payload = {
        "target_name": target_name,
        "species": species
    }

    if uniprot_id:
        payload["uniprot_id"] = uniprot_id
    if notes:
        payload["notes"] = notes

    response = requests.post(
        f"{BASE_URL}/targets/request",
        headers=HEADERS,
        json=payload
    )

    response.raise_for_status()
    result = response.json()

    print(f"✓ Custom target request submitted")
    print(f"  Request ID: {result['request_id']}")
    print(f"  Status: {result['status']}")

    return result

# Example
request = request_custom_target(
    target_name="Novel receptor XYZ",
    uniprot_id="P12345",
    species="Mus musculus",
    notes="Need high purity for structural studies"
)
```

## Complete Workflows

### End-to-End Binding Assay

```python
def complete_binding_workflow(sequences_dict, target_id, project_name):
    """
    Complete workflow: submit sequences, track, and retrieve binding results

    Args:
        sequences_dict: Dictionary of {name: sequence}
        target_id: Target identifier from catalog
        project_name: Project name for metadata

    Returns:
        DataFrame with binding results
    """

    print("=== Starting Binding Assay Workflow ===")

    # Step 1: Submit experiment
    print("\n1. Submitting experiment...")
    metadata = {
        "project": project_name,
        "target": target_id
    }

    experiment = submit_batch_experiment(
        sequences_dict,
        experiment_type="binding",
        metadata=metadata
    )

    experiment_id = experiment['experiment_id']

    # Step 2: Save experiment info
    print("\n2. Saving experiment details...")
    with open(f"{experiment_id}_info.json", 'w') as f:
        json.dump(experiment, f, indent=2)

    print(f"✓ Experiment {experiment_id} submitted")
    print("  Results will be available in ~21 days")
    print("  Use webhook or poll status for updates")

    # Note: In practice, wait for completion before this step
    # print("\n3. Waiting for completion...")
    # status = wait_for_completion(experiment_id)

    # print("\n4. Downloading results...")
    # results = download_results(experiment_id)

    # print("\n5. Parsing results...")
    # df = parse_binding_results(results)

    # return df

    return experiment_id

# Example
antibody_variants = {
    "variant_1": "EVQLVESGGGLVQPGG...",
    "variant_2": "EVQLVESGGGLVQPGS...",
    "variant_3": "EVQLVESGGGLVQPGA...",
    "wildtype": "EVQLVESGGGLVQPGG..."
}

experiment_id = complete_binding_workflow(
    antibody_variants,
    target_id="tgt_pdl1_human",
    project_name="antibody_affinity_maturation"
)
```

### Optimization + Testing Pipeline

```python
# Combine computational optimization with experimental testing

def optimization_and_testing_pipeline(initial_sequences, experiment_type="expression"):
    """
    Complete pipeline: optimize sequences computationally, then submit for testing

    Args:
        initial_sequences: Dictionary of {name: sequence}
        experiment_type: Type of experiment

    Returns:
        Experiment ID for tracking
    """

    print("=== Optimization and Testing Pipeline ===")

    # Step 1: Computational optimization
    print("\n1. Computational optimization...")
    from protein_optimization import complete_optimization_pipeline

    optimized = complete_optimization_pipeline(initial_sequences)

    print(f"✓ Optimization complete")
    print(f"  Started with: {len(initial_sequences)} sequences")
    print(f"  Optimized to: {len(optimized)} sequences")

    # Step 2: Select top candidates
    print("\n2. Selecting top candidates for testing...")
    top_candidates = optimized[:50]  # Top 50

    sequences_to_test = {
        seq_data['name']: seq_data['sequence']
        for seq_data in top_candidates
    }

    # Step 3: Submit for experimental validation
    print("\n3. Submitting to Adaptyv...")
    metadata = {
        "optimization_method": "computational_pipeline",
        "initial_library_size": len(initial_sequences),
        "computational_scores": [s['combined'] for s in top_candidates]
    }

    experiment = submit_batch_experiment(
        sequences_to_test,
        experiment_type=experiment_type,
        metadata=metadata
    )

    print(f"✓ Pipeline complete")
    print(f"  Experiment ID: {experiment['experiment_id']}")

    return experiment['experiment_id']

# Example
initial_library = {
    f"variant_{i}": generate_random_sequence()
    for i in range(1000)
}

experiment_id = optimization_and_testing_pipeline(
    initial_library,
    experiment_type="expression"
)
```

### Batch Result Analysis

```python
def analyze_multiple_experiments(experiment_ids):
    """
    Download and analyze results from multiple experiments

    Args:
        experiment_ids: List of experiment identifiers

    Returns:
        Combined DataFrame with all results
    """

    all_results = []

    for exp_id in experiment_ids:
        print(f"Processing {exp_id}...")

        # Download results
        results = download_results(exp_id, output_dir=f"results/{exp_id}")

        # Parse based on experiment type
        exp_type = results.get('experiment_type', 'unknown')

        if exp_type == 'binding':
            df = parse_binding_results(results)
            df['experiment_id'] = exp_id
            all_results.append(df)

        elif exp_type == 'expression':
            df = parse_expression_results(results)
            df['experiment_id'] = exp_id
            all_results.append(df)

    # Combine all results
    combined_df = pd.concat(all_results, ignore_index=True)

    print(f"\n✓ Analysis complete")
    print(f"  Total experiments: {len(experiment_ids)}")
    print(f"  Total sequences: {len(combined_df)}")

    return combined_df

# Example
experiment_ids = [
    "exp_round1_abc",
    "exp_round2_def",
    "exp_round3_ghi"
]

all_data = analyze_multiple_experiments(experiment_ids)
all_data.to_csv("combined_results.csv", index=False)
```

## Error Handling

### Robust API Wrapper

```python
import time
from requests.exceptions import RequestException, HTTPError

def api_request_with_retry(method, url, max_retries=3, backoff_factor=2, **kwargs):
    """
    Make API request with retry logic and error handling

    Args:
        method: HTTP method (GET, POST, etc.)
        url: Request URL
        max_retries: Maximum number of retry attempts
        backoff_factor: Exponential backoff multiplier
        **kwargs: Additional arguments for requests

    Returns:
        Response object

    Raises:
        RequestException: If all retries fail
    """

    for attempt in range(max_retries):
        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response

        except HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                wait_time = backoff_factor ** attempt
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue

            elif e.response.status_code >= 500:  # Server error
                if attempt < max_retries - 1:
                    wait_time = backoff_factor ** attempt
                    print(f"Server error. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise

            else:  # Client error (4xx) - don't retry
                error_data = e.response.json() if e.response.content else {}
                print(f"API Error: {error_data.get('error', {}).get('message', str(e))}")
                raise

        except RequestException as e:
            if attempt < max_retries - 1:
                wait_time = backoff_factor ** attempt
                print(f"Request failed. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue
            else:
                raise

    raise RequestException(f"Failed after {max_retries} attempts")

# Example usage
response = api_request_with_retry(
    "POST",
    f"{BASE_URL}/experiments",
    headers=HEADERS,
    json={"sequences": fasta_content, "experiment_type": "binding"}
)
```

## Utility Functions

### Validate FASTA Format

```python
def validate_fasta(fasta_string):
    """
    Validate FASTA format and sequences

    Args:
        fasta_string: FASTA-formatted string

    Returns:
        Tuple of (is_valid, error_message)
    """

    lines = fasta_string.strip().split('\n')

    if not lines:
        return False, "Empty FASTA content"

    if not lines[0].startswith('>'):
        return False, "FASTA must start with header line (>)"

    valid_amino_acids = set("ACDEFGHIKLMNPQRSTVWY")
    current_header = None

    for i, line in enumerate(lines):
        if line.startswith('>'):
            if not line[1:].strip():
                return False, f"Line {i+1}: Empty header"
            current_header = line[1:].strip()

        else:
            if current_header is None:
                return False, f"Line {i+1}: Sequence before header"

            sequence = line.strip().upper()
            invalid = set(sequence) - valid_amino_acids

            if invalid:
                return False, f"Line {i+1}: Invalid amino acids: {invalid}"

    return True, None

# Example
fasta = ">protein1\nMKVLWAALLG\n>protein2\nMATGVLWALG"
is_valid, error = validate_fasta(fasta)

if is_valid:
    print("✓ FASTA format valid")
else:
    print(f"✗ FASTA validation failed: {error}")
```

### Format Sequences to FASTA

```python
def sequences_to_fasta(sequences_dict):
    """
    Convert dictionary of sequences to FASTA format

    Args:
        sequences_dict: Dictionary of {name: sequence}

    Returns:
        FASTA-formatted string
    """

    fasta_content = ""
    for name, sequence in sequences_dict.items():
        # Clean sequence (remove whitespace, ensure uppercase)
        clean_seq = ''.join(sequence.split()).upper()

        # Validate
        is_valid, error = validate_fasta(f">{name}\n{clean_seq}")
        if not is_valid:
            raise ValueError(f"Invalid sequence '{name}': {error}")

        fasta_content += f">{name}\n{clean_seq}\n"

    return fasta_content

# Example
sequences = {
    "var1": "MKVLWAALLG",
    "var2": "MATGVLWALG"
}

fasta = sequences_to_fasta(sequences)
print(fasta)
```
