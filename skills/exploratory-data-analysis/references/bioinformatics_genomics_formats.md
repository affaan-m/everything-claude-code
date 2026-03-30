# Bioinformatics and Genomics File Formats Reference

This reference covers file formats used in genomics, transcriptomics, sequence analysis, and related bioinformatics applications.

## Sequence Data Formats

### .fasta / .fa / .fna - FASTA Format
**Description:** Text-based format for nucleotide or protein sequences
**Typical Data:** DNA, RNA, or protein sequences with headers
**Use Cases:** Sequence storage, BLAST searches, alignments
**Python Libraries:**
- `Biopython`: `SeqIO.parse('file.fasta', 'fasta')`
- `pyfaidx`: Fast indexed FASTA access
- `screed`: Fast sequence parsing
**EDA Approach:**
- Sequence count and length distribution
- GC content analysis
- N content (ambiguous bases)
- Sequence ID parsing
- Duplicate detection
- Quality metrics for assemblies (N50, L50)

### .fastq / .fq - FASTQ Format
**Description:** Sequence data with base quality scores
**Typical Data:** Raw sequencing reads with Phred quality scores
**Use Cases:** NGS data, quality control, read mapping
**Python Libraries:**
- `Biopython`: `SeqIO.parse('file.fastq', 'fastq')`
- `pysam`: Fast FASTQ/BAM operations
- `HTSeq`: Sequencing data analysis
**EDA Approach:**
- Read count and length distribution
- Quality score distribution (per-base, per-read)
- GC content and bias
- Duplicate rate estimation
- Adapter contamination detection
- k-mer frequency analysis
- Encoding format validation (Phred33/64)

### .sam - Sequence Alignment/Map
**Description:** Tab-delimited text format for alignments
**Typical Data:** Aligned sequencing reads with mapping quality
**Use Cases:** Read alignment storage, variant calling
**Python Libraries:**
- `pysam`: `pysam.AlignmentFile('file.sam', 'r')`
- `HTSeq`: `HTSeq.SAM_Reader('file.sam')`
**EDA Approach:**
- Mapping rate and quality distribution
- Coverage analysis
- Insert size distribution (paired-end)
- Alignment flags distribution
- CIGAR string patterns
- Mismatch and indel rates
- Duplicate and supplementary alignment counts

### .bam - Binary Alignment/Map
**Description:** Compressed binary version of SAM
**Typical Data:** Aligned reads in compressed format
**Use Cases:** Efficient storage and processing of alignments
**Python Libraries:**
- `pysam`: Full BAM support with indexing
- `bamnostic`: Pure Python BAM reader
**EDA Approach:**
- Same as SAM plus:
- Compression ratio analysis
- Index file (.bai) validation
- Chromosome-wise statistics
- Strand bias detection
- Read group analysis

### .cram - CRAM Format
**Description:** Highly compressed alignment format
**Typical Data:** Reference-compressed aligned reads
**Use Cases:** Long-term storage, space-efficient archives
**Python Libraries:**
- `pysam`: CRAM support (requires reference)
- Reference genome must be accessible
**EDA Approach:**
- Compression efficiency vs BAM
- Reference dependency validation
- Lossy vs lossless compression assessment
- Decompression performance
- Similar alignment metrics as BAM

### .bed - Browser Extensible Data
**Description:** Tab-delimited format for genomic features
**Typical Data:** Genomic intervals (chr, start, end) with annotations
**Use Cases:** Peak calling, variant annotation, genome browsing
**Python Libraries:**
- `pybedtools`: `pybedtools.BedTool('file.bed')`
- `pyranges`: `pyranges.read_bed('file.bed')`
- `pandas`: Simple BED reading
**EDA Approach:**
- Feature count and size distribution
- Chromosome distribution
- Strand bias
- Score distribution (if present)
- Overlap and proximity analysis
- Coverage statistics
- Gap analysis between features

### .bedGraph - BED with Graph Data
**Description:** BED format with per-base signal values
**Typical Data:** Continuous-valued genomic data (coverage, signals)
**Use Cases:** Coverage tracks, ChIP-seq signals, methylation
**Python Libraries:**
- `pyBigWig`: Can convert to bigWig
- `pybedtools`: BedGraph operations
**EDA Approach:**
- Signal distribution statistics
- Genome coverage percentage
- Signal dynamics (peaks, valleys)
- Chromosome-wise signal patterns
- Quantile analysis
- Zero-coverage regions

