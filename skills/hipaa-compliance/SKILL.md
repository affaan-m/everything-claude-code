---
name: hipaa-compliance
description: A general-purpose compliance advisor for systems that store, process, or transmit Protected Health Information (PHI). Language and database-agnostic. Applies to any architecture.
origin: ECC
---

# HIPAA Compliance Skill

Activates automatically when detecting healthcare context — patient records, medical data, health identifiers, clinical systems, EHR/EMR, insurance data, or any mention of HIPAA, PHI, or HL7/FHIR. Also activates when the user explicitly asks about HIPAA compliance. Use this skill whenever building, reviewing, or designing any system that may touch sensitive health data, even if HIPAA is not explicitly mentioned. Produces compliance checklists, architecture guidance, and tiered anti-pattern warnings (warn for minor issues, block for critical ones). A general-purpose compliance advisor for systems that store, process, or transmit Protected Health Information (PHI). Language- and database-agnostic. Applies to any architecture.

---

## When to Activate

### Auto-detect (no explicit mention needed)

- Terms: `patient`, `medical record`, `health data`, `diagnosis`, `prescription`, `EHR`, `EMR`, `clinical`, `lab result`, `insurance claim`, `health plan`, `provider`, `beneficiary`
- Identifiers: SSN, DOB, MRN (medical record number), NPI (provider identifier)
- Standards: FHIR, HL7, ICD-10, CPT codes
- Architectures: healthcare API, patient portal, telehealth system, health data pipeline

### Explicit activation

- User mentions "HIPAA", "PHI", "protected health information", "BAA", "covered entity"
- User asks "is this HIPAA compliant?" or "how do I make this HIPAA compliant?"

---

## Core Concepts

| Term                   | Definition                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **PHI**                | Any data that can identify a patient — directly or indirectly — combined with health information |
| **Covered Entity**     | Health plans, clearinghouses, and healthcare providers who transmit PHI electronically           |
| **Business Associate** | Vendors/services that handle PHI on behalf of a covered entity (requires BAA)                    |
| **BAA**                | Business Associate Agreement — contract required before sharing PHI with a third party           |
| **Minimum Necessary**  | Only access or expose the least amount of PHI required for a given task                          |
| **De-identification**  | Removing 18 HIPAA identifiers so data no longer qualifies as PHI                                 |

### The 18 PHI Identifiers

Names, geographic data (smaller than state), dates (except year) related to an individual, phone numbers, fax numbers, email addresses, SSNs, MRNs, health plan beneficiary numbers, account numbers, certificate/license numbers, VINs, device identifiers, URLs, IPs, biometrics, full-face photos, and any other unique identifying number or code.

---
