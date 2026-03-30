# Sequence Alignments with Bio.Align and Bio.AlignIO

## Overview

Bio.Align provides tools for pairwise sequence alignment using various algorithms, while Bio.AlignIO handles reading and writing multiple sequence alignment files in various formats.

## Pairwise Alignment with Bio.Align

### The PairwiseAligner Class

The `PairwiseAligner` class performs pairwise sequence alignments using Needleman-Wunsch (global), Smith-Waterman (local), Gotoh (three-state), and Waterman-Smith-Beyer algorithms. The appropriate algorithm is automatically selected based on gap score parameters.

### Creating an Aligner

```python
from Bio import Align

# Create aligner with default parameters
aligner = Align.PairwiseAligner()

# Default scores (as of Biopython 1.85+):
# - Match score: +1.0
# - Mismatch score: 0.0
# - All gap scores: -1.0
```

### Customizing Alignment Parameters

```python
# Set scoring parameters
aligner.match_score = 2.0
aligner.mismatch_score = -1.0
aligner.gap_score = -0.5

# Or use separate gap opening/extension penalties
aligner.open_gap_score = -2.0
aligner.extend_gap_score = -0.5

# Set internal gap scores separately
aligner.internal_open_gap_score = -2.0
aligner.internal_extend_gap_score = -0.5

# Set end gap scores (for semi-global alignment)
aligner.left_open_gap_score = 0.0
aligner.left_extend_gap_score = 0.0
aligner.right_open_gap_score = 0.0
aligner.right_extend_gap_score = 0.0
```

### Alignment Modes

```python
# Global alignment (default)
aligner.mode = 'global'

# Local alignment
aligner.mode = 'local'
```

### Performing Alignments

```python
from Bio.Seq import Seq

seq1 = Seq("ACCGGT")
seq2 = Seq("ACGGT")

# Get all optimal alignments
alignments = aligner.align(seq1, seq2)

# Iterate through alignments
for alignment in alignments:
    print(alignment)
    print(f"Score: {alignment.score}")

# Get just the score
score = aligner.score(seq1, seq2)
```

### Using Substitution Matrices

```python
from Bio.Align import substitution_matrices

# Load a substitution matrix
matrix = substitution_matrices.load("BLOSUM62")
aligner.substitution_matrix = matrix

# Align protein sequences
protein1 = Seq("KEVLA")
protein2 = Seq("KSVLA")
alignments = aligner.align(protein1, protein2)
```

### Available Substitution Matrices

Common matrices include:
- **BLOSUM** series (BLOSUM45, BLOSUM50, BLOSUM62, BLOSUM80, BLOSUM90)
- **PAM** series (PAM30, PAM70, PAM250)
- **MATCH** - Simple match/mismatch matrix

```python
# List available matrices
available = substitution_matrices.load()
print(available)
```

## Multiple Sequence Alignments with Bio.AlignIO

### Reading Alignments

Bio.AlignIO provides similar API to Bio.SeqIO but for alignment files:

```python
from Bio import AlignIO

# Read a single alignment
alignment = AlignIO.read("alignment.aln", "clustal")

# Parse multiple alignments from a file
for alignment in AlignIO.parse("alignments.aln", "clustal"):
    print(f"Alignment with {len(alignment)} sequences")
    print(f"Alignment length: {alignment.get_alignment_length()}")
```

### Supported Alignment Formats

Common formats include:
- **clustal** - Clustal format
- **phylip** - PHYLIP format
- **phylip-relaxed** - Relaxed PHYLIP (longer names)
- **stockholm** - Stockholm format
- **fasta** - FASTA format (aligned)
- **nexus** - NEXUS format
- **emboss** - EMBOSS alignment format
- **msf** - MSF format
- **maf** - Multiple Alignment Format

### Writing Alignments

```python
# Write alignment to file
AlignIO.write(alignment, "output.aln", "clustal")

# Convert between formats
count = AlignIO.convert("input.aln", "clustal", "output.phy", "phylip")
```

### Working with Alignment Objects

```python
from Bio import AlignIO

alignment = AlignIO.read("alignment.aln", "clustal")

# Get alignment properties
print(f"Number of sequences: {len(alignment)}")
print(f"Alignment length: {alignment.get_alignment_length()}")

# Access individual sequences
for record in alignment:
    print(f"{record.id}: {record.seq}")

# Get alignment column
column = alignment[:, 0]  # First column

# Get alignment slice
sub_alignment = alignment[:, 10:20]  # Positions 10-20

# Get specific sequence
seq_record = alignment[0]  # First sequence
```

### Alignment Analysis

```python
# Calculate alignment statistics
from Bio.Align import AlignInfo

summary = AlignInfo.SummaryInfo(alignment)

# Get consensus sequence
consensus = summary.gap_consensus(threshold=0.7)

# Position-specific scoring matrix (PSSM)
pssm = summary.pos_specific_score_matrix(consensus)

# Calculate information content
from Bio import motifs
motif = motifs.create([record.seq for record in alignment])
information = motif.counts.information_content()
```