### .bigWig / .bw - Binary BigWig
**Description:** Indexed binary format for genome-wide signal data
**Typical Data:** Continuous genomic signals (compressed and indexed)
**Use Cases:** Efficient genome browser tracks, large-scale data
**Python Libraries:**
- `pyBigWig`: `pyBigWig.open('file.bw')`
- `pybbi`: BigWig/BigBed interface
**EDA Approach:**
- Signal statistics extraction
- Zoom level analysis
- Regional signal extraction
- Efficient genome-wide summaries
- Compression efficiency
- Index structure analysis

### .bigBed / .bb - Binary BigBed
**Description:** Indexed binary BED format
**Typical Data:** Genomic features (compressed and indexed)
**Use Cases:** Large feature sets, genome browsers
**Python Libraries:**
- `pybbi`: BigBed reading
- `pybigtools`: Modern BigBed interface
**EDA Approach:**
- Feature density analysis
- Efficient interval queries
- Zoom level validation
- Index performance metrics
- Feature size statistics

### .gff / .gff3 - General Feature Format
**Description:** Tab-delimited format for genomic annotations
**Typical Data:** Gene models, transcripts, exons, regulatory elements
**Use Cases:** Genome annotation, gene prediction
**Python Libraries:**
- `BCBio.GFF`: Biopython GFF module
- `gffutils`: `gffutils.create_db('file.gff3')`
- `pyranges`: GFF support
**EDA Approach:**
- Feature type distribution (gene, exon, CDS, etc.)
- Gene structure validation
- Strand balance
- Hierarchical relationship validation
- Phase validation for CDS
- Attribute completeness
- Gene model statistics (introns, exons per gene)

### .gtf - Gene Transfer Format
**Description:** GFF2-based format for gene annotations
**Typical Data:** Gene and transcript annotations
**Use Cases:** RNA-seq analysis, gene quantification
**Python Libraries:**
- `pyranges`: `pyranges.read_gtf('file.gtf')`
- `gffutils`: GTF database creation
- `HTSeq`: GTF reading for counts
**EDA Approach:**
- Transcript isoform analysis
- Gene structure completeness
- Exon number distribution
- Transcript length distribution
- TSS and TES analysis
- Biotype distribution
- Overlapping gene detection

### .vcf - Variant Call Format
**Description:** Text format for genetic variants
**Typical Data:** SNPs, indels, structural variants with annotations
**Use Cases:** Variant calling, population genetics, GWAS
**Python Libraries:**
- `pysam`: `pysam.VariantFile('file.vcf')`
- `cyvcf2`: Fast VCF parsing
- `PyVCF`: Older but comprehensive
**EDA Approach:**
- Variant count by type (SNP, indel, SV)
- Quality score distribution
- Allele frequency spectrum
- Transition/transversion ratio
- Heterozygosity rates
- Missing genotype analysis
- Hardy-Weinberg equilibrium
- Annotation completeness (if annotated)

### .bcf - Binary VCF
**Description:** Compressed binary variant format
**Typical Data:** Same as VCF but binary
**Use Cases:** Efficient variant storage and processing
**Python Libraries:**
- `pysam`: Full BCF support
- `cyvcf2`: Optimized BCF reading
**EDA Approach:**
- Same as VCF plus:
- Compression efficiency
- Indexing validation
- Read performance metrics

### .gvcf - Genomic VCF
**Description:** VCF with reference confidence blocks
**Typical Data:** All positions (variant and non-variant)
**Use Cases:** Joint genotyping workflows, GATK
**Python Libraries:**
- `pysam`: GVCF support
- Standard VCF parsers
**EDA Approach:**
- Reference block analysis
- Coverage uniformity
- Variant density
- Genotype quality across genome
- Reference confidence distribution

## RNA-Seq and Expression Data

### .counts - Gene Count Matrix
**Description:** Tab-delimited gene expression counts
**Typical Data:** Gene IDs with read counts per sample
**Use Cases:** RNA-seq quantification, differential expression
**Python Libraries:**
- `pandas`: `pd.read_csv('file.counts', sep='\t')`
- `scanpy` (for single-cell): `sc.read_csv()`
**EDA Approach:**
- Library size distribution
- Detection rate (genes per sample)
- Zero-inflation analysis
- Count distribution (log scale)
- Outlier sample detection
- Correlation between replicates
- PCA for sample relationships

### .tpm / .fpkm - Normalized Expression
**Description:** Normalized gene expression values
**Typical Data:** TPM (transcripts per million) or FPKM values
**Use Cases:** Cross-sample comparison, visualization
**Python Libraries:**
- `pandas`: Standard CSV reading
- `anndata`: For integrated analysis
**EDA Approach:**
- Expression distribution
- Highly expressed gene identification
- Sample clustering
- Batch effect detection
- Coefficient of variation analysis
- Dynamic range assessment

