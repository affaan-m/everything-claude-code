#!/usr/bin/env python3
"""
FDA API Usage Examples

Demonstrates common use cases for querying FDA databases.

Usage:
    python fda_examples.py
"""

import os
from fda_query import FDAQuery


def example_drug_safety_profile(fda, drug_name):
    """
    Create a comprehensive safety profile for a drug.

    Includes:
    - Total adverse events
    - Most common reactions
    - Serious events
    - Recent recalls
    """
    print(f"\n{'='*60}")
    print(f"DRUG SAFETY PROFILE: {drug_name}")
    print(f"{'='*60}\n")

    # 1. Count total adverse events
    events = fda.query_drug_events(drug_name, limit=1)
    if "meta" in events and "results" in events["meta"]:
        total = events["meta"]["results"].get("total", 0)
        print(f"Total Adverse Event Reports: {total:,}")

    # 2. Most common reactions
    print(f"\nMost Common Adverse Reactions:")
    reactions = fda.count_by_field(
        "drug", "event",
        search=f"patient.drug.medicinalproduct:*{drug_name}*",
        field="patient.reaction.reactionmeddrapt",
        exact=True
    )
    if "results" in reactions:
        for i, item in enumerate(reactions["results"][:10], 1):
            print(f"  {i}. {item['term']}: {item['count']:,} reports")

    # 3. Serious events
    serious_events = fda.query(
        "drug", "event",
        search=f"patient.drug.medicinalproduct:*{drug_name}*+AND+serious:1",
        limit=1
    )
    if "meta" in serious_events and "results" in serious_events["meta"]:
        serious_total = serious_events["meta"]["results"].get("total", 0)
        print(f"\nSerious Adverse Events: {serious_total:,}")

    # 4. Check for recent recalls
    recalls = fda.query_drug_recalls(drug_name=drug_name)
    if "results" in recalls and len(recalls["results"]) > 0:
        print(f"\nRecent Recalls: {len(recalls['results'])}")
        for recall in recalls["results"][:3]:
            print(f"  - {recall.get('reason_for_recall', 'Unknown')} "
                  f"(Class {recall.get('classification', 'Unknown')})")
    else:
        print(f"\nRecent Recalls: None found")


def example_device_surveillance(fda, device_name):
    """
    Monitor medical device safety.

    Includes:
    - Adverse events
    - Event types (death, injury, malfunction)
    - Recent recalls
    """
    print(f"\n{'='*60}")
    print(f"DEVICE SURVEILLANCE: {device_name}")
    print(f"{'='*60}\n")

    # 1. Count adverse events
    events = fda.query_device_events(device_name, limit=1)
    if "meta" in events and "results" in events["meta"]:
        total = events["meta"]["results"].get("total", 0)
        print(f"Total Adverse Event Reports: {total:,}")

    # 2. Event types
    print(f"\nEvent Type Distribution:")
    event_types = fda.count_by_field(
        "device", "event",
        search=f"device.brand_name:*{device_name}*",
        field="event_type",
        exact=False
    )
    if "results" in event_types:
        for item in event_types["results"]:
            print(f"  {item['term']}: {item['count']:,}")

    # 3. Recent events
    recent = fda.query_device_events(device_name, limit=5)
    if "results" in recent and len(recent["results"]) > 0:
        print(f"\nRecent Events (sample):")
        for i, event in enumerate(recent["results"][:3], 1):
            event_type = event.get("event_type", "Unknown")
            date = event.get("date_received", "Unknown")
            print(f"  {i}. Type: {event_type}, Date: {date}")


def example_food_recall_monitoring(fda, allergen):
    """
    Monitor food recalls for specific allergen.

    Args:
        fda: FDAQuery instance
        allergen: Allergen to monitor (e.g., "peanut", "milk", "soy")
    """
    print(f"\n{'='*60}")
    print(f"ALLERGEN RECALL MONITORING: {allergen}")
    print(f"{'='*60}\n")

    # Find recalls mentioning this allergen
    recalls = fda.query_food_recalls(reason=allergen)

    if "results" in recalls and len(recalls["results"]) > 0:
        print(f"Found {len(recalls['results'])} recalls mentioning '{allergen}':\n")

        for recall in recalls["results"][:10]:
            product = recall.get("product_description", "Unknown product")
            classification = recall.get("classification", "Unknown")
            reason = recall.get("reason_for_recall", "Unknown")
            date = recall.get("recall_initiation_date", "Unknown")
            status = recall.get("status", "Unknown")

            print(f"Product: {product}")
            print(f"  Classification: {classification}")
            print(f"  Reason: {reason}")
            print(f"  Date: {date}")
            print(f"  Status: {status}")
            print()
    else:
        print(f"No recent recalls found for allergen: {allergen}")


