# FDA Food Databases

This reference covers FDA food-related API endpoints accessible through openFDA.

## Overview

The FDA food databases provide access to information about food products, including adverse events and enforcement actions. These databases help track food safety issues, recalls, and consumer complaints.

## Available Endpoints

### 1. Food Adverse Events

**Endpoint**: `https://api.fda.gov/food/event.json`

**Purpose**: Access adverse event reports for food products, dietary supplements, and cosmetics.

**Data Source**: CAERS (CFSAN Adverse Event Reporting System)

**Key Fields**:
- `date_started` - When adverse event began
- `date_created` - When report was created
- `report_number` - Unique report identifier
- `outcomes` - Event outcomes (e.g., hospitalization, death)
- `reactions` - Adverse reactions/symptoms reported
- `consumer.age` - Consumer age
- `consumer.age_unit` - Age unit (years, months, etc.)
- `consumer.gender` - Consumer gender
- `products` - Array of products involved
- `products.name_brand` - Product brand name
- `products.industry_code` - Product category code
- `products.industry_name` - Product category name
- `products.role` - Product role (Suspect, Concomitant)

**Product Categories (industry_name)**:
- Bakery Products/Dough/Mixes/Icing
- Beverages (coffee, tea, soft drinks, etc.)
- Dietary Supplements
- Ice Cream Products
- Cosmetics
- Vitamins and nutritional supplements
- Many others

**Common Use Cases**:
- Food safety surveillance
- Dietary supplement monitoring
- Adverse event trend analysis
- Product safety assessment
- Consumer complaint tracking

**Example Queries**:
```python
import requests

api_key = "YOUR_API_KEY"
url = "https://api.fda.gov/food/event.json"

# Find adverse events for dietary supplements
params = {
    "api_key": api_key,
    "search": "products.industry_name:Dietary+Supplements",
    "limit": 10
}

response = requests.get(url, params=params)
data = response.json()
```

```python
# Count most common reactions
params = {
    "api_key": api_key,
    "search": "products.industry_name:*Beverages*",
    "count": "reactions.exact"
}
```

```python
# Find serious outcomes (hospitalizations, deaths)
params = {
    "api_key": api_key,
    "search": "outcomes:Hospitalization",
    "limit": 50,
    "sort": "date_created:desc"
}
```

```python
# Search by product brand name
params = {
    "api_key": api_key,
    "search": "products.name_brand:*protein+powder*",
    "limit": 20
}
```

### 2. Food Enforcement Reports

**Endpoint**: `https://api.fda.gov/food/enforcement.json`

**Purpose**: Access food product recall enforcement reports issued by the FDA.

**Data Source**: FDA Enforcement Reports

**Key Fields**:
- `status` - Current status (Ongoing, Completed, Terminated)
- `recall_number` - Unique recall identifier
- `classification` - Class I, II, or III
- `product_description` - Description of recalled food product
- `reason_for_recall` - Why product was recalled
- `product_quantity` - Amount of product recalled
- `code_info` - Lot numbers, batch codes, UPCs
- `distribution_pattern` - Geographic distribution
- `recalling_firm` - Company conducting recall
- `recall_initiation_date` - When recall began
- `report_date` - When FDA received notice
- `voluntary_mandated` - Voluntary or FDA-mandated recall
- `city` - Recalling firm city
- `state` - Recalling firm state
- `country` - Recalling firm country
- `initial_firm_notification` - How firm was notified

**Classification Levels**:
- **Class I**: Dangerous or defective products that could cause serious health problems or death (e.g., undeclared allergens with severe risk, botulism contamination)
- **Class II**: Products that might cause temporary health problems or pose slight threat (e.g., minor allergen issues, quality defects)
- **Class III**: Products unlikely to cause adverse health reactions but violate FDA regulations (e.g., labeling errors, quality issues)

**Common Recall Reasons**:
- Undeclared allergens (milk, eggs, peanuts, tree nuts, soy, wheat, fish, shellfish, sesame)
- Microbial contamination (Listeria, Salmonella, E. coli, etc.)
- Foreign material contamination (metal, plastic, glass)
- Labeling errors
- Improper processing/packaging
- Chemical contamination

**Common Use Cases**:
- Food safety monitoring
- Supply chain risk management
- Allergen tracking
- Retailer recall coordination
- Consumer safety alerts

**Example Queries**:
```python
# Find all Class I food recalls (most serious)
params = {
    "api_key": api_key,
    "search": "classification:Class+I",
    "limit": 20,
    "sort": "report_date:desc"
}

response = requests.get("https://api.fda.gov/food/enforcement.json", params=params)
```

```python
# Search for allergen-related recalls
params = {
    "api_key": api_key,
    "search": "reason_for_recall:*undeclared+allergen*",
    "limit": 50
}
```

```python
# Find Listeria contamination recalls
params = {
    "api_key": api_key,
    "search": "reason_for_recall:*listeria*",
    "limit": 30,
    "sort": "recall_initiation_date:desc"
}
```

