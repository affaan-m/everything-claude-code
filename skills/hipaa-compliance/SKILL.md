---
name: hipaa-compliance
description: A general-purpose compliance advisor for systems that store, process, or transmit Protected Health Information (PHI). Language- and database-agnostic. Applies to any architecture.
origin: ECC
---

# HIPAA Compliance Skill

Activates automatically when detecting healthcare context — patient records, medical data, health identifiers, clinical systems, EHR/EMR, insurance data, or any mention of HIPAA, PHI, or HL7/FHIR. Also activates when the user explicitly asks about HIPAA compliance. Use this skill whenever building, reviewing, or designing any system that may touch sensitive health data, even if HIPAA is not explicitly mentioned. Produces compliance checklists, architecture guidance, and tiered anti-pattern warnings (warn for minor issues, block for critical ones).

---

## When to Use

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

## How It Works

HIPAA compliance functions by enforcing the "Minimum Necessary" rule through a combination of administrative, physical, and technical safeguards to ensure the Confidentiality, Integrity, and Availability (CIA) of Protected Health Information (PHI).

### Core Function Pillars

- **Identification**: Determining if a data element (like an IP address, name, or medical ID) qualifies as PHI or ePHI.
- **Encryption**: Protecting data "at rest" (on your hard drive) and "in transit" (moving over the network) using industry-standard protocols like AES-256 and TLS 1.2+.
- **Access Control**: Implementing Role-Based Access Control (RBAC) to ensure only authorized personnel can view specific health data.
- **Auditability**: Maintaining "Always-On" logging to track who accessed what data and when, providing a permanent trail for compliance reviews.

---

## Severity Tiers

### CRITICAL — Block

Stop and require remediation before proceeding. These represent direct HIPAA violations or high breach risk:

- PHI stored unencrypted at rest
- PHI transmitted over HTTP (no TLS)
- PHI logged to application logs
- No authentication on PHI endpoints
- No access control or authorization checks
- Real PHI used in dev/test/staging environments
- Third-party service receiving PHI without a BAA

### WARNING — Flag and Fix

Flag these issues and recommend fixes, but don't block:

- Missing audit log for a PHI access or mutation
- Overly broad data returned (violates minimum necessary)
- Missing field-level encryption for highly sensitive identifiers (SSN, MRN)
- Retention policy not defined or not enforced
- No rate limiting on PHI endpoints
- Error messages that leak PHI or internal system details
- Missing input validation on PHI fields

### ADVISORY — Recommend

Best practice guidance with no immediate risk:

- Prefer tokenization over storing raw identifiers
- Consider pseudonymization for analytics use cases
- Add PHI classification tags to schema fields
- Document data flows involving PHI
- Define and test breach notification runbook

---

## Compliance Checklists

### New System / Feature Checklist

Run this when building anything that touches PHI:

**Data Design**

- [ ] PHI fields identified and documented in schema
- [ ] PHI fields encrypted at rest (column-level or full-disk at minimum)
- [ ] Sensitive identifiers (SSN, MRN) tokenized or hashed where possible
- [ ] Retention policy defined for all PHI entities
- [ ] De-identification strategy defined for analytics/reporting

**Access Control**

- [ ] Authentication required for all PHI endpoints
- [ ] Authorization checks validate that the requesting user/service has rights to the specific record
- [ ] Role-based or attribute-based access control applied
- [ ] Least privilege enforced — no broad `SELECT *` on PHI tables by application users
- [ ] Service-to-service calls use scoped credentials, not admin keys

**Data Transmission**

- [ ] All PHI transmitted over TLS 1.2+ (HTTPS enforced, no HTTP fallback)
- [ ] Internal service communication also encrypted (not just external)
- [ ] File exports containing PHI encrypted before delivery

**Audit Logging**

- [ ] Every PHI read, write, update, and delete is logged
- [ ] Log records include: user/service ID, action, resource ID, timestamp
- [ ] No PHI values appear in log output (log IDs and events, not content)
- [ ] Audit logs are immutable and stored separately from application logs
- [ ] Log retention follows applicable state laws and organizational data retention policies.

