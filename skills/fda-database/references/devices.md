# FDA Medical Device Databases

This reference covers all FDA medical device-related API endpoints accessible through openFDA.

## Overview

The FDA device databases provide access to information about medical devices, including adverse events, recalls, approvals, registrations, and classification data. Medical devices range from simple items like tongue depressors to complex instruments like pacemakers and surgical robots.

## Device Classification System

Medical devices are classified into three categories based on risk:

- **Class I**: Low risk (e.g., bandages, examination gloves)
- **Class II**: Moderate risk (e.g., powered wheelchairs, infusion pumps)
- **Class III**: High risk (e.g., heart valves, implantable pacemakers)

## Available Endpoints

### 1. Device Adverse Events

**Endpoint**: `https://api.fda.gov/device/event.json`

**Purpose**: Access reports documenting serious injuries, deaths, malfunctions, and other undesirable effects from medical device use.

**Data Source**: Manufacturer and User Facility Device Experience (MAUDE) database

**Key Fields**:
- `device.brand_name` - Brand name of device
- `device.generic_name` - Generic device name
- `device.manufacturer_d_name` - Manufacturer name
- `device.device_class` - Device class (1, 2, or 3)
- `event_type` - Type of event (Death, Injury, Malfunction, Other)
- `date_received` - Date FDA received report
- `mdr_report_key` - Unique report identifier
- `adverse_event_flag` - Whether reported as adverse event
- `product_problem_flag` - Whether product problem reported
- `patient.patient_problems` - Patient problems/complications
- `device.openfda.device_name` - Official device name
- `device.openfda.medical_specialty_description` - Medical specialty
- `remedial_action` - Actions taken (recall, repair, replace, etc.)

**Common Use Cases**:
- Post-market surveillance
- Safety signal detection
- Device comparison studies
- Risk analysis
- Quality improvement

**Example Queries**:
```python
import requests

api_key = "YOUR_API_KEY"
url = "https://api.fda.gov/device/event.json"

# Find adverse events for a specific device
params = {
    "api_key": api_key,
    "search": "device.brand_name:pacemaker",
    "limit": 10
}

response = requests.get(url, params=params)
data = response.json()
```

```python
# Count events by type
params = {
    "api_key": api_key,
    "search": "device.generic_name:insulin+pump",
    "count": "event_type"
}
```

```python
# Find death events for Class III devices
params = {
    "api_key": api_key,
    "search": "event_type:Death+AND+device.device_class:3",
    "limit": 50,
    "sort": "date_received:desc"
}
```

### 2. Device 510(k) Clearances

**Endpoint**: `https://api.fda.gov/device/510k.json`

**Purpose**: Access 510(k) premarket notification data demonstrating device equivalence to legally marketed predicate devices.

**Data Source**: 510(k) Premarket Notifications

**Key Fields**:
- `k_number` - 510(k) number (unique identifier)
- `applicant` - Company submitting 510(k)
- `device_name` - Name of device
- `device_class` - Device classification (1, 2, or 3)
- `decision_date` - Date of FDA decision
- `decision_description` - Substantially Equivalent (SE) or Not SE
- `product_code` - FDA product code
- `statement_or_summary` - Type of summary provided
- `clearance_type` - Traditional, Special, Abbreviated, etc.
- `expedited_review_flag` - Whether expedited review
- `advisory_committee` - Advisory committee name
- `openfda.device_name` - Official device name
- `openfda.device_class` - Device class description
- `openfda.medical_specialty_description` - Medical specialty
- `openfda.regulation_number` - CFR regulation number

**Common Use Cases**:
- Regulatory pathway research
- Predicate device identification
- Market entry analysis
- Competitive intelligence
- Device development planning

**Example Queries**:
```python
# Find 510(k) clearances by company
params = {
    "api_key": api_key,
    "search": "applicant:Medtronic",
    "limit": 50,
    "sort": "decision_date:desc"
}

response = requests.get("https://api.fda.gov/device/510k.json", params=params)
```

```python
# Search for specific device type clearances
params = {
    "api_key": api_key,
    "search": "device_name:*surgical+robot*",
    "limit": 10
}
```

```python
# Get all Class III 510(k) clearances in recent year
params = {
    "api_key": api_key,
    "search": "device_class:3+AND+decision_date:[20240101+TO+20241231]",
    "limit": 100
}
```

### 3. Device Classification

**Endpoint**: `https://api.fda.gov/device/classification.json`

**Purpose**: Access device classification database with medical device names, product codes, medical specialty panels, and classification information.