### .mtx - Matrix Market Format
**Description:** Sparse matrix format (common in single-cell)
**Typical Data:** Sparse count matrices (cells × genes)
**Use Cases:** Single-cell RNA-seq, large sparse matrices
**Python Libraries:**
- `scipy.io`: `scipy.io.mmread('file.mtx')`
- `scanpy`: `sc.read_mtx('file.mtx')`
**EDA Approach:**
- Sparsity analysis
- Cell and gene filtering thresholds
- Doublet detection metrics
- Mitochondrial fraction
- UMI count distribution
- Gene detection per cell

### .h5ad - Anndata Format
**Description:** HDF5-based annotated data matrix
**Typical Data:** Expression matrix with metadata (cells, genes)
**Use Cases:** Single-cell RNA-seq analysis with Scanpy
**Python Libraries:**
- `scanpy`: `sc.read_h5ad('file.h5ad')`
- `anndata`: Direct AnnData manipulation
**EDA Approach:**
- Cell and gene counts
- Metadata completeness
- Layer availability (raw, normalized)
- Embedding presence (PCA, UMAP)
- QC metrics distribution
- Batch information
- Cell type annotation coverage

### .loom - Loom Format
**Description:** HDF5-based format for omics data
**Typical Data:** Expression matrices with metadata
**Use Cases:** Single-cell data, RNA velocity analysis
**Python Libraries:**
- `loompy`: `loompy.connect('file.loom')`
- `scanpy`: Can import loom files
**EDA Approach:**
- Layer analysis (spliced, unspliced)
- Row and column attribute exploration
- Graph connectivity analysis
- Cluster assignments
- Velocity-specific metrics

### .rds - R Data Serialization
**Description:** R object storage (often Seurat objects)
**Typical Data:** R analysis results, especially single-cell
**Use Cases:** R-Python data exchange
**Python Libraries:**
- `pyreadr`: `pyreadr.read_r('file.rds')`
- `rpy2`: For full R integration
- Conversion tools to AnnData
**EDA Approach:**
- Object type identification
- Data structure exploration
- Metadata extraction
- Conversion validation

## Alignment and Assembly Formats

### .maf - Multiple Alignment Format
**Description:** Text format for multiple sequence alignments
**Typical Data:** Genome-wide or local multiple alignments
**Use Cases:** Comparative genomics, conservation analysis
**Python Libraries:**
- `Biopython`: `AlignIO.parse('file.maf', 'maf')`
- `bx-python`: MAF-specific tools
**EDA Approach:**
- Alignment block statistics
- Species coverage
- Gap analysis
- Conservation scoring
- Alignment quality metrics
- Block length distribution

### .axt - Pairwise Alignment Format
**Description:** Pairwise alignment format (UCSC)
**Typical Data:** Pairwise genomic alignments
**Use Cases:** Genome comparison, synteny analysis
**Python Libraries:**
- Custom parsers (simple format)
- `bx-python`: AXT support
**EDA Approach:**
- Alignment score distribution
- Identity percentage
- Syntenic block identification
- Gap size analysis
- Coverage statistics

### .chain - Chain Alignment Format
**Description:** Genome coordinate mapping chains
**Typical Data:** Coordinate transformations between genome builds
**Use Cases:** Liftover, coordinate conversion
**Python Libraries:**
- `pyliftover`: Chain file usage
- Custom parsers for chain format
**EDA Approach:**
- Chain score distribution
- Coverage of source genome
- Gap analysis
- Inversion detection
- Mapping quality assessment

### .psl - Pattern Space Layout
**Description:** BLAT/BLAST alignment format
**Typical Data:** Alignment results from BLAT
**Use Cases:** Transcript mapping, similarity searches
**Python Libraries:**
- Custom parsers (tab-delimited)
- `pybedtools`: Can handle PSL
**EDA Approach:**
- Match percentage distribution
- Gap statistics
- Query coverage
- Multiple mapping analysis
- Alignment quality metrics

## Genome Assembly and Annotation

### .agp - Assembly Golden Path
**Description:** Assembly structure description
**Typical Data:** Scaffold composition, gap information
**Use Cases:** Genome assembly representation
**Python Libraries:**
- Custom parsers (simple tab-delimited)
- Assembly analysis tools
**EDA Approach:**
- Scaffold statistics (N50, L50)
- Gap type and size distribution
- Component length analysis
- Assembly contiguity metrics
- Unplaced contig analysis