**Third Parties**

- [ ] All vendors receiving PHI have a signed BAA
- [ ] Cloud infrastructure (storage, compute, DB) covered by BAA
- [ ] No PHI sent to analytics, error tracking, or logging services without PHI scrubbing

**Environments**

- [ ] Dev and staging environments use synthetic or anonymized data only
- [ ] No mechanism exists to accidentally copy production PHI to lower environments
- [ ] CI/CD pipelines do not have access to production PHI

**Incident Response**

- [ ] Breach detection alerts defined (anomalous access patterns, bulk exports)
- [ ] Breach notification runbook exists (HIPAA requires 60-day notification)
- [ ] On-call escalation path documented

---

### Code Review Checklist

Run this when reviewing code that handles PHI:

- [ ] No PHI values in log statements, error messages, or exception traces
- [ ] No PHI in URL query parameters (use POST body or path params with UUIDs only)
- [ ] API responses follow minimum necessary — no extra PHI fields returned
- [ ] All endpoints have authentication middleware applied
- [ ] Authorization validates record ownership, not just authentication
- [ ] Database queries use parameterized inputs (no string interpolation)
- [ ] Bulk export/download operations are rate-limited and logged
- [ ] File uploads containing PHI are validated, encrypted, and access-controlled

---

## Architecture Guidance

### PHI Data Storage

- **Structured (SQL/NoSQL):** Encrypt columns containing PHI identifiers. Use a KMS-managed key, not application-level secrets. Avoid storing raw SSNs — store a one-way hash or token instead.
- **Unstructured (files, documents, blobs):** Encrypt at rest using server-side encryption with customer-managed keys. Enforce access via signed URLs with short TTLs — never public URLs.
- **Search indexes:** Do not index raw PHI. Index de-identified tokens or use a PHI-aware search service covered by a BAA.
- **Caches (Redis, Memcached):** Treat cached PHI with the same controls as persistent storage. Set aggressive TTLs. Encrypt if the cache is shared across tenants.
- **Message queues / event streams:** PHI in events must be encrypted in transit and at rest. Consumer services must be access-controlled. Dead-letter queues containing PHI must also be secured.

### API Design

- Use opaque IDs (UUIDs) — never expose MRNs or SSNs in URLs
- Return only the fields required for the consuming use case
- Implement field-level filtering so callers can't over-fetch
- Version your APIs to avoid breaking audit trails when schemas change
- Use FHIR R4 resource models when interoperability is required

### Access Control Patterns

```
Request → AuthN (who are you?) → AuthZ (are you allowed this record?) → PHI Access → Audit Log
```

- Never shortcut the record-level ownership check — authenticating a user does not mean they can access any patient record
- For multi-tenant systems, enforce tenant isolation at the query layer, not just the application layer
- Background jobs and batch processes need their own scoped service accounts with audit logging

### Audit Logging Pattern

```
{
  "timestamp": "ISO-8601",
  "actor_id": "user or service identifier",
  "actor_type": "human | service",
  "action": "read | write | update | delete | export",
  "resource_type": "Patient | Encounter | Observation | ...",
  "resource_id": "opaque UUID",
  "outcome": "success | denied | error",
  "ip_address": "client IP",
  "request_id": "trace ID"
}
```

**Never include PHI values in the log record itself.**

---

## Examples

### 1. Data Analysis (Compliant vs. Non-Compliant)

- **Non-Compliant:** A data analyst downloads a CSV containing patient names and heart rates to their local machine to run a Python script.
- **Compliant:** The analyst uses a de-identified dataset that satisfies HIPAA Safe Harbor (all 18 identifiers removed, or expert determination documented), and performs analysis only in a HIPAA-eligible environment with a signed BAA and appropriate access/audit controls.

### 2. Application Logging

- **Non-Compliant:**

  ```python
  logger.info(f"User {patient_name} updated their prescription for {medication_name}")
  ```

- **Compliant:**

  ```python
  logger.info(f"User {user_id} updated a record in the 'Prescriptions' table")
  ```

  _Note: The specific health data is kept in the encrypted database, not the plaintext application logs._