**Data Source**: FDA Device Classification Database

**Key Fields**:
- `product_code` - Three-letter FDA product code
- `device_name` - Official device name
- `device_class` - Class (1, 2, or 3)
- `medical_specialty` - Medical specialty (e.g., Radiology, Cardiovascular)
- `medical_specialty_description` - Full specialty description
- `regulation_number` - CFR regulation number (e.g., 21 CFR 870.2300)
- `review_panel` - FDA review panel
- `definition` - Official device definition
- `physical_state` - Solid, liquid, gas
- `technical_method` - Method of operation
- `target_area` - Body area/system targeted
- `gmp_exempt_flag` - Whether exempt from Good Manufacturing Practice
- `implant_flag` - Whether device is implanted
- `life_sustain_support_flag` - Whether life-sustaining/supporting

**Common Use Cases**:
- Device identification
- Regulatory requirement determination
- Product code lookup
- Classification research
- Device categorization

**Example Queries**:
```python
# Look up device by product code
params = {
    "api_key": api_key,
    "search": "product_code:LWL",
    "limit": 1
}

response = requests.get("https://api.fda.gov/device/classification.json", params=params)
```

```python
# Find all cardiovascular devices
params = {
    "api_key": api_key,
    "search": "medical_specialty:CV",
    "limit": 100
}
```

```python
# Get all implantable Class III devices
params = {
    "api_key": api_key,
    "search": "device_class:3+AND+implant_flag:Y",
    "limit": 50
}
```

### 4. Device Recall Enforcement Reports

**Endpoint**: `https://api.fda.gov/device/enforcement.json`

**Purpose**: Access medical device product recall enforcement reports.

**Data Source**: FDA Enforcement Reports

**Key Fields**:
- `status` - Current status (Ongoing, Completed, Terminated)
- `recall_number` - Unique recall identifier
- `classification` - Class I, II, or III
- `product_description` - Description of recalled device
- `reason_for_recall` - Why device was recalled
- `product_quantity` - Amount of product recalled
- `code_info` - Lot numbers, serial numbers, model numbers
- `distribution_pattern` - Geographic distribution
- `recalling_firm` - Company conducting recall
- `recall_initiation_date` - When recall began
- `report_date` - When FDA received notice
- `product_res_number` - Product problem number

**Common Use Cases**:
- Quality monitoring
- Supply chain risk management
- Patient safety tracking
- Regulatory compliance
- Device surveillance

**Example Queries**:
```python
# Find all Class I device recalls (most serious)
params = {
    "api_key": api_key,
    "search": "classification:Class+I",
    "limit": 20,
    "sort": "report_date:desc"
}

response = requests.get("https://api.fda.gov/device/enforcement.json", params=params)
```

```python
# Search recalls by manufacturer
params = {
    "api_key": api_key,
    "search": "recalling_firm:*Philips*",
    "limit": 50
}
```

### 5. Device Recalls

**Endpoint**: `https://api.fda.gov/device/recall.json`

**Purpose**: Access information about device recalls addressing problems that violate FDA law or pose health risks.

**Data Source**: FDA Recalls Database

**Key Fields**:
- `res_event_number` - Recall event number
- `product_code` - FDA product code
- `openfda.device_name` - Device name
- `openfda.device_class` - Device class
- `product_res_number` - Product recall number
- `firm_fei_number` - Firm establishment identifier
- `k_numbers` - Associated 510(k) numbers
- `pma_numbers` - Associated PMA numbers
- `root_cause_description` - Root cause of issue

**Common Use Cases**:
- Recall tracking
- Quality investigation
- Root cause analysis
- Trend identification

**Example Queries**:
```python
# Search recalls by product code
params = {
    "api_key": api_key,
    "search": "product_code:DQY",
    "limit": 20
}

response = requests.get("https://api.fda.gov/device/recall.json", params=params)
```

### 6. Premarket Approval (PMA)

**Endpoint**: `https://api.fda.gov/device/pma.json`

**Purpose**: Access data from FDA's premarket approval process for Class III medical devices.

**Data Source**: PMA Database

**Key Fields**:
- `pma_number` - PMA application number (e.g., P850005)
- `supplement_number` - Supplement number if applicable
- `applicant` - Company name
- `trade_name` - Trade/brand name
- `generic_name` - Generic name
- `product_code` - FDA product code
- `decision_date` - Date of FDA decision
- `decision_code` - Approval status (APPR = approved)
- `advisory_committee` - Advisory committee
- `openfda.device_name` - Official device name
- `openfda.device_class` - Device class
- `openfda.medical_specialty_description` - Medical specialty
- `openfda.regulation_number` - Regulation number

