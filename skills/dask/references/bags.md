# Dask Bags

## Overview

Dask Bag implements functional operations including `map`, `filter`, `fold`, and `groupby` on generic Python objects. It processes data in parallel while maintaining a small memory footprint through Python iterators. Bags function as "a parallel version of PyToolz or a Pythonic version of the PySpark RDD."

## Core Concept

A Dask Bag is a collection of Python objects distributed across partitions:
- Each partition contains generic Python objects
- Operations use functional programming patterns
- Processing uses streaming/iterators for memory efficiency
- Ideal for unstructured or semi-structured data

## Key Capabilities

### Functional Operations
- `map`: Transform each element
- `filter`: Select elements based on condition
- `fold`: Reduce elements with combining function
- `groupby`: Group elements by key
- `pluck`: Extract fields from records
- `flatten`: Flatten nested structures

### Use Cases
- Text processing and log analysis
- JSON record processing
- ETL on unstructured data
- Data cleaning before structured analysis

## When to Use Dask Bags

**Use Bags When**:
- Working with general Python objects requiring flexible computation
- Data doesn't fit structured array or tabular formats
- Processing text, JSON, or custom Python objects
- Initial data cleaning and ETL is needed
- Memory-efficient streaming is important

**Use Other Collections When**:
- Data is structured (use DataFrames instead)
- Numeric computing (use Arrays instead)
- Operations require complex groupby or shuffles (use DataFrames)

**Key Recommendation**: Use Bag to clean and process data, then transform it into an array or DataFrame before embarking on more complex operations that require shuffle steps.

## Important Limitations

Bags sacrifice performance for generality:
- Rely on multiprocessing scheduling (not threads)
- Remain immutable (create new bags for changes)
- Operate slower than array/DataFrame equivalents
- Handle `groupby` inefficiently (use `foldby` when possible)
- Operations requiring substantial inter-worker communication are slow

## Creating Bags

### From Sequences
```python
import dask.bag as db

# From Python list
bag = db.from_sequence([1, 2, 3, 4, 5], partition_size=2)

# From range
bag = db.from_sequence(range(10000), partition_size=1000)
```

### From Text Files
```python
# Single file
bag = db.read_text('data.txt')

# Multiple files with glob
bag = db.read_text('data/*.txt')

# With encoding
bag = db.read_text('data/*.txt', encoding='utf-8')

# Custom line processing
bag = db.read_text('logs/*.log', blocksize='64MB')
```

### From Delayed Objects
```python
import dask

@dask.delayed
def load_data(filename):
    with open(filename) as f:
        return [line.strip() for line in f]

files = ['file1.txt', 'file2.txt', 'file3.txt']
partitions = [load_data(f) for f in files]
bag = db.from_delayed(partitions)
```

### From Custom Sources
```python
# From any iterable-producing function
def read_json_files():
    import json
    for filename in glob.glob('data/*.json'):
        with open(filename) as f:
            yield json.load(f)

# Create bag from generator
bag = db.from_sequence(read_json_files(), partition_size=10)
```

## Common Operations

### Map (Transform)
```python
import dask.bag as db

bag = db.read_text('data/*.json')

# Parse JSON
import json
parsed = bag.map(json.loads)

# Extract field
values = parsed.map(lambda x: x['value'])

# Complex transformation
def process_record(record):
    return {
        'id': record['id'],
        'value': record['value'] * 2,
        'category': record.get('category', 'unknown')
    }

processed = parsed.map(process_record)
```

### Filter
```python
# Filter by condition
valid = parsed.filter(lambda x: x['status'] == 'valid')

# Multiple conditions
filtered = parsed.filter(lambda x: x['value'] > 100 and x['year'] == 2024)

# Filter with custom function
def is_valid_record(record):
    return record.get('status') == 'valid' and record.get('value') is not None

valid_records = parsed.filter(is_valid_record)
```

### Pluck (Extract Fields)
```python
# Extract single field
ids = parsed.pluck('id')

# Extract multiple fields (creates tuples)
key_pairs = parsed.pluck(['id', 'value'])
```

### Flatten
```python
# Flatten nested lists
nested = db.from_sequence([[1, 2], [3, 4], [5, 6]])
flat = nested.flatten()  # [1, 2, 3, 4, 5, 6]

# Flatten after map
bag = db.read_text('data/*.txt')
words = bag.map(str.split).flatten()  # All words from all files
```

### GroupBy (Expensive)
```python
# Group by key (requires shuffle)
grouped = parsed.groupby(lambda x: x['category'])

# Aggregate after grouping
counts = grouped.map(lambda key_items: (key_items[0], len(list(key_items[1]))))
result = counts.compute()
```

### FoldBy (Preferred for Aggregations)
```python
# FoldBy is more efficient than groupby for aggregations
def add(acc, item):
    return acc + item['value']

def combine(acc1, acc2):
    return acc1 + acc2

# Sum values by category
sums = parsed.foldby(
    key='category',
    binop=add,
    initial=0,
    combine=combine
)

result = sums.compute()
```

### Reductions
```python
# Count elements
count = bag.count().compute()

# Get all distinct values (requires memory)
distinct = bag.distinct().compute()

# Take first n elements
first_ten = bag.take(10)

# Fold/reduce
total = bag.fold(
    lambda acc, x: acc + x['value'],
    initial=0,
    combine=lambda a, b: a + b
).compute()
```

## Converting to Other Collections