### .scaffolds / .contigs - Assembly Sequences
**Description:** Assembled sequences (usually FASTA)
**Typical Data:** Assembled genomic sequences
**Use Cases:** Genome assembly output
**Python Libraries:**
- Same as FASTA format
- Assembly-specific tools (QUAST)
**EDA Approach:**
- Assembly statistics (N50, N90, etc.)
- Length distribution
- Coverage analysis
- Gap (N) content
- Duplication assessment
- BUSCO completeness (if annotations available)

### .2bit - Compressed Genome Format
**Description:** UCSC compact genome format
**Typical Data:** Reference genomes (highly compressed)
**Use Cases:** Efficient genome storage and access
**Python Libraries:**
- `py2bit`: `py2bit.open('file.2bit')`
- `twobitreader`: Alternative reader
**EDA Approach:**
- Compression efficiency
- Random access performance
- Sequence extraction validation
- Masked region analysis
- N content and distribution

### .sizes - Chromosome Sizes
**Description:** Simple format with chromosome lengths
**Typical Data:** Tab-delimited chromosome names and sizes
**Use Cases:** Genome browsers, coordinate validation
**Python Libraries:**
- Simple file reading with pandas
- Built into many genomic tools
**EDA Approach:**
- Genome size calculation
- Chromosome count
- Size distribution
- Karyotype validation
- Completeness check against reference

## Phylogenetics and Evolution

### .nwk / .newick - Newick Tree Format
**Description:** Parenthetical tree representation
**Typical Data:** Phylogenetic trees with branch lengths
**Use Cases:** Evolutionary analysis, tree visualization
**Python Libraries:**
- `Biopython`: `Phylo.read('file.nwk', 'newick')`
- `ete3`: `ete3.Tree('file.nwk')`
- `dendropy`: Phylogenetic computing
**EDA Approach:**
- Tree structure analysis (tips, internal nodes)
- Branch length distribution
- Tree balance metrics
- Ultrametricity check
- Bootstrap support analysis
- Topology validation

### .nexus - Nexus Format
**Description:** Rich format for phylogenetic data
**Typical Data:** Alignments, trees, character matrices
**Use Cases:** Phylogenetic software interchange
**Python Libraries:**
- `Biopython`: Nexus support
- `dendropy`: Comprehensive Nexus handling
**EDA Approach:**
- Data block analysis
- Character type distribution
- Tree block validation
- Taxa consistency
- Command block parsing
- Format compliance checking

### .phylip - PHYLIP Format
**Description:** Sequence alignment format (strict/relaxed)
**Typical Data:** Multiple sequence alignments
**Use Cases:** Phylogenetic analysis input
**Python Libraries:**
- `Biopython`: `AlignIO.read('file.phy', 'phylip')`
- `dendropy`: PHYLIP support
**EDA Approach:**
- Alignment dimensions
- Sequence length uniformity
- Gap position analysis
- Informative site calculation
- Format variant detection (strict vs relaxed)

### .paml - PAML Output
**Description:** Output from PAML phylogenetic software
**Typical Data:** Evolutionary model results, dN/dS ratios
**Use Cases:** Molecular evolution analysis
**Python Libraries:**
- Custom parsers for specific PAML programs
- `Biopython`: Basic PAML parsing
**EDA Approach:**
- Model parameter extraction
- Likelihood values
- dN/dS ratio distribution
- Branch-specific results
- Convergence assessment

## Protein and Structure Data

### .embl - EMBL Format
**Description:** Rich sequence annotation format
**Typical Data:** Sequences with extensive annotations
**Use Cases:** Sequence databases, genome records
**Python Libraries:**
- `Biopython`: `SeqIO.read('file.embl', 'embl')`
**EDA Approach:**
- Feature annotation completeness
- Sequence length and type
- Reference information
- Cross-reference validation
- Feature overlap analysis

### .genbank / .gb / .gbk - GenBank Format
**Description:** NCBI's sequence annotation format
**Typical Data:** Annotated sequences with features
**Use Cases:** Sequence databases, annotation transfer
**Python Libraries:**
- `Biopython`: `SeqIO.parse('file.gb', 'genbank')`
**EDA Approach:**
- Feature type distribution
- CDS analysis (start codons, stops)
- Translation validation
- Annotation completeness
- Source organism extraction
- Reference and publication info
- Locus tag consistency

