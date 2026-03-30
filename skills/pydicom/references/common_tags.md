# Common DICOM Tags Reference

This document provides a comprehensive list of commonly used DICOM tags organized by category. Tags can be accessed in pydicom using attribute notation (e.g., `ds.PatientName`) or tag tuple notation (e.g., `ds[0x0010, 0x0010]`).

## Patient Information Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0010,0010) | PatientName | PN | Patient's full name |
| (0010,0020) | PatientID | LO | Primary identifier for the patient |
| (0010,0030) | PatientBirthDate | DA | Date of birth (YYYYMMDD) |
| (0010,0032) | PatientBirthTime | TM | Time of birth (HHMMSS) |
| (0010,0040) | PatientSex | CS | Patient's sex (M, F, O) |
| (0010,1010) | PatientAge | AS | Patient's age (format: nnnD/W/M/Y) |
| (0010,1020) | PatientSize | DS | Patient's height in meters |
| (0010,1030) | PatientWeight | DS | Patient's weight in kilograms |
| (0010,1040) | PatientAddress | LO | Patient's mailing address |
| (0010,2160) | EthnicGroup | SH | Ethnic group of patient |
| (0010,4000) | PatientComments | LT | Additional comments about patient |

## Study Information Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0020,000D) | StudyInstanceUID | UI | Unique identifier for the study |
| (0008,0020) | StudyDate | DA | Date study started (YYYYMMDD) |
| (0008,0030) | StudyTime | TM | Time study started (HHMMSS) |
| (0008,1030) | StudyDescription | LO | Description of the study |
| (0020,0010) | StudyID | SH | User or site-defined study identifier |
| (0008,0050) | AccessionNumber | SH | RIS-generated study identifier |
| (0008,0090) | ReferringPhysicianName | PN | Name of patient's referring physician |
| (0008,1060) | NameOfPhysiciansReadingStudy | PN | Name of physician(s) reading study |
| (0008,1080) | AdmittingDiagnosesDescription | LO | Diagnosis description at admission |

## Series Information Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0020,000E) | SeriesInstanceUID | UI | Unique identifier for the series |
| (0020,0011) | SeriesNumber | IS | Numeric identifier for this series |
| (0008,103E) | SeriesDescription | LO | Description of the series |
| (0008,0060) | Modality | CS | Type of equipment (CT, MR, US, etc.) |
| (0008,0021) | SeriesDate | DA | Date series started (YYYYMMDD) |
| (0008,0031) | SeriesTime | TM | Time series started (HHMMSS) |
| (0018,0015) | BodyPartExamined | CS | Body part examined |
| (0018,5100) | PatientPosition | CS | Patient position (HFS, FFS, etc.) |
| (0020,0060) | Laterality | CS | Laterality of paired body part (R, L) |

## Image Information Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0008,0018) | SOPInstanceUID | UI | Unique identifier for this instance |
| (0020,0013) | InstanceNumber | IS | Number that identifies this image |
| (0008,0008) | ImageType | CS | Image identification characteristics |
| (0008,0023) | ContentDate | DA | Date of content creation (YYYYMMDD) |
| (0008,0033) | ContentTime | TM | Time of content creation (HHMMSS) |
| (0020,0032) | ImagePositionPatient | DS | Position of image (x, y, z) in mm |
| (0020,0037) | ImageOrientationPatient | DS | Direction cosines of image rows/columns |
| (0020,1041) | SliceLocation | DS | Relative position of image plane |
| (0018,0050) | SliceThickness | DS | Slice thickness in mm |
| (0018,0088) | SpacingBetweenSlices | DS | Spacing between slices in mm |

## Pixel Data Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (7FE0,0010) | PixelData | OB/OW | Actual pixel data of the image |
| (0028,0010) | Rows | US | Number of rows in image |
| (0028,0011) | Columns | US | Number of columns in image |
| (0028,0100) | BitsAllocated | US | Bits allocated for each pixel sample |
| (0028,0101) | BitsStored | US | Bits stored for each pixel sample |
| (0028,0102) | HighBit | US | Most significant bit for pixel sample |
| (0028,0103) | PixelRepresentation | US | 0=unsigned, 1=signed |
| (0028,0002) | SamplesPerPixel | US | Number of samples per pixel (1 or 3) |
| (0028,0004) | PhotometricInterpretation | CS | Color space (MONOCHROME2, RGB, etc.) |
| (0028,0006) | PlanarConfiguration | US | Color pixel data arrangement |
| (0028,0030) | PixelSpacing | DS | Physical spacing [row, column] in mm |
| (0028,0008) | NumberOfFrames | IS | Number of frames in multi-frame image |
| (0028,0034) | PixelAspectRatio | IS | Ratio of vertical to horizontal pixel |

## Windowing and Display Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0028,1050) | WindowCenter | DS | Window center for display |
| (0028,1051) | WindowWidth | DS | Window width for display |
| (0028,1052) | RescaleIntercept | DS | b in output = m*SV + b |
| (0028,1053) | RescaleSlope | DS | m in output = m*SV + b |
| (0028,1054) | RescaleType | LO | Type of rescaling (HU, etc.) |
| (0028,1055) | WindowCenterWidthExplanation | LO | Explanation of window values |
| (0028,3010) | VOILUTSequence | SQ | VOI LUT description |