---

## Anti-Patterns

### CRITICAL

**Logging PHI**

```python
# BLOCK — PHI in logs
logger.info(f"Loaded patient record: {patient.ssn}, {patient.dob}")

# Log the event, not the data
logger.info(f"Patient record accessed", extra={"resource_id": patient.id, "actor": user.id})
```

**Unencrypted endpoint**

```python
# BLOCK — HTTP, no auth, no authz
@app.route("/patients/<id>")
def get_patient(id):
    return db.query(f"SELECT * FROM patients WHERE id={id}")

# HTTPS enforced, authenticated, authorized, parameterized
@app.route("/patients/<uuid:id>")
@require_auth
def get_patient(id):
    patient = Patient.objects.get(pk=id)
    if not request.user.can_access(patient):
        abort(403)
    audit_log("read", "Patient", id, request.user)
    return PatientSerializer(patient, scope="minimum_necessary").data
```

**PHI in test data**

```
# BLOCK — real PHI in fixture
{"name": "Jane Doe", "ssn": "123-45-6789", "dob": "1980-03-15"}

# Synthetic data
{"name": "Test Patient", "ssn": "000-00-0000", "dob": "1900-01-01"}
```

### WARNING

**Over-fetching PHI**

```python
# WARNING — returns all fields, caller only needs name and status
return PatientSerializer(patient).data

# Return only what's needed
return PatientSerializer(patient, fields=["id", "display_name", "status"]).data
```

**Missing audit on mutation**

```python
# WARNING — update with no audit trail
patient.diagnosis = new_diagnosis
patient.save()

# Audit the change
patient.diagnosis = new_diagnosis
patient.save()
audit_log("update", "Patient.diagnosis", patient.id, request.user)
```

**PHI in URL**

```
# WARNING — SSN in URL ends up in server logs, browser history, referrer headers
GET /patients?ssn=123-45-6789

# Use opaque ID only
GET /patients/a3f7c291-...
```

---

## Third-Party Integration Guide

Before sending any PHI to an external service, verify:

1. **BAA exists** — signed agreement on file
2. **HIPAA compliance certification** — check vendor's documentation
3. **Data processing scope** — confirm vendor won't use PHI for training, analytics, or re-identification
4. **Data residency** — confirm PHI stays in required regions

**Common services requiring BAA before PHI use:**

- Cloud providers (AWS, GCP, Azure — all offer BAA, must be activated)
- Email/SMS services (Twilio, SendGrid — offer HIPAA tiers)
- Error tracking (Sentry, Datadog — scrub PHI before sending, or use HIPAA tier)
- LLMs/AI APIs — scrub or de-identify before sending; most do not offer BAA by default

---

## AI / LLM Usage with PHI

**Never send raw PHI to an LLM API without a BAA and explicit controls.**

Safe patterns:

- De-identify before sending: strip all 18 identifiers, replace with synthetic placeholders
- Use a PHI-redaction layer (e.g., AWS Comprehend Medical, regex + NER pipeline) before the LLM call
- Confirm the LLM provider has a BAA and a HIPAA-eligible service tier
- Log what was sent and received (without PHI content) for auditability

---

## Data Lifecycle

| Phase        | Requirement                                                    |
| ------------ | -------------------------------------------------------------- |
| Collection   | Minimum necessary only; document purpose                       |
| Storage      | Encrypted at rest; access controlled; retention policy set     |
| Processing   | Audit logged; least privilege; no PHI in logs                  |
| Transmission | TLS 1.2+; encrypted payloads for file transfer                 |
| Retention    | HIPAA minimum 6 years from creation or last effective date     |
| Deletion     | Secure deletion (not just soft delete); log the deletion event |
| Breach       | Notify HHS and affected individuals within 60 days             |

---

## Related Skills

- `architecture-decision-records` — record HIPAA-relevant architectural decisions as ADRs
- `api-design` — apply minimum necessary and secure design to API contracts
- `healthcare-phi-compliance` — PHI/PII compliance patterns (RLS, schema tagging, multi-framework coverage including DISHA and GDPR)
