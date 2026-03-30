#!/usr/bin/env python3
"""
Example usage of the Research Lookup skill with automatic model selection.

This script demonstrates:
1. Automatic model selection based on query complexity
2. Manual model override options
3. Batch query processing
4. Integration with scientific writing workflows
"""

import os
from research_lookup import ResearchLookup


def example_automatic_selection():
    """Demonstrate automatic model selection."""
    print("=" * 80)
    print("EXAMPLE 1: Automatic Model Selection")
    print("=" * 80)
    print()
    
    research = ResearchLookup()
    
    # Simple lookup - will use Sonar Pro Search
    query1 = "Recent advances in CRISPR gene editing 2024"
    print(f"Query: {query1}")
    print(f"Expected model: Sonar Pro Search (fast lookup)")
    result1 = research.lookup(query1)
    print(f"Actual model: {result1.get('model')}")
    print()
    
    # Complex analysis - will use Sonar Reasoning Pro
    query2 = "Compare and contrast the efficacy of mRNA vaccines versus traditional vaccines"
    print(f"Query: {query2}")
    print(f"Expected model: Sonar Reasoning Pro (analytical)")
    result2 = research.lookup(query2)
    print(f"Actual model: {result2.get('model')}")
    print()


def example_manual_override():
    """Demonstrate manual model override."""
    print("=" * 80)
    print("EXAMPLE 2: Manual Model Override")
    print("=" * 80)
    print()
    
    # Force Sonar Pro Search for budget-constrained rapid lookup
    research_pro = ResearchLookup(force_model='pro')
    query = "Explain the mechanism of CRISPR-Cas9"
    print(f"Query: {query}")
    print(f"Forced model: Sonar Pro Search")
    result = research_pro.lookup(query)
    print(f"Model used: {result.get('model')}")
    print()
    
    # Force Sonar Reasoning Pro for critical analysis
    research_reasoning = ResearchLookup(force_model='reasoning')
    print(f"Query: {query}")
    print(f"Forced model: Sonar Reasoning Pro")
    result = research_reasoning.lookup(query)
    print(f"Model used: {result.get('model')}")
    print()


def example_batch_queries():
    """Demonstrate batch query processing."""
    print("=" * 80)
    print("EXAMPLE 3: Batch Query Processing")
    print("=" * 80)
    print()
    
    research = ResearchLookup()
    
    # Mix of simple and complex queries
    queries = [
        "Recent clinical trials for Alzheimer's disease",  # Sonar Pro Search
        "Compare deep learning vs traditional ML in drug discovery",  # Sonar Reasoning Pro
        "Statistical power analysis methods",  # Sonar Pro Search
    ]
    
    print("Processing batch queries...")
    print("Each query will automatically select the appropriate model")
    print()
    
    results = research.batch_lookup(queries, delay=1.0)
    
    for i, result in enumerate(results):
        print(f"Query {i+1}: {result['query'][:50]}...")
        print(f"  Model: {result.get('model')}")
        print(f"  Type: {result.get('model_type')}")
        print()


def example_scientific_writing_workflow():
    """Demonstrate integration with scientific writing workflow."""
    print("=" * 80)
    print("EXAMPLE 4: Scientific Writing Workflow")
    print("=" * 80)
    print()
    
    research = ResearchLookup()
    
    # Literature review phase - use Pro for breadth
    print("PHASE 1: Literature Review (Breadth)")
    lit_queries = [
        "Recent papers on machine learning in genomics 2024",
        "Clinical applications of AI in radiology",
        "RNA sequencing analysis methods"
    ]
    
    for query in lit_queries:
        print(f"  - {query}")
        # These will automatically use Sonar Pro Search
    print()
    
    # Discussion phase - use Reasoning Pro for synthesis
    print("PHASE 2: Discussion (Synthesis & Analysis)")
    discussion_queries = [
        "Compare the advantages and limitations of different ML approaches in genomics",
        "Explain the relationship between model interpretability and clinical adoption",
        "Analyze the ethical implications of AI in medical diagnosis"
    ]
    
    for query in discussion_queries:
        print(f"  - {query}")
        # These will automatically use Sonar Reasoning Pro
    print()


def main():
    """Run all examples (requires OPENROUTER_API_KEY to be set)."""
    
    if not os.getenv("OPENROUTER_API_KEY"):
        print("Note: Set OPENROUTER_API_KEY environment variable to run live queries")
        print("These examples show the structure without making actual API calls")
        print()
    
    # Uncomment to run examples (requires API key)
    # example_automatic_selection()
    # example_manual_override()
    # example_batch_queries()
    # example_scientific_writing_workflow()
    
    # Show complexity assessment without API calls
    print("=" * 80)
    print("COMPLEXITY ASSESSMENT EXAMPLES (No API calls required)")
    print("=" * 80)
    print()
    
    os.environ.setdefault("OPENROUTER_API_KEY", "test")
    research = ResearchLookup()
    
    test_queries = [
        ("Recent CRISPR studies", "pro"),
        ("Compare CRISPR vs TALENs", "reasoning"),
        ("Explain how CRISPR works", "reasoning"),
        ("Western blot protocol", "pro"),
        ("Pros and cons of different sequencing methods", "reasoning"),
    ]
    
    for query, expected in test_queries:
        complexity = research._assess_query_complexity(query)
        model_name = "Sonar Reasoning Pro" if complexity == "reasoning" else "Sonar Pro Search"
        status = "✓" if complexity == expected else "✗"
        print(f"{status} '{query}'")
        print(f"  → {model_name}")
        print()


if __name__ == "__main__":
    main()