def example_substance_lookup(fda, substance_name):
    """
    Look up substance information.

    Includes:
    - UNII code
    - CAS numbers
    - Chemical structure
    - Related substances
    """
    print(f"\n{'='*60}")
    print(f"SUBSTANCE INFORMATION: {substance_name}")
    print(f"{'='*60}\n")

    substances = fda.query_substance_by_name(substance_name)

    if "results" in substances and len(substances["results"]) > 0:
        for i, substance in enumerate(substances["results"][:3], 1):
            print(f"Match {i}:")

            # Names
            names = substance.get("names", [])
            if names:
                preferred = next((n["name"] for n in names if n.get("preferred")), names[0].get("name"))
                print(f"  Name: {preferred}")

            # UNII
            unii = substance.get("approvalID")
            if unii:
                print(f"  UNII: {unii}")

            # CAS numbers
            codes = substance.get("codes", [])
            cas_numbers = [c["code"] for c in codes if "CAS" in c.get("codeSystem", "")]
            if cas_numbers:
                print(f"  CAS: {', '.join(cas_numbers)}")

            # Structure
            if "structure" in substance:
                structure = substance["structure"]
                formula = structure.get("formula")
                mol_weight = structure.get("molecularWeight")

                if formula:
                    print(f"  Formula: {formula}")
                if mol_weight:
                    print(f"  Molecular Weight: {mol_weight}")

            # Substance class
            substance_class = substance.get("substanceClass")
            if substance_class:
                print(f"  Class: {substance_class}")

            print()
    else:
        print(f"No substances found matching: {substance_name}")


def example_comparative_drug_analysis(fda, drug_list):
    """
    Compare safety profiles of multiple drugs.

    Args:
        fda: FDAQuery instance
        drug_list: List of drug names to compare
    """
    print(f"\n{'='*60}")
    print(f"COMPARATIVE DRUG ANALYSIS")
    print(f"{'='*60}\n")

    print(f"Comparing: {', '.join(drug_list)}\n")

    comparison = {}

    for drug in drug_list:
        # Get total events
        events = fda.query_drug_events(drug, limit=1)
        total = 0
        if "meta" in events and "results" in events["meta"]:
            total = events["meta"]["results"].get("total", 0)

        # Get serious events
        serious = fda.query(
            "drug", "event",
            search=f"patient.drug.medicinalproduct:*{drug}*+AND+serious:1",
            limit=1
        )
        serious_total = 0
        if "meta" in serious and "results" in serious["meta"]:
            serious_total = serious["meta"]["results"].get("total", 0)

        serious_rate = (serious_total / total * 100) if total > 0 else 0

        comparison[drug] = {
            "total_events": total,
            "serious_events": serious_total,
            "serious_rate": serious_rate
        }

    # Display comparison
    print(f"{'Drug':<20} {'Total Events':>15} {'Serious Events':>15} {'Serious %':>12}")
    print("-" * 65)

    for drug, data in comparison.items():
        print(f"{drug:<20} {data['total_events']:>15,} "
              f"{data['serious_events']:>15,} {data['serious_rate']:>11.2f}%")


def example_veterinary_analysis(fda, species, drug_name):
    """
    Analyze veterinary drug adverse events by species.

    Args:
        fda: FDAQuery instance
        species: Animal species (e.g., "Dog", "Cat", "Horse")
        drug_name: Veterinary drug name
    """
    print(f"\n{'='*60}")
    print(f"VETERINARY DRUG ANALYSIS: {drug_name} in {species}")
    print(f"{'='*60}\n")

    events = fda.query_animal_events(species=species, drug_name=drug_name)

    if "results" in events and len(events["results"]) > 0:
        print(f"Found {len(events['results'])} adverse event reports\n")

        # Collect reactions
        reactions = []
        serious_count = 0

        for event in events["results"]:
            if event.get("serious_ae") == "true":
                serious_count += 1

            if "reaction" in event:
                for reaction in event["reaction"]:
                    if "veddra_term_name" in reaction:
                        reactions.append(reaction["veddra_term_name"])

        print(f"Serious Events: {serious_count} ({serious_count/len(events['results'])*100:.1f}%)")

        # Count reactions
        from collections import Counter
        reaction_counts = Counter(reactions)

        print(f"\nMost Common Reactions:")
        for reaction, count in reaction_counts.most_common(10):
            print(f"  {reaction}: {count}")
    else:
        print(f"No adverse events found")


def main():
    """Run example analyses."""
    # Get API key from environment
    api_key = os.environ.get("FDA_API_KEY")

    if not api_key:
        print("Warning: No FDA_API_KEY found in environment.")
        print("You can still use the API but with lower rate limits.")
        print("Set FDA_API_KEY environment variable for better performance.\n")

    # Initialize FDA query client
    fda = FDAQuery(api_key=api_key)

    # Run examples
    try:
        # Example 1: Drug safety profile
        example_drug_safety_profile(fda, "aspirin")

        # Example 2: Device surveillance
        example_device_surveillance(fda, "pacemaker")

        # Example 3: Food recall monitoring
        example_food_recall_monitoring(fda, "undeclared peanut")

        # Example 4: Substance lookup
        example_substance_lookup(fda, "ibuprofen")

        # Example 5: Comparative analysis
        example_comparative_drug_analysis(fda, ["aspirin", "ibuprofen", "naproxen"])

        # Example 6: Veterinary analysis
        example_veterinary_analysis(fda, "Dog", "flea collar")

    except Exception as e:
        print(f"\nError running examples: {e}")
        print("This may be due to API rate limits or connectivity issues.")


if __name__ == "__main__":
    main()