## CT-Specific Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0018,0060) | KVP | DS | Peak kilovoltage |
| (0018,1030) | ProtocolName | LO | Scan protocol name |
| (0018,1100) | ReconstructionDiameter | DS | Diameter of reconstruction circle |
| (0018,1110) | DistanceSourceToDetector | DS | Distance in mm |
| (0018,1111) | DistanceSourceToPatient | DS | Distance in mm |
| (0018,1120) | GantryDetectorTilt | DS | Gantry tilt in degrees |
| (0018,1130) | TableHeight | DS | Table height in mm |
| (0018,1150) | ExposureTime | IS | Exposure time in ms |
| (0018,1151) | XRayTubeCurrent | IS | X-ray tube current in mA |
| (0018,1152) | Exposure | IS | Exposure in mAs |
| (0018,1160) | FilterType | SH | X-ray filter material |
| (0018,1210) | ConvolutionKernel | SH | Reconstruction algorithm |

## MR-Specific Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0018,0080) | RepetitionTime | DS | TR in ms |
| (0018,0081) | EchoTime | DS | TE in ms |
| (0018,0082) | InversionTime | DS | TI in ms |
| (0018,0083) | NumberOfAverages | DS | Number of times data was averaged |
| (0018,0084) | ImagingFrequency | DS | Frequency in MHz |
| (0018,0085) | ImagedNucleus | SH | Nucleus that is imaged (1H, etc.) |
| (0018,0086) | EchoNumbers | IS | Echo number(s) |
| (0018,0087) | MagneticFieldStrength | DS | Field strength in Tesla |
| (0018,0088) | SpacingBetweenSlices | DS | Spacing in mm |
| (0018,0089) | NumberOfPhaseEncodingSteps | IS | Number of encoding steps |
| (0018,0091) | EchoTrainLength | IS | Number of echoes in a train |
| (0018,0093) | PercentSampling | DS | Fraction of acquisition matrix sampled |
| (0018,0094) | PercentPhaseFieldOfView | DS | Ratio of phase to frequency FOV |
| (0018,1030) | ProtocolName | LO | Scan protocol name |
| (0018,1314) | FlipAngle | DS | Flip angle in degrees |

## File Meta Information Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0002,0000) | FileMetaInformationGroupLength | UL | Length of file meta information |
| (0002,0001) | FileMetaInformationVersion | OB | Version of file meta information |
| (0002,0002) | MediaStorageSOPClassUID | UI | SOP Class UID |
| (0002,0003) | MediaStorageSOPInstanceUID | UI | SOP Instance UID |
| (0002,0010) | TransferSyntaxUID | UI | Transfer syntax UID |
| (0002,0012) | ImplementationClassUID | UI | Implementation class UID |
| (0002,0013) | ImplementationVersionName | SH | Implementation version name |

## Equipment Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0008,0070) | Manufacturer | LO | Equipment manufacturer |
| (0008,0080) | InstitutionName | LO | Institution name |
| (0008,0081) | InstitutionAddress | ST | Institution address |
| (0008,1010) | StationName | SH | Equipment station name |
| (0008,1040) | InstitutionalDepartmentName | LO | Department name |
| (0008,1050) | PerformingPhysicianName | PN | Physician performing procedure |
| (0008,1070) | OperatorsName | PN | Operator name(s) |
| (0008,1090) | ManufacturerModelName | LO | Model name |
| (0018,1000) | DeviceSerialNumber | LO | Device serial number |
| (0018,1020) | SoftwareVersions | LO | Software version(s) |

## Timing Tags

| Tag | Name | Type | Description |
|-----|------|------|-------------|
| (0008,0012) | InstanceCreationDate | DA | Date instance was created |
| (0008,0013) | InstanceCreationTime | TM | Time instance was created |
| (0008,0022) | AcquisitionDate | DA | Date acquisition started |
| (0008,0032) | AcquisitionTime | TM | Time acquisition started |
| (0008,002A) | AcquisitionDateTime | DT | Acquisition date and time |

## DICOM Value Representations (VR)

Common value representation types used in DICOM:

- **AE**: Application Entity (max 16 chars)
- **AS**: Age String (nnnD/W/M/Y)
- **CS**: Code String (max 16 chars)
- **DA**: Date (YYYYMMDD)
- **DS**: Decimal String
- **DT**: Date Time (YYYYMMDDHHMMSS.FFFFFF&ZZXX)
- **IS**: Integer String
- **LO**: Long String (max 64 chars)
- **LT**: Long Text (max 10240 chars)
- **PN**: Person Name
- **SH**: Short String (max 16 chars)
- **SQ**: Sequence of Items
- **ST**: Short Text (max 1024 chars)
- **TM**: Time (HHMMSS.FFFFFF)
- **UI**: Unique Identifier (UID)
- **UL**: Unsigned Long (4 bytes)
- **US**: Unsigned Short (2 bytes)
- **OB**: Other Byte String
- **OW**: Other Word String

## Usage Examples

### Accessing Tags by Name
```python
patient_name = ds.PatientName
study_date = ds.StudyDate
modality = ds.Modality
```

### Accessing Tags by Number
```python
patient_name = ds[0x0010, 0x0010].value
study_date = ds[0x0008, 0x0020].value
modality = ds[0x0008, 0x0060].value
```

### Checking if Tag Exists
```python
if hasattr(ds, 'PatientName'):
    print(ds.PatientName)

# Or using 'in' operator
if (0x0010, 0x0010) in ds:
    print(ds[0x0010, 0x0010].value)
```

### Safe Access with Default Value
```python
patient_name = getattr(ds, 'PatientName', 'Unknown')
study_desc = ds.get('StudyDescription', 'No description')
```

## References

- DICOM Standard: https://www.dicomstandard.org/
- DICOM Tag Browser: https://dicom.innolitics.com/ciods
- Pydicom Documentation: https://pydicom.github.io/pydicom/
