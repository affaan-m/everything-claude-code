#!/usr/bin/env python3
"""
Research Lookup Tool for Claude Code
Performs research queries using Perplexity Sonar Pro Search via OpenRouter.
"""

import os
import sys
import json
from typing import Dict, List, Optional

# Import the main research lookup class
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scripts'))
from research_lookup import ResearchLookup


def format_response(result: Dict) -> str:
    """Format the research result for display."""
    if not result["success"]:
        return f"❌ Research lookup failed: {result['error']}"

    response = result["response"]
    citations = result["citations"]
    sources = result.get("sources", [])

    # Format the output for Claude Code
    output = f"""🔍 **Research Results**

**Query:** {result['query']}
**Model:** {result['model']}
**Timestamp:** {result['timestamp']}
**Note:** Results prioritized by citation count, venue prestige, and author reputation

---

{response}

"""

    # Display API-provided sources with venue/citation info
    if sources:
        output += f"\n📚 **Sources ({len(sources)}):**\n"
        output += "_Prioritized by venue quality and citation impact_\n\n"
        for i, source in enumerate(sources, 1):
            title = source.get("title", "Untitled")
            url = source.get("url", "")
            date = source.get("date", "")
            snippet = source.get("snippet", "")
            
            # Format source entry with available metadata
            date_str = f" ({date})" if date else ""
            output += f"{i}. **{title}**{date_str}\n"
            
            # Add venue indicator if detectable from URL
            venue_indicator = _detect_venue_tier(url)
            if venue_indicator:
                output += f"   📊 Venue: {venue_indicator}\n"
            
            if url:
                output += f"   🔗 {url}\n"
            if snippet:
                output += f"   _{snippet[:150]}{'...' if len(snippet) > 150 else ''}_\n"
            output += "\n"

    # Display extracted citations (DOIs, etc.)
    if citations:
        doi_citations = [c for c in citations if c.get("type") == "doi"]
        url_citations = [c for c in citations if c.get("type") == "url"]
        
        if doi_citations:
            output += f"\n🔗 **DOI References ({len(doi_citations)}):**\n"
            for i, citation in enumerate(doi_citations, 1):
                output += f"{i}. DOI: {citation.get('doi', '')} → {citation.get('url', '')}\n"
        
        if url_citations:
            output += f"\n🌐 **Additional URLs ({len(url_citations)}):**\n"
            for i, citation in enumerate(url_citations, 1):
                url = citation.get('url', '')
                venue = _detect_venue_tier(url)
                venue_str = f" [{venue}]" if venue else ""
                output += f"{i}. {url}{venue_str}\n"

    if result.get("usage"):
        usage = result["usage"]
        output += f"\n**Usage:** {usage.get('total_tokens', 'N/A')} tokens"

    return output


def _detect_venue_tier(url: str) -> Optional[str]:
    """Detect venue tier from URL to indicate source quality."""
    if not url:
        return None
    
    url_lower = url.lower()
    
    # Tier 1 - Premier venues
    tier1_indicators = {
        "nature.com": "Nature (Tier 1)",
        "science.org": "Science (Tier 1)",
        "cell.com": "Cell Press (Tier 1)",
        "nejm.org": "NEJM (Tier 1)",
        "thelancet.com": "Lancet (Tier 1)",
        "jamanetwork.com": "JAMA (Tier 1)",
        "pnas.org": "PNAS (Tier 1)",
    }
    
    # Tier 2 - High-impact specialized
    tier2_indicators = {
        "neurips.cc": "NeurIPS (Tier 2 - Top ML)",
        "icml.cc": "ICML (Tier 2 - Top ML)",
        "openreview.net": "Top ML Conference (Tier 2)",
        "aacrjournals.org": "AACR Journals (Tier 2)",
        "ahajournals.org": "AHA Journals (Tier 2)",
        "bloodjournal.org": "Blood (Tier 2)",
        "jci.org": "JCI (Tier 2)",
    }
    
    # Tier 3 - Respected academic sources
    tier3_indicators = {
        "springer.com": "Springer",
        "wiley.com": "Wiley",
        "elsevier.com": "Elsevier",
        "oup.com": "Oxford University Press",
        "arxiv.org": "arXiv (Preprint)",
        "biorxiv.org": "bioRxiv (Preprint)",
        "medrxiv.org": "medRxiv (Preprint)",
        "pubmed": "PubMed",
        "ncbi.nlm.nih.gov": "NCBI/PubMed",
        "ieee.org": "IEEE",
        "acm.org": "ACM",
    }
    
    for domain, label in tier1_indicators.items():
        if domain in url_lower:
            return label
    
    for domain, label in tier2_indicators.items():
        if domain in url_lower:
            return label
    
    for domain, label in tier3_indicators.items():
        if domain in url_lower:
            return label
    
    return None


def main():
    """Main entry point for Claude Code tool."""
    # Check for API key
    if not os.getenv("OPENROUTER_API_KEY"):
        print("❌ Error: OPENROUTER_API_KEY environment variable not set")
        print("Please set it in your .env file or export it:")
        print("  export OPENROUTER_API_KEY='your_openrouter_api_key'")
        return 1

    # Get query from command line arguments
    if len(sys.argv) < 2:
        print("❌ Error: No query provided")
        print("Usage: python lookup.py 'your research query here'")
        return 1

    query = " ".join(sys.argv[1:])

    try:
        # Initialize research tool
        research = ResearchLookup()

        # Perform lookup
        print(f"🔍 Researching: {query}")
        result = research.lookup(query)

        # Format and output result
        formatted_output = format_response(result)
        print(formatted_output)

        # Return success code
        return 0 if result["success"] else 1

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1


if __name__ == "__main__":
    exit(main())