```python
# Get recalls by specific company
params = {
    "api_key": api_key,
    "search": "recalling_firm:*General+Mills*",
    "limit": 20
}
```

```python
# Find ongoing recalls
params = {
    "api_key": api_key,
    "search": "status:Ongoing",
    "limit": 100
}
```

```python
# Search by product type
params = {
    "api_key": api_key,
    "search": "product_description:*ice+cream*",
    "limit": 25
}
```

## Integration Tips

### Allergen Monitoring System

```python
def monitor_allergen_recalls(allergens, api_key, days_back=30):
    """
    Monitor food recalls for specific allergens.

    Args:
        allergens: List of allergens to monitor (e.g., ["peanut", "milk", "soy"])
        api_key: FDA API key
        days_back: Number of days to look back

    Returns:
        List of matching recalls
    """
    import requests
    from datetime import datetime, timedelta

    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    date_range = f"[{start_date.strftime('%Y%m%d')}+TO+{end_date.strftime('%Y%m%d')}]"

    url = "https://api.fda.gov/food/enforcement.json"
    all_recalls = []

    for allergen in allergens:
        params = {
            "api_key": api_key,
            "search": f"reason_for_recall:*{allergen}*+AND+report_date:{date_range}",
            "limit": 100
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if "results" in data:
                for result in data["results"]:
                    result["detected_allergen"] = allergen
                    all_recalls.append(result)

    return all_recalls
```

### Adverse Event Analysis

```python
def analyze_product_adverse_events(product_name, api_key):
    """
    Analyze adverse events for a specific food product.

    Args:
        product_name: Product name or partial name
        api_key: FDA API key

    Returns:
        Dictionary with analysis results
    """
    import requests
    from collections import Counter

    url = "https://api.fda.gov/food/event.json"
    params = {
        "api_key": api_key,
        "search": f"products.name_brand:*{product_name}*",
        "limit": 1000
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "results" not in data:
        return {"error": "No results found"}

    results = data["results"]

    # Extract all reactions
    all_reactions = []
    all_outcomes = []

    for event in results:
        if "reactions" in event:
            all_reactions.extend(event["reactions"])
        if "outcomes" in event:
            all_outcomes.extend(event["outcomes"])

    # Count frequencies
    reaction_counts = Counter(all_reactions)
    outcome_counts = Counter(all_outcomes)

    return {
        "total_events": len(results),
        "most_common_reactions": reaction_counts.most_common(10),
        "outcome_distribution": dict(outcome_counts),
        "serious_outcomes": sum(1 for o in all_outcomes if o in ["Hospitalization", "Death", "Disability"])
    }
```

### Recall Alert System

```python
def get_recent_recalls_by_state(state_code, api_key, days=7):
    """
    Get recent food recalls for products distributed in a specific state.

    Args:
        state_code: Two-letter state code (e.g., "CA", "NY")
        api_key: FDA API key
        days: Number of days to look back

    Returns:
        List of recent recalls affecting the state
    """
    import requests
    from datetime import datetime, timedelta

    url = "https://api.fda.gov/food/enforcement.json"

    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    date_range = f"[{start_date.strftime('%Y%m%d')}+TO+{end_date.strftime('%Y%m%d')}]"

    params = {
        "api_key": api_key,
        "search": f"distribution_pattern:*{state_code}*+AND+report_date:{date_range}",
        "limit": 100,
        "sort": "report_date:desc"
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return data.get("results", [])
    return []
```

## Best Practices

1. **Monitor allergen recalls** - Critical for food service and retail
2. **Check distribution patterns** - Recalls may be regional or national
3. **Track recall status** - Status changes from "Ongoing" to "Completed"
4. **Filter by classification** - Prioritize Class I recalls for immediate action
5. **Use date ranges** - Focus on recent events for operational relevance
6. **Cross-reference products** - Same product may appear in both adverse events and enforcement
7. **Parse code_info carefully** - Lot numbers and UPCs vary in format
8. **Consider product categories** - Industry codes help categorize products
9. **Track serious outcomes** - Hospitalization and death require immediate attention
10. **Implement alert systems** - Automate monitoring for critical products/allergens

## Common Allergens to Monitor

The FDA recognizes 9 major food allergens that must be declared:
1. Milk
2. Eggs
3. Fish
4. Crustacean shellfish
5. Tree nuts
6. Peanuts
7. Wheat
8. Soybeans
9. Sesame

These account for over 90% of food allergies and are the most common reasons for Class I recalls.

## Additional Resources

- OpenFDA Food API Documentation: https://open.fda.gov/apis/food/
- CFSAN Adverse Event Reporting: https://www.fda.gov/food/compliance-enforcement-food/cfsan-adverse-event-reporting-system-caers
- Food Recalls: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts
- API Basics: See `api_basics.md` in this references directory
- Python examples: See `scripts/fda_food_query.py`
