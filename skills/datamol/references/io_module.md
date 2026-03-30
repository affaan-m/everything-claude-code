# Datamol I/O Module Reference

The `datamol.io` module provides comprehensive file handling for molecular data across multiple formats.

## Reading Molecular Files

### `dm.read_sdf(filename, sanitize=True, remove_hs=True, as_df=True, mol_column='mol', ...)`
Read Structure-Data File (SDF) format.
- **Parameters**:
  - `filename`: Path to SDF file (supports local and remote paths via fsspec)
  - `sanitize`: Apply sanitization to molecules
  - `remove_hs`: Remove explicit hydrogens
  - `as_df`: Return as DataFrame (True) or list of molecules (False)
  - `mol_column`: Name of molecule column in DataFrame
  - `n_jobs`: Enable parallel processing
- **Returns**: DataFrame or list of molecules
- **Example**: `df = dm.read_sdf("compounds.sdf")`

### `dm.read_smi(filename, smiles_column='smiles', mol_column='mol', as_df=True, ...)`
Read SMILES file (space-delimited by default).
- **Common format**: SMILES followed by molecule ID/name
- **Example**: `df = dm.read_smi("molecules.smi")`

### `dm.read_csv(filename, smiles_column='smiles', mol_column=None, ...)`
Read CSV file with optional automatic SMILES-to-molecule conversion.
- **Parameters**:
  - `smiles_column`: Column containing SMILES strings
  - `mol_column`: If specified, creates molecule objects from SMILES column
- **Example**: `df = dm.read_csv("data.csv", smiles_column="SMILES", mol_column="mol")`

### `dm.read_excel(filename, sheet_name=0, smiles_column='smiles', mol_column=None, ...)`
Read Excel files with molecule handling.
- **Parameters**:
  - `sheet_name`: Sheet to read (index or name)
  - Other parameters similar to `read_csv`
- **Example**: `df = dm.read_excel("compounds.xlsx", sheet_name="Sheet1")`

### `dm.read_molblock(molblock, sanitize=True, remove_hs=True)`
Parse MOL block string (molecular structure text representation).

### `dm.read_mol2file(filename, sanitize=True, remove_hs=True, cleanupSubstructures=True)`
Read Mol2 format files.

### `dm.read_pdbfile(filename, sanitize=True, remove_hs=True, proximityBonding=True)`
Read Protein Data Bank (PDB) format files.

### `dm.read_pdbblock(pdbblock, sanitize=True, remove_hs=True, proximityBonding=True)`
Parse PDB block string.

### `dm.open_df(filename, ...)`
Universal DataFrame reader - automatically detects format.
- **Supported formats**: CSV, Excel, Parquet, JSON, SDF
- **Example**: `df = dm.open_df("data.csv")` or `df = dm.open_df("molecules.sdf")`

## Writing Molecular Files

### `dm.to_sdf(mols, filename, mol_column=None, ...)`
Write molecules to SDF file.
- **Input types**:
  - List of molecules
  - DataFrame with molecule column
  - Sequence of molecules
- **Parameters**:
  - `mol_column`: Column name if input is DataFrame
- **Example**:
  ```python
  dm.to_sdf(mols, "output.sdf")
  # or from DataFrame
  dm.to_sdf(df, "output.sdf", mol_column="mol")
  ```

### `dm.to_smi(mols, filename, mol_column=None, ...)`
Write molecules to SMILES file with optional validation.
- **Format**: SMILES strings with optional molecule names/IDs

### `dm.to_xlsx(df, filename, mol_columns=None, ...)`
Export DataFrame to Excel with rendered molecular images.
- **Parameters**:
  - `mol_columns`: Columns containing molecules to render as images
- **Special feature**: Automatically renders molecules as images in Excel cells
- **Example**: `dm.to_xlsx(df, "molecules.xlsx", mol_columns=["mol"])`

### `dm.to_molblock(mol, ...)`
Convert molecule to MOL block string.

### `dm.to_pdbblock(mol, ...)`
Convert molecule to PDB block string.

### `dm.save_df(df, filename, ...)`
Save DataFrame in multiple formats (CSV, Excel, Parquet, JSON).

## Remote File Support

All I/O functions support remote file paths through fsspec integration:
- **Supported protocols**: S3 (AWS), GCS (Google Cloud), Azure, HTTP/HTTPS
- **Example**:
  ```python
  dm.read_sdf("s3://bucket/compounds.sdf")
  dm.read_csv("https://example.com/data.csv")
  ```

## Key Parameters Across Functions

- **`sanitize`**: Apply molecule sanitization (default: True)
- **`remove_hs`**: Remove explicit hydrogens (default: True)
- **`as_df`**: Return DataFrame vs list (default: True for most functions)
- **`n_jobs`**: Enable parallel processing (None = all cores, 1 = sequential)
- **`mol_column`**: Name of molecule column in DataFrames
- **`smiles_column`**: Name of SMILES column in DataFrames
