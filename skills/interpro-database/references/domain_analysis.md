# InterPro Domain Analysis Reference

## Entry Types

| Type | Description | Example |
|------|-------------|---------|
| `family` | Group of related proteins sharing common evolutionary origin | IPR013872: p53 family |
| `domain` | Distinct structural/functional unit that can exist independently | IPR011615: p53 tetramerisation domain |
| `homologous_superfamily` | Proteins related by structure but not necessarily sequence | IPR009003: Peptidase, aspartic |
| `repeat` | Short sequence unit that occurs in multiple copies | IPR000822: Ankyrin repeat |
| `site` | Residues important for function | IPR018060: Metalloprotease active site |
| `conserved_site` | Conserved sequence motif (functional) | IPR016152: PTB/PI domain binding site |
| `active_site` | Catalytic residues | IPR000743: RING domain |
| `binding_site` | Residues involved in binding | — |
| `ptm` | Post-translational modification site | — |

## Common Domain Accessions

### Signaling Domains

| Accession | Name | Function |
|-----------|------|---------|
| IPR000719 | Protein kinase domain | ATP-dependent phosphorylation |
| IPR001245 | Serine-threonine/tyrosine-protein kinase | Kinase catalytic domain |
| IPR000980 | SH2 domain | Phosphotyrosine binding |
| IPR001452 | SH3 domain | Proline-rich sequence binding |
| IPR011993 | PH domain | Phosphoinositide binding |
| IPR000048 | IQ motif | Calmodulin binding |
| IPR000008 | C2 domain | Ca2+/phospholipid binding |
| IPR001849 | PH domain | Pleckstrin homology |

### DNA Binding Domains

| Accession | Name | Function |
|-----------|------|---------|
| IPR013087 | Zinc finger, C2H2 | DNA binding |
| IPR017456 | CCCH zinc finger | RNA binding |
| IPR011991 | Winged helix-turn-helix | Transcription factor DNA binding |
| IPR011607 | MH1 domain | SMAD DNA binding |
| IPR003313 | ARID domain | AT-rich DNA binding |
| IPR014756 | E1-E2 ATPase, nucleotide-binding | — |

### Structural Domains

| Accession | Name | Function |
|-----------|------|---------|
| IPR001357 | BRCT domain | DNA repair protein interaction |
| IPR000536 | Nuclear hormone receptor, ligand-binding | Hormone binding |
| IPR001628 | Zinc finger, nuclear hormone receptor | DNA binding (NHR) |
| IPR003961 | Fibronectin type III | Cell adhesion |
| IPR000742 | EGF-like domain | Receptor-ligand interaction |

## Domain Architecture Patterns

Common multi-domain architectures and their biological meanings:

### Receptor Tyrosine Kinases
```
[EGF domain]... - [TM] - [Kinase domain]
e.g., EGFR: IPR000742 (EGF) + IPR000719 (kinase)
```

### Adapter Proteins
```
[SH3] - [SH2] - [SH3]
e.g., Grb2, Crk — signaling adapters
```

### Nuclear Receptors
```
[DBD/C2H2 zinc finger] - [Ligand binding domain]
e.g., ERα (ESR1)
```

### Kinases
```
[N-lobe] - [Activation loop] - [C-lobe]
Standard protein kinase fold (IPR000719)
```

## GO Term Categories

InterPro GO annotations use three ontologies:

| Code | Ontology | Examples |
|------|----------|---------|
| P | Biological Process | GO:0006468 (protein phosphorylation) |
| F | Molecular Function | GO:0004672 (protein kinase activity) |
| C | Cellular Component | GO:0005886 (plasma membrane) |

## InterProScan for Novel Sequences

For protein sequences not in UniProt (novel/predicted sequences), run InterProScan:

```bash
# Command-line (install InterProScan locally)
./interproscan.sh -i my_proteins.fasta -f tsv,json -dp

# Options:
# -i: input FASTA
# -f: output formats (tsv, json, xml, gff3, html)
# -dp: disable precalculation lookup (use for non-UniProt sequences)
# --goterms: include GO term mappings
# --pathways: include pathway mappings

# Or use the web service:
# https://www.ebi.ac.uk/interpro/search/sequence/
```

**Output fields (TSV):**
1. Protein accession
2. Sequence MD5
3. Sequence length
4. Analysis (e.g., Pfam, SMART)
5. Signature accession (e.g., PF00397)
6. Signature description
7. Start
8. Stop
9. Score
10. Status (T = true)
11. Date
12. InterPro accession (if integrated)
13. InterPro description

## Useful Entry ID Collections

### Human Disease-Relevant Domains

```python
DISEASE_DOMAINS = {
    # Cancer
    "IPR011615": "p53 tetramerization",
    "IPR012346": "p53/p63/p73, tetramerization domain",
    "IPR000719": "Protein kinase domain",
    "IPR004827": "Basic-leucine zipper (bZIP) TF",

    # Neurodegenerative
    "IPR003527": "MAP kinase, ERK1/2",
    "IPR016024": "ARM-type fold",

    # Metabolic
    "IPR001764": "Glycoside hydrolase, family 13 (amylase)",
    "IPR006047": "Glycoside hydrolase superfamily",
}
```

### Commonly Referenced Pfam IDs

| Pfam ID | Domain Name |
|---------|-------------|
| PF00069 | Pkinase (protein kinase) |
| PF00076 | RRM_1 (RNA recognition motif) |
| PF00096 | zf-C2H2 (zinc finger) |
| PF00397 | WW domain |
| PF00400 | WD40 repeat |
| PF00415 | RasGEF domain |
| PF00018 | SH3 domain |
| PF00017 | SH2 domain |
| PF02196 | zf-C3HC4 (RING finger) |