**Common Use Cases**:
- High-risk device research
- Approval timeline analysis
- Regulatory strategy
- Market intelligence
- Clinical trial planning

**Example Queries**:
```python
# Find PMA approvals by company
params = {
    "api_key": api_key,
    "search": "applicant:Boston+Scientific",
    "limit": 50
}

response = requests.get("https://api.fda.gov/device/pma.json", params=params)
```

```python
# Search for specific device PMAs
params = {
    "api_key": api_key,
    "search": "generic_name:*cardiac+pacemaker*",
    "limit": 10
}
```

### 7. Registrations and Listings

**Endpoint**: `https://api.fda.gov/device/registrationlisting.json`

**Purpose**: Access location data for medical device establishments and devices they manufacture.

**Data Source**: Device Registration and Listing Database

**Key Fields**:
- `registration.fei_number` - Facility establishment identifier
- `registration.name` - Facility name
- `registration.registration_number` - Registration number
- `registration.reg_expiry_date_year` - Registration expiration year
- `registration.address_line_1` - Street address
- `registration.city` - City
- `registration.state_code` - State/province
- `registration.iso_country_code` - Country code
- `registration.zip_code` - Postal code
- `products.product_code` - Device product code
- `products.created_date` - When device was listed
- `products.openfda.device_name` - Device name
- `products.openfda.device_class` - Device class
- `proprietary_name` - Proprietary/brand names
- `establishment_type` - Types of operations (manufacturer, etc.)

**Common Use Cases**:
- Manufacturer identification
- Facility location lookup
- Supply chain mapping
- Due diligence research
- Market analysis

**Example Queries**:
```python
# Find registered facilities by country
params = {
    "api_key": api_key,
    "search": "registration.iso_country_code:US",
    "limit": 100
}

response = requests.get("https://api.fda.gov/device/registrationlisting.json", params=params)
```

```python
# Search by facility name
params = {
    "api_key": api_key,
    "search": "registration.name:*Johnson*",
    "limit": 10
}
```

### 8. Unique Device Identification (UDI)

**Endpoint**: `https://api.fda.gov/device/udi.json`

**Purpose**: Access the Global Unique Device Identification Database (GUDID) containing device identification information.

**Data Source**: GUDID

**Key Fields**:
- `identifiers.id` - Device identifier (DI)
- `identifiers.issuing_agency` - Issuing agency (GS1, HIBCC, ICCBBA)
- `identifiers.type` - Primary or Package DI
- `brand_name` - Brand name
- `version_model_number` - Version/model number
- `catalog_number` - Catalog number
- `company_name` - Device company
- `device_count_in_base_package` - Quantity in base package
- `device_description` - Description
- `is_rx` - Prescription device (true/false)
- `is_otc` - Over-the-counter device (true/false)
- `is_combination_product` - Combination product (true/false)
- `is_kit` - Kit (true/false)
- `is_labeled_no_nrl` - Latex-free labeled
- `has_lot_or_batch_number` - Uses lot/batch numbers
- `has_serial_number` - Uses serial numbers
- `has_manufacturing_date` - Has manufacturing date
- `has_expiration_date` - Has expiration date
- `mri_safety` - MRI safety status
- `gmdn_terms` - Global Medical Device Nomenclature terms
- `product_codes` - FDA product codes
- `storage` - Storage requirements
- `customer_contacts` - Contact information

**Common Use Cases**:
- Device identification and verification
- Supply chain tracking
- Adverse event reporting
- Inventory management
- Procurement

**Example Queries**:
```python
# Look up device by UDI
params = {
    "api_key": api_key,
    "search": "identifiers.id:00884838003019",
    "limit": 1
}

response = requests.get("https://api.fda.gov/device/udi.json", params=params)
```

```python
# Find prescription devices by brand name
params = {
    "api_key": api_key,
    "search": "brand_name:*insulin+pump*+AND+is_rx:true",
    "limit": 10
}
```

```python
# Search for MRI safe devices
params = {
    "api_key": api_key,
    "search": 'mri_safety:"MR Safe"',
    "limit": 50
}
```

### 9. COVID-19 Serological Testing Evaluations

**Endpoint**: `https://api.fda.gov/device/covid19serology.json`

**Purpose**: Access FDA's independent evaluations of COVID-19 antibody tests.

**Data Source**: FDA COVID-19 Serology Test Performance