### .sff - Standard Flowgram Format
**Description:** 454/Roche sequencing data format
**Typical Data:** Raw pyrosequencing flowgrams
**Use Cases:** Legacy 454 sequencing data
**Python Libraries:**
- `Biopython`: `SeqIO.parse('file.sff', 'sff')`
- Platform-specific tools
**EDA Approach:**
- Read count and length
- Flowgram signal quality
- Key sequence detection
- Adapter trimming validation
- Quality score distribution

### .hdf5 (Genomics Specific)
**Description:** HDF5 for genomics (10X, Hi-C, etc.)
**Typical Data:** High-throughput genomics data
**Use Cases:** 10X Genomics, spatial transcriptomics
**Python Libraries:**
- `h5py`: Low-level access
- `scanpy`: For 10X data
- `cooler`: For Hi-C data
**EDA Approach:**
- Dataset structure exploration
- Barcode statistics
- UMI counting
- Feature-barcode matrix analysis
- Spatial coordinates (if applicable)

### .cool / .mcool - Cooler Format
**Description:** HDF5-based Hi-C contact matrices
**Typical Data:** Chromatin interaction matrices
**Use Cases:** 3D genome analysis, Hi-C data
**Python Libraries:**
- `cooler`: `cooler.Cooler('file.cool')`
- `hicstraw`: For .hic format
**EDA Approach:**
- Resolution analysis
- Contact matrix statistics
- Distance decay curves
- Compartment analysis
- TAD boundary detection
- Balance factor validation

### .hic - Hi-C Binary Format
**Description:** Juicer binary Hi-C format
**Typical Data:** Multi-resolution Hi-C matrices
**Use Cases:** Hi-C analysis with Juicer tools
**Python Libraries:**
- `hicstraw`: `hicstraw.HiCFile('file.hic')`
- `straw`: C++ library with Python bindings
**EDA Approach:**
- Available resolutions
- Normalization methods
- Contact statistics
- Chromosomal interactions
- Quality metrics

### .bw (ChIP-seq / ATAC-seq specific)
**Description:** BigWig files for epigenomics
**Typical Data:** Coverage or enrichment signals
**Use Cases:** ChIP-seq, ATAC-seq, DNase-seq
**Python Libraries:**
- `pyBigWig`: Standard bigWig access
**EDA Approach:**
- Peak enrichment patterns
- Background signal analysis
- Sample correlation
- Signal-to-noise ratio
- Library complexity metrics

### .narrowPeak / .broadPeak - ENCODE Peak Formats
**Description:** BED-based formats for peaks
**Typical Data:** Peak calls with scores and p-values
**Use Cases:** ChIP-seq peak calling output
**Python Libraries:**
- `pybedtools`: BED-compatible
- Custom parsers for peak-specific fields
**EDA Approach:**
- Peak count and width distribution
- Signal value distribution
- Q-value and p-value analysis
- Peak summit analysis
- Overlap with known features
- Motif enrichment preparation

### .wig - Wiggle Format
**Description:** Dense continuous genomic data
**Typical Data:** Coverage or signal tracks
**Use Cases:** Genome browser visualization
**Python Libraries:**
- `pyBigWig`: Can convert to bigWig
- Custom parsers for wiggle format
**EDA Approach:**
- Signal statistics
- Coverage metrics
- Format variant (fixedStep vs variableStep)
- Span parameter analysis
- Conversion efficiency to bigWig

### .ab1 - Sanger Sequencing Trace
**Description:** Binary chromatogram format
**Typical Data:** Sanger sequencing traces
**Use Cases:** Capillary sequencing validation
**Python Libraries:**
- `Biopython`: `SeqIO.read('file.ab1', 'abi')`
- `tracy` tools: For quality assessment
**EDA Approach:**
- Base calling quality
- Trace quality scores
- Mixed base detection
- Primer and vector detection
- Read length and quality region
- Heterozygosity detection

### .scf - Standard Chromatogram Format
**Description:** Sanger sequencing chromatogram
**Typical Data:** Base calls and confidence values
**Use Cases:** Sequencing trace analysis
**Python Libraries:**
- `Biopython`: SCF format support
**EDA Approach:**
- Similar to AB1 format
- Quality score profiles
- Peak height ratios
- Signal-to-noise metrics

### .idx - Index Files (Generic)
**Description:** Index files for various formats
**Typical Data:** Fast random access indices
**Use Cases:** Efficient data access (BAM, VCF, etc.)
**Python Libraries:**
- Format-specific libraries handle indices
- `pysam`: Auto-handles BAI, CSI indices
**EDA Approach:**
- Index completeness validation
- Binning strategy analysis
- Access performance metrics
- Index size vs data size ratio
