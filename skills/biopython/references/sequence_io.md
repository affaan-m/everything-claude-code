# Sequence Handling with Bio.Seq and Bio.SeqIO

## Overview

Bio.Seq provides the `Seq` object for biological sequences with specialized methods, while Bio.SeqIO offers a unified interface for reading, writing, and converting sequence files across multiple formats.

## The Seq Object

### Creating Sequences

```python
from Bio.Seq import Seq

# Create a basic sequence
my_seq = Seq("AGTACACTGGT")

# Sequences support string-like operations
print(len(my_seq))  # Length
print(my_seq[0:5])  # Slicing
```

### Core Sequence Operations

```python
# Complement and reverse complement
complement = my_seq.complement()
rev_comp = my_seq.reverse_complement()

# Transcription (DNA to RNA)
rna = my_seq.transcribe()

# Translation (to protein)
protein = my_seq.translate()

# Back-transcription (RNA to DNA)
dna = rna_seq.back_transcribe()
```

### Sequence Methods

- `complement()` - Returns complementary strand
- `reverse_complement()` - Returns reverse complement
- `transcribe()` - DNA to RNA transcription
- `back_transcribe()` - RNA to DNA conversion
- `translate()` - Translate to protein sequence
- `translate(table=N)` - Use specific genetic code table
- `translate(to_stop=True)` - Stop at first stop codon

## Bio.SeqIO: Sequence File I/O

### Core Functions

**Bio.SeqIO.parse()**: The primary workhorse for reading sequence files as an iterator of `SeqRecord` objects.

```python
from Bio import SeqIO

# Parse a FASTA file
for record in SeqIO.parse("sequences.fasta", "fasta"):
    print(record.id)
    print(record.seq)
    print(len(record))
```

**Bio.SeqIO.read()**: For single-record files (validates exactly one record exists).

```python
record = SeqIO.read("single.fasta", "fasta")
```

**Bio.SeqIO.write()**: Output SeqRecord objects to files.

```python
# Write records to file
count = SeqIO.write(seq_records, "output.fasta", "fasta")
print(f"Wrote {count} records")
```

**Bio.SeqIO.convert()**: Streamlined format conversion.

```python
# Convert between formats
count = SeqIO.convert("input.gbk", "genbank", "output.fasta", "fasta")
```

### Supported File Formats

Common formats include:
- **fasta** - FASTA format
- **fastq** - FASTQ format (with quality scores)
- **genbank** or **gb** - GenBank format
- **embl** - EMBL format
- **swiss** - SwissProt format
- **fasta-2line** - FASTA with sequence on one line
- **tab** - Simple tab-separated format

### The SeqRecord Object

`SeqRecord` objects combine sequence data with annotations:

```python
record.id          # Primary identifier
record.name        # Short name
record.description # Description line
record.seq         # The actual sequence (Seq object)
record.annotations # Dictionary of additional info
record.features    # List of SeqFeature objects
record.letter_annotations  # Per-letter annotations (e.g., quality scores)
```

### Modifying Records

```python
# Modify record attributes
record.id = "new_id"
record.description = "New description"

# Extract subsequences
sub_record = record[10:30]  # Slicing preserves annotations

# Modify sequence
record.seq = record.seq.reverse_complement()
```

## Working with Large Files

### Memory-Efficient Parsing

Use iterators to avoid loading entire files into memory:

```python
# Good for large files
for record in SeqIO.parse("large_file.fasta", "fasta"):
    if len(record.seq) > 1000:
        print(record.id)
```

### Dictionary-Based Access

Three approaches for random access:

**1. Bio.SeqIO.to_dict()** - Loads all records into memory:

```python
seq_dict = SeqIO.to_dict(SeqIO.parse("sequences.fasta", "fasta"))
record = seq_dict["sequence_id"]
```

**2. Bio.SeqIO.index()** - Lazy-loaded dictionary (memory efficient):

```python
seq_index = SeqIO.index("sequences.fasta", "fasta")
record = seq_index["sequence_id"]
seq_index.close()
```

**3. Bio.SeqIO.index_db()** - SQLite-based index for very large files:

```python
seq_index = SeqIO.index_db("index.idx", "sequences.fasta", "fasta")
record = seq_index["sequence_id"]
seq_index.close()
```

### Low-Level Parsers for High Performance

For high-throughput sequencing data, use low-level parsers that return tuples instead of objects:

```python
from Bio.SeqIO.FastaIO import SimpleFastaParser

with open("sequences.fasta") as handle:
    for title, sequence in SimpleFastaParser(handle):
        print(title, len(sequence))

from Bio.SeqIO.QualityIO import FastqGeneralIterator

with open("reads.fastq") as handle:
    for title, sequence, quality in FastqGeneralIterator(handle):
        print(title)
```

## Compressed Files

Bio.SeqIO automatically handles compressed files:

```python
# Works with gzip compression
for record in SeqIO.parse("sequences.fasta.gz", "fasta"):
    print(record.id)

# BGZF format for random access
from Bio import bgzf
with bgzf.open("sequences.fasta.bgz", "r") as handle:
    records = SeqIO.parse(handle, "fasta")
```

## Data Extraction Patterns

### Extract Specific Information

```python
# Get all IDs
ids = [record.id for record in SeqIO.parse("file.fasta", "fasta")]

# Get sequences above length threshold
long_seqs = [record for record in SeqIO.parse("file.fasta", "fasta")
             if len(record.seq) > 500]

# Extract organism from GenBank
for record in SeqIO.parse("file.gbk", "genbank"):
    organism = record.annotations.get("organism", "Unknown")
    print(f"{record.id}: {organism}")
```

### Filter and Write

```python
# Filter sequences by criteria
long_sequences = (record for record in SeqIO.parse("input.fasta", "fasta")
                  if len(record) > 500)
SeqIO.write(long_sequences, "filtered.fasta", "fasta")
```

## Best Practices

1. **Use iterators** for large files rather than loading everything into memory
2. **Prefer index()** for repeated random access to large files
3. **Use index_db()** for millions of records or multi-file scenarios
4. **Use low-level parsers** for high-throughput data when speed is critical
5. **Download once, reuse locally** rather than repeated network access
6. **Close indexed files** explicitly or use context managers
7. **Validate input** before writing with SeqIO.write()
8. **Use appropriate format strings** - always lowercase (e.g., "fasta", not "FASTA")

## Common Use Cases

### Format Conversion

```python
# GenBank to FASTA
SeqIO.convert("input.gbk", "genbank", "output.fasta", "fasta")

# Multiple format conversion
for fmt in ["fasta", "genbank", "embl"]:
    SeqIO.convert("input.fasta", "fasta", f"output.{fmt}", fmt)
```

### Quality Filtering (FASTQ)

```python
from Bio import SeqIO

good_reads = (record for record in SeqIO.parse("reads.fastq", "fastq")
              if min(record.letter_annotations["phred_quality"]) >= 20)
count = SeqIO.write(good_reads, "filtered.fastq", "fastq")
```

### Sequence Statistics

```python
from Bio.SeqUtils import gc_fraction

for record in SeqIO.parse("sequences.fasta", "fasta"):
    gc = gc_fraction(record.seq)
    print(f"{record.id}: GC={gc:.2%}, Length={len(record)}")
```

### Creating Records Programmatically

```python
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

# Create a new record
new_record = SeqRecord(
    Seq("ATGCGATCGATCG"),
    id="seq001",
    name="MySequence",
    description="Test sequence"
)

# Write to file
SeqIO.write([new_record], "new.fasta", "fasta")
```
