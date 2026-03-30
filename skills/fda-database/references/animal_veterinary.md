# FDA Animal and Veterinary Databases

This reference covers FDA animal and veterinary medicine API endpoints accessible through openFDA.

## Overview

The FDA animal and veterinary databases provide access to information about adverse events related to animal drugs and veterinary medical products. These databases help monitor the safety of products used in companion animals, livestock, and other animals.

## Available Endpoints

### Animal Drug Adverse Events

**Endpoint**: `https://api.fda.gov/animalandveterinary/event.json`

**Purpose**: Access reports of side effects, product use errors, product quality problems, and therapeutic failures associated with animal drugs.

**Data Source**: FDA Center for Veterinary Medicine (CVM) Adverse Event Reporting System

**Key Fields**:
- `unique_aer_id_number` - Unique adverse event report identifier
- `report_id` - Report ID number
- `receiver.organization` - Organization receiving report
- `receiver.street_address` - Receiver address
- `receiver.city` - Receiver city
- `receiver.state` - Receiver state
- `receiver.postal_code` - Receiver postal code
- `receiver.country` - Receiver country
- `primary_reporter` - Primary reporter type (e.g., veterinarian, owner)
- `onset_date` - Date adverse event began
- `animal.species` - Animal species affected
- `animal.gender` - Animal gender
- `animal.age.min` - Minimum age
- `animal.age.max` - Maximum age
- `animal.age.unit` - Age unit (days, months, years)
- `animal.age.qualifier` - Age qualifier
- `animal.breed.is_crossbred` - Whether crossbred
- `animal.breed.breed_component` - Breed(s)
- `animal.weight.min` - Minimum weight
- `animal.weight.max` - Maximum weight
- `animal.weight.unit` - Weight unit
- `animal.female_animal_physiological_status` - Reproductive status
- `animal.reproductive_status` - Spayed/neutered status
- `drug` - Array of drugs involved
- `drug.active_ingredients` - Active ingredients
- `drug.active_ingredients.name` - Ingredient name
- `drug.active_ingredients.dose` - Dose information
- `drug.brand_name` - Brand name
- `drug.manufacturer.name` - Manufacturer
- `drug.administered_by` - Who administered drug
- `drug.route` - Route of administration
- `drug.dosage_form` - Dosage form
- `drug.atc_vet_code` - ATC veterinary code
- `reaction` - Array of adverse reactions
- `reaction.veddra_version` - VeDDRA dictionary version
- `reaction.veddra_term_code` - VeDDRA term code
- `reaction.veddra_term_name` - VeDDRA term name
- `reaction.accuracy` - Accuracy of diagnosis
- `reaction.number_of_animals_affected` - Number affected
- `reaction.number_of_animals_treated` - Number treated
- `outcome.medical_status` - Medical outcome
- `outcome.number_of_animals_affected` - Animals affected by outcome
- `serious_ae` - Whether serious adverse event
- `health_assessment_prior_to_exposure.assessed_by` - Who assessed health
- `health_assessment_prior_to_exposure.condition` - Health condition
- `treated_for_ae` - Whether treated
- `time_between_exposure_and_onset` - Time to onset
- `duration.unit` - Duration unit
- `duration.value` - Duration value

**Common Animal Species**:
- Dog (Canis lupus familiaris)
- Cat (Felis catus)
- Horse (Equus caballus)
- Cattle (Bos taurus)
- Pig (Sus scrofa domesticus)
- Chicken (Gallus gallus domesticus)
- Sheep (Ovis aries)
- Goat (Capra aegagrus hircus)
- And many others

**Common Use Cases**:
- Veterinary pharmacovigilance
- Product safety monitoring
- Adverse event trend analysis
- Drug safety comparison
- Species-specific safety research
- Breed predisposition studies

**Example Queries**:
```python
import requests

api_key = "YOUR_API_KEY"
url = "https://api.fda.gov/animalandveterinary/event.json"

# Find adverse events in dogs
params = {
    "api_key": api_key,
    "search": "animal.species:Dog",
    "limit": 10
}

response = requests.get(url, params=params)
data = response.json()
```

```python
# Search for specific drug adverse events
params = {
    "api_key": api_key,
    "search": "drug.brand_name:*flea+collar*",
    "limit": 20
}
```

```python
# Count most common reactions by species
params = {
    "api_key": api_key,
    "search": "animal.species:Cat",
    "count": "reaction.veddra_term_name.exact"
}
```

```python
# Find serious adverse events
params = {
    "api_key": api_key,
    "search": "serious_ae:true+AND+outcome.medical_status:Died",
    "limit": 50,
    "sort": "onset_date:desc"
}
```

```python
# Search by active ingredient
params = {
    "api_key": api_key,
    "search": "drug.active_ingredients.name:*ivermectin*",
    "limit": 25
}
```

```python
# Find events in specific breed
params = {
    "api_key": api_key,
    "search": "animal.breed.breed_component:*Labrador*",
    "limit": 30
}
```

```python
# Get events by route of administration
params = {
    "api_key": api_key,
    "search": "drug.route:*topical*",
    "limit": 40
}
```

## VeDDRA - Veterinary Dictionary for Drug Related Affairs

The Veterinary Dictionary for Drug Related Affairs (VeDDRA) is a standardized international veterinary terminology for adverse event reporting. It provides:

- Standardized terms for veterinary adverse events
- Hierarchical organization of terms
- Species-specific terminology
- International harmonization

**VeDDRA Term Structure**:
- Terms are organized hierarchically
- Each term has a unique code
- Terms are species-appropriate
- Multiple versions exist (check `veddra_version` field)