**Key Fields**:
- `manufacturer` - Test manufacturer
- `device` - Device/test name
- `authorization_status` - EUA status
- `control_panel` - Control panel used for evaluation
- `sample_sensitivity_report_one` - Sensitivity data (first report)
- `sample_specificity_report_one` - Specificity data (first report)
- `sample_sensitivity_report_two` - Sensitivity data (second report)
- `sample_specificity_report_two` - Specificity data (second report)

**Common Use Cases**:
- Test performance comparison
- Diagnostic accuracy assessment
- Procurement decision support
- Quality assurance

**Example Queries**:
```python
# Find tests by manufacturer
params = {
    "api_key": api_key,
    "search": "manufacturer:Abbott",
    "limit": 10
}

response = requests.get("https://api.fda.gov/device/covid19serology.json", params=params)
```

```python
# Get all tests with EUA
params = {
    "api_key": api_key,
    "search": "authorization_status:*EUA*",
    "limit": 100
}
```

## Integration Tips

### Comprehensive Device Search

```python
def search_device_across_databases(device_name, api_key):
    """
    Search for a device across multiple FDA databases.

    Args:
        device_name: Name or partial name of device
        api_key: FDA API key

    Returns:
        Dictionary with results from each database
    """
    results = {}

    # Search adverse events
    events_url = "https://api.fda.gov/device/event.json"
    events_params = {
        "api_key": api_key,
        "search": f"device.brand_name:*{device_name}*",
        "limit": 10
    }
    results["adverse_events"] = requests.get(events_url, params=events_params).json()

    # Search 510(k) clearances
    fiveten_url = "https://api.fda.gov/device/510k.json"
    fiveten_params = {
        "api_key": api_key,
        "search": f"device_name:*{device_name}*",
        "limit": 10
    }
    results["510k_clearances"] = requests.get(fiveten_url, params=fiveten_params).json()

    # Search recalls
    recall_url = "https://api.fda.gov/device/enforcement.json"
    recall_params = {
        "api_key": api_key,
        "search": f"product_description:*{device_name}*",
        "limit": 10
    }
    results["recalls"] = requests.get(recall_url, params=recall_params).json()

    # Search UDI
    udi_url = "https://api.fda.gov/device/udi.json"
    udi_params = {
        "api_key": api_key,
        "search": f"brand_name:*{device_name}*",
        "limit": 10
    }
    results["udi"] = requests.get(udi_url, params=udi_params).json()

    return results
```

### Product Code Lookup

```python
def get_device_classification(product_code, api_key):
    """
    Get detailed classification information for a device product code.

    Args:
        product_code: Three-letter FDA product code
        api_key: FDA API key

    Returns:
        Classification details dictionary
    """
    url = "https://api.fda.gov/device/classification.json"
    params = {
        "api_key": api_key,
        "search": f"product_code:{product_code}",
        "limit": 1
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "results" in data and len(data["results"]) > 0:
        classification = data["results"][0]
        return {
            "product_code": classification.get("product_code"),
            "device_name": classification.get("device_name"),
            "device_class": classification.get("device_class"),
            "regulation_number": classification.get("regulation_number"),
            "medical_specialty": classification.get("medical_specialty_description"),
            "gmp_exempt": classification.get("gmp_exempt_flag") == "Y",
            "implant": classification.get("implant_flag") == "Y",
            "life_sustaining": classification.get("life_sustain_support_flag") == "Y"
        }
    return None
```

## Best Practices

1. **Use product codes** - Most efficient way to search across device databases
2. **Check multiple databases** - Device information is spread across multiple endpoints
3. **Handle large result sets** - Device databases can be very large; use pagination
4. **Validate device identifiers** - Ensure UDIs, 510(k) numbers, and PMA numbers are properly formatted
5. **Filter by device class** - Narrow searches by risk classification when relevant
6. **Use exact brand names** - Wildcards work but exact matches are more reliable
7. **Consider date ranges** - Device data accumulates over decades; filter by date when appropriate
8. **Cross-reference data** - Link adverse events to recalls and registrations for complete picture
9. **Monitor recall status** - Recall statuses change from "Ongoing" to "Completed"
10. **Check establishment registrations** - Facilities must register annually; check expiration dates

## Additional Resources

- OpenFDA Device API Documentation: https://open.fda.gov/apis/device/
- Device Classification Database: https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpcd/classification.cfm
- GUDID: https://accessgudid.nlm.nih.gov/
- API Basics: See `api_basics.md` in this references directory
- Python examples: See `scripts/fda_device_query.py`