### To DataFrame
```python
import dask.bag as db
import dask.dataframe as dd

# Bag of dictionaries
bag = db.read_text('data/*.json').map(json.loads)

# Convert to DataFrame
ddf = bag.to_dataframe()

# With explicit columns
ddf = bag.to_dataframe(meta={'id': int, 'value': float, 'category': str})
```

### To List/Compute
```python
# Compute to Python list (loads all in memory)
result = bag.compute()

# Take sample
sample = bag.take(100)
```

## Common Patterns

### JSON Processing
```python
import dask.bag as db
import json

# Read and parse JSON files
bag = db.read_text('logs/*.json')
parsed = bag.map(json.loads)

# Filter valid records
valid = parsed.filter(lambda x: x.get('status') == 'success')

# Extract relevant fields
processed = valid.map(lambda x: {
    'user_id': x['user']['id'],
    'timestamp': x['timestamp'],
    'value': x['metrics']['value']
})

# Convert to DataFrame for analysis
ddf = processed.to_dataframe()

# Analyze
summary = ddf.groupby('user_id')['value'].mean().compute()
```

### Log Analysis
```python
# Read log files
logs = db.read_text('logs/*.log')

# Parse log lines
def parse_log_line(line):
    parts = line.split(' ')
    return {
        'timestamp': parts[0],
        'level': parts[1],
        'message': ' '.join(parts[2:])
    }

parsed_logs = logs.map(parse_log_line)

# Filter errors
errors = parsed_logs.filter(lambda x: x['level'] == 'ERROR')

# Count by message pattern
error_counts = errors.foldby(
    key='message',
    binop=lambda acc, x: acc + 1,
    initial=0,
    combine=lambda a, b: a + b
)

result = error_counts.compute()
```

### Text Processing
```python
# Read text files
text = db.read_text('documents/*.txt')

# Split into words
words = text.map(str.lower).map(str.split).flatten()

# Count word frequencies
def increment(acc, word):
    return acc + 1

def combine_counts(a, b):
    return a + b

word_counts = words.foldby(
    key=lambda word: word,
    binop=increment,
    initial=0,
    combine=combine_counts
)

# Get top words
top_words = word_counts.compute()
sorted_words = sorted(top_words, key=lambda x: x[1], reverse=True)[:100]
```

### Data Cleaning Pipeline
```python
import dask.bag as db
import json

# Read raw data
raw = db.read_text('raw_data/*.json').map(json.loads)

# Validation function
def is_valid(record):
    required_fields = ['id', 'timestamp', 'value']
    return all(field in record for field in required_fields)

# Cleaning function
def clean_record(record):
    return {
        'id': int(record['id']),
        'timestamp': record['timestamp'],
        'value': float(record['value']),
        'category': record.get('category', 'unknown'),
        'tags': record.get('tags', [])
    }

# Pipeline
cleaned = (raw
    .filter(is_valid)
    .map(clean_record)
    .filter(lambda x: x['value'] > 0)
)

# Convert to DataFrame
ddf = cleaned.to_dataframe()

# Save cleaned data
ddf.to_parquet('cleaned_data/')
```

## Performance Considerations

### Efficient Operations
- Map, filter, pluck: Very efficient (streaming)
- Flatten: Efficient
- FoldBy with good key distribution: Reasonable
- Take and head: Efficient (only processes needed partitions)

### Expensive Operations
- GroupBy: Requires shuffle, can be slow
- Distinct: Requires collecting all unique values
- Operations requiring full data materialization

### Optimization Tips

**1. Use FoldBy Instead of GroupBy**
```python
# Better: Use foldby for aggregations
result = bag.foldby(key='category', binop=add, initial=0, combine=sum)

# Worse: GroupBy then reduce
result = bag.groupby('category').map(lambda x: (x[0], sum(x[1])))
```

**2. Convert to DataFrame Early**
```python
# For structured operations, convert to DataFrame
bag = db.read_text('data/*.json').map(json.loads)
bag = bag.filter(lambda x: x['status'] == 'valid')
ddf = bag.to_dataframe()  # Now use efficient DataFrame operations
```

**3. Control Partition Size**
```python
# Balance between too many and too few partitions
bag = db.read_text('data/*.txt', blocksize='64MB')  # Reasonable partition size
```

**4. Use Lazy Evaluation**
```python
# Chain operations before computing
result = (bag
    .map(process1)
    .filter(condition)
    .map(process2)
    .compute()  # Single compute at the end
)
```

## Debugging Tips

### Inspect Partitions
```python
# Get number of partitions
print(bag.npartitions)

# Take sample
sample = bag.take(10)
print(sample)
```

### Validate on Small Data
```python
# Test logic on small subset
small_bag = db.from_sequence(sample_data, partition_size=10)
result = process_pipeline(small_bag).compute()
# Validate results, then scale
```

### Check Intermediate Results
```python
# Compute intermediate steps to debug
step1 = bag.map(parse).take(5)
print("After parsing:", step1)

step2 = bag.map(parse).filter(validate).take(5)
print("After filtering:", step2)
```

## Memory Management

Bags are designed for memory-efficient processing:

```python
# Streaming processing - doesn't load all in memory
bag = db.read_text('huge_file.txt')  # Lazy
processed = bag.map(process_line)     # Still lazy
result = processed.compute()          # Processes in chunks
```

For very large results, avoid computing to memory:

```python
# Don't compute huge results to memory
# result = bag.compute()  # Could overflow memory

# Instead, convert and save to disk
ddf = bag.to_dataframe()
ddf.to_parquet('output/')
```