## Creating Alignments Programmatically

### From SeqRecord Objects

```python
from Bio.Align import MultipleSeqAlignment
from Bio.SeqRecord import SeqRecord
from Bio.Seq import Seq

# Create records
records = [
    SeqRecord(Seq("ACTGCTAGCTAG"), id="seq1"),
    SeqRecord(Seq("ACT-CTAGCTAG"), id="seq2"),
    SeqRecord(Seq("ACTGCTA-CTAG"), id="seq3"),
]

# Create alignment
alignment = MultipleSeqAlignment(records)
```

### Adding Sequences to Alignments

```python
# Start with empty alignment
alignment = MultipleSeqAlignment([])

# Add sequences (must have same length)
alignment.append(SeqRecord(Seq("ACTG"), id="seq1"))
alignment.append(SeqRecord(Seq("ACTG"), id="seq2"))

# Extend with another alignment
alignment.extend(other_alignment)
```

## Advanced Alignment Operations

### Removing Gaps

```python
# Remove all gap-only columns
from Bio.Align import AlignInfo

no_gaps = []
for i in range(alignment.get_alignment_length()):
    column = alignment[:, i]
    if set(column) != {'-'}:  # Not all gaps
        no_gaps.append(column)
```

### Alignment Sorting

```python
# Sort by sequence ID
sorted_alignment = sorted(alignment, key=lambda x: x.id)
alignment = MultipleSeqAlignment(sorted_alignment)
```

### Computing Pairwise Identities

```python
def pairwise_identity(seq1, seq2):
    """Calculate percent identity between two sequences."""
    matches = sum(a == b for a, b in zip(seq1, seq2) if a != '-' and b != '-')
    length = sum(1 for a, b in zip(seq1, seq2) if a != '-' and b != '-')
    return matches / length if length > 0 else 0

# Calculate all pairwise identities
for i, record1 in enumerate(alignment):
    for record2 in alignment[i+1:]:
        identity = pairwise_identity(record1.seq, record2.seq)
        print(f"{record1.id} vs {record2.id}: {identity:.2%}")
```

## Running External Alignment Tools

### Clustal Omega (via Command Line)

```python
from Bio.Align.Applications import ClustalOmegaCommandline

# Setup command
clustal_cmd = ClustalOmegaCommandline(
    infile="sequences.fasta",
    outfile="alignment.aln",
    verbose=True,
    auto=True
)

# Run alignment
stdout, stderr = clustal_cmd()

# Read result
alignment = AlignIO.read("alignment.aln", "clustal")
```

### MUSCLE (via Command Line)

```python
from Bio.Align.Applications import MuscleCommandline

muscle_cmd = MuscleCommandline(
    input="sequences.fasta",
    out="alignment.aln"
)
stdout, stderr = muscle_cmd()
```

## Best Practices

1. **Choose appropriate scoring schemes** - Use BLOSUM62 for proteins, custom scores for DNA
2. **Consider alignment mode** - Global for similar-length sequences, local for finding conserved regions
3. **Set gap penalties carefully** - Higher penalties create fewer, longer gaps
4. **Use appropriate formats** - FASTA for simple alignments, Stockholm for rich annotation
5. **Validate alignment quality** - Check for conserved regions and percent identity
6. **Handle large alignments carefully** - Use slicing and iteration for memory efficiency
7. **Preserve metadata** - Maintain SeqRecord IDs and annotations through alignment operations

## Common Use Cases

### Find Best Local Alignment

```python
from Bio.Align import PairwiseAligner
from Bio.Seq import Seq

aligner = PairwiseAligner()
aligner.mode = 'local'
aligner.match_score = 2
aligner.mismatch_score = -1

seq1 = Seq("AGCTTAGCTAGCTAGC")
seq2 = Seq("CTAGCTAGC")

alignments = aligner.align(seq1, seq2)
print(alignments[0])
```

### Protein Sequence Alignment

```python
from Bio.Align import PairwiseAligner, substitution_matrices

aligner = PairwiseAligner()
aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")
aligner.open_gap_score = -10
aligner.extend_gap_score = -0.5

protein1 = Seq("KEVLA")
protein2 = Seq("KEVLAEQP")
alignments = aligner.align(protein1, protein2)
```

### Extract Conserved Regions

```python
from Bio import AlignIO

alignment = AlignIO.read("alignment.aln", "clustal")

# Find columns with >80% identity
conserved_positions = []
for i in range(alignment.get_alignment_length()):
    column = alignment[:, i]
    most_common = max(set(column), key=column.count)
    if column.count(most_common) / len(column) > 0.8:
        conserved_positions.append(i)

print(f"Conserved positions: {conserved_positions}")
```