## Integration Tips

### Species-Specific Adverse Event Analysis

```python
def analyze_species_adverse_events(species, drug_name, api_key):
    """
    Analyze adverse events for a specific drug in a particular species.

    Args:
        species: Animal species (e.g., "Dog", "Cat", "Horse")
        drug_name: Drug brand name or active ingredient
        api_key: FDA API key

    Returns:
        Dictionary with analysis results
    """
    import requests
    from collections import Counter

    url = "https://api.fda.gov/animalandveterinary/event.json"
    params = {
        "api_key": api_key,
        "search": f"animal.species:{species}+AND+drug.brand_name:*{drug_name}*",
        "limit": 1000
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "results" not in data:
        return {"error": "No results found"}

    results = data["results"]

    # Collect reactions and outcomes
    reactions = []
    outcomes = []
    serious_count = 0

    for event in results:
        if "reaction" in event:
            for reaction in event["reaction"]:
                if "veddra_term_name" in reaction:
                    reactions.append(reaction["veddra_term_name"])

        if "outcome" in event:
            for outcome in event["outcome"]:
                if "medical_status" in outcome:
                    outcomes.append(outcome["medical_status"])

        if event.get("serious_ae") == "true":
            serious_count += 1

    reaction_counts = Counter(reactions)
    outcome_counts = Counter(outcomes)

    return {
        "total_events": len(results),
        "serious_events": serious_count,
        "most_common_reactions": reaction_counts.most_common(10),
        "outcome_distribution": dict(outcome_counts),
        "serious_percentage": round((serious_count / len(results)) * 100, 2) if len(results) > 0 else 0
    }
```

### Breed Predisposition Research

```python
def analyze_breed_predisposition(reaction_term, api_key, min_events=5):
    """
    Identify breed predispositions for specific adverse reactions.

    Args:
        reaction_term: VeDDRA reaction term to analyze
        api_key: FDA API key
        min_events: Minimum number of events to include breed

    Returns:
        List of breeds with event counts
    """
    import requests
    from collections import Counter

    url = "https://api.fda.gov/animalandveterinary/event.json"
    params = {
        "api_key": api_key,
        "search": f"reaction.veddra_term_name:*{reaction_term}*",
        "limit": 1000
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "results" not in data:
        return []

    breeds = []
    for event in data["results"]:
        if "animal" in event and "breed" in event["animal"]:
            breed_info = event["animal"]["breed"]
            if "breed_component" in breed_info:
                if isinstance(breed_info["breed_component"], list):
                    breeds.extend(breed_info["breed_component"])
                else:
                    breeds.append(breed_info["breed_component"])

    breed_counts = Counter(breeds)

    # Filter by minimum events
    filtered_breeds = [
        {"breed": breed, "count": count}
        for breed, count in breed_counts.most_common()
        if count >= min_events
    ]

    return filtered_breeds
```

### Comparative Drug Safety

```python
def compare_drug_safety(drug_list, species, api_key):
    """
    Compare safety profiles of multiple drugs for a specific species.

    Args:
        drug_list: List of drug names to compare
        species: Animal species
        api_key: FDA API key

    Returns:
        Dictionary comparing drugs
    """
    import requests

    url = "https://api.fda.gov/animalandveterinary/event.json"
    comparison = {}

    for drug in drug_list:
        params = {
            "api_key": api_key,
            "search": f"animal.species:{species}+AND+drug.brand_name:*{drug}*",
            "limit": 1000
        }

        response = requests.get(url, params=params)
        data = response.json()

        if "results" in data:
            results = data["results"]
            serious = sum(1 for r in results if r.get("serious_ae") == "true")
            deaths = sum(
                1 for r in results
                if "outcome" in r
                and any(o.get("medical_status") == "Died" for o in r["outcome"])
            )

            comparison[drug] = {
                "total_events": len(results),
                "serious_events": serious,
                "deaths": deaths,
                "serious_rate": round((serious / len(results)) * 100, 2) if len(results) > 0 else 0,
                "death_rate": round((deaths / len(results)) * 100, 2) if len(results) > 0 else 0
            }

    return comparison
```

## Best Practices

1. **Use standard species names** - Full scientific or common names work best
2. **Consider breed variations** - Spelling and naming can vary
3. **Check VeDDRA versions** - Terms may change between versions
4. **Account for reporter bias** - Veterinarians vs. owners report differently
5. **Filter by serious events** - Focus on clinically significant reactions
6. **Consider animal demographics** - Age, weight, and reproductive status matter
7. **Track temporal patterns** - Seasonal variations may exist
8. **Cross-reference products** - Same active ingredient may have multiple brands
9. **Analyze by route** - Topical vs. systemic administration affects safety
10. **Consider species differences** - Drugs affect species differently

## Reporting Sources

Animal drug adverse event reports come from:
- **Veterinarians** - Professional medical observations
- **Animal owners** - Direct observations and concerns
- **Pharmaceutical companies** - Required post-market surveillance
- **FDA field staff** - Official investigations
- **Research institutions** - Clinical studies
- **Other sources** - Varies

Different sources may have different reporting thresholds and detail levels.

## Additional Resources

- OpenFDA Animal & Veterinary API: https://open.fda.gov/apis/animalandveterinary/
- FDA Center for Veterinary Medicine: https://www.fda.gov/animal-veterinary
- VeDDRA: https://www.veddra.org/
- API Basics: See `api_basics.md` in this references directory
- Python examples: See `scripts/fda_animal_query.py`
