"""
FRED API Examples

Demonstrates common use cases for querying FRED economic data.
Run with: uv run python scripts/fred_examples.py
"""

import os
import json
from datetime import datetime, timedelta

# Import the FREDQuery class
from fred_query import FREDQuery


def example_basic_series():
    """Example: Get basic series data."""
    print("\n" + "=" * 60)
    print("Example 1: Basic Series Data")
    print("=" * 60)

    fred = FREDQuery()

    # Get GDP series metadata
    print("\n1a. GDP Series Metadata:")
    gdp_info = fred.get_series("GDP")
    if "seriess" in gdp_info:
        series = gdp_info["seriess"][0]
        print(f"  Title: {series['title']}")
        print(f"  Frequency: {series['frequency']}")
        print(f"  Units: {series['units']}")
        print(f"  Last Updated: {series['last_updated']}")

    # Get recent observations
    print("\n1b. Recent GDP Observations:")
    gdp_data = fred.get_observations("GDP", limit=5, sort_order="desc")
    if "observations" in gdp_data:
        for obs in gdp_data["observations"]:
            print(f"  {obs['date']}: ${obs['value']} billion")


def example_transformations():
    """Example: Data transformations."""
    print("\n" + "=" * 60)
    print("Example 2: Data Transformations")
    print("=" * 60)

    fred = FREDQuery()

    # Get GDP with different transformations
    print("\n2a. GDP - Percent Change from Year Ago:")
    gdp_pch = fred.get_observations(
        "GDP",
        units="pc1",  # Percent change from year ago
        limit=4,
        sort_order="desc"
    )
    if "observations" in gdp_pch:
        for obs in gdp_pch["observations"]:
            if obs["value"] != ".":
                print(f"  {obs['date']}: {obs['value']}%")

    print("\n2b. CPI - Change from Previous Month:")
    cpi_chg = fred.get_observations(
        "CPIAUCSL",
        units="chg",  # Change
        limit=6,
        sort_order="desc"
    )
    if "observations" in cpi_chg:
        for obs in cpi_chg["observations"]:
            if obs["value"] != ".":
                print(f"  {obs['date']}: {obs['value']}")


def example_search():
    """Example: Searching for series."""
    print("\n" + "=" * 60)
    print("Example 3: Searching for Series")
    print("=" * 60)

    fred = FREDQuery()

    # Search for inflation-related series
    print("\n3a. Search for 'inflation' series (monthly, USA):")
    results = fred.search_series(
        "inflation",
        limit=5,
        filter_variable="frequency",
        filter_value="Monthly"
    )
    if "seriess" in results:
        for s in results["seriess"]:
            print(f"  {s['id']}: {s['title'][:60]}...")

    # Search using tags
    print("\n3b. Search using tags (gdp, quarterly, usa):")
    tagged = fred.get_series_by_tags(
        ["gdp", "quarterly", "usa"],
        limit=5
    )
    if "seriess" in tagged:
        for s in tagged["seriess"]:
            print(f"  {s['id']}: {s['title'][:60]}...")


def example_categories():
    """Example: Browsing categories."""
    print("\n" + "=" * 60)
    print("Example 4: Category Browsing")
    print("=" * 60)

    fred = FREDQuery()

    # Get root categories
    print("\n4a. Top-Level Categories:")
    root = fred.get_category_children(0)
    if "categories" in root:
        for cat in root["categories"][:8]:
            print(f"  [{cat['id']}] {cat['name']}")

    # Get series from a specific category
    print("\n4b. Popular Series in GDP Category (53):")
    series = fred.get_category_series(
        53,
        limit=5,
        order_by="popularity",
        sort_order="desc"
    )
    if "seriess" in series:
        for s in series["seriess"]:
            print(f"  {s['id']}: {s['title'][:50]}...")


def example_releases():
    """Example: Working with releases."""
    print("\n" + "=" * 60)
    print("Example 5: Releases and Calendar")
    print("=" * 60)

    fred = FREDQuery()

    # Get upcoming release dates
    today = datetime.now().strftime("%Y-%m-%d")
    next_week = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

    print(f"\n5a. Upcoming Releases (next 7 days):")
    dates = fred.get_release_dates(
        realtime_start=today,
        realtime_end=next_week,
        limit=10,
        sort_order="asc",
        include_release_dates_with_no_data="true"
    )
    if "release_dates" in dates:
        for r in dates["release_dates"][:10]:
            print(f"  {r['date']}: {r.get('release_name', 'Unknown')}")
    else:
        print("  No upcoming releases found")

    # Get series from GDP release
    print("\n5b. Top Series in GDP Release (53):")
    release_series = fred.get_release_series(
        53,
        limit=5,
        order_by="popularity",
        sort_order="desc"
    )
    if "seriess" in release_series:
        for s in release_series["seriess"]:
            print(f"  {s['id']}: {s['title'][:50]}...")


def example_economic_indicators():
    """Example: Building an economic dashboard."""
    print("\n" + "=" * 60)
    print("Example 6: Economic Indicators Dashboard")
    print("=" * 60)

    fred = FREDQuery()

    indicators = [
        ("GDP", "Gross Domestic Product"),
        ("UNRATE", "Unemployment Rate"),
        ("CPIAUCSL", "Consumer Price Index"),
        ("FEDFUNDS", "Federal Funds Rate"),
        ("DGS10", "10-Year Treasury Rate"),
        ("HOUST", "Housing Starts")
    ]

    print("\nLatest Economic Indicators:")
    print("-" * 50)

    for series_id, name in indicators:
        data = fred.get_observations(series_id, limit=1, sort_order="desc")
        if "observations" in data and data["observations"]:
            obs = data["observations"][0]
            value = obs["value"]
            date = obs["date"]
            print(f"  {name:30} {value:>12} ({date})")


def example_time_series_analysis():
    """Example: Time series analysis."""
    print("\n" + "=" * 60)
    print("Example 7: Time Series Analysis")
    print("=" * 60)

    fred = FREDQuery()

    # Get unemployment rate for past 2 years
    start_date = (datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d")

    print(f"\nUnemployment Rate Trend (since {start_date}):")
    data = fred.get_observations(
        "UNRATE",
        observation_start=start_date,
        sort_order="asc"
    )

    if "observations" in data:
        obs = data["observations"]
        values = [float(o["value"]) for o in obs if o["value"] != "."]

        if values:
            print(f"  Data points: {len(values)}")
            print(f"  Min: {min(values):.1f}%")
            print(f"  Max: {max(values):.1f}%")
            print(f"  Average: {sum(values)/len(values):.1f}%")
            print(f"  Latest: {values[-1]:.1f}%")

            # Simple trend
            if len(values) >= 12:
                recent_avg = sum(values[-6:]) / 6
                older_avg = sum(values[-12:-6]) / 6
                trend = "increasing" if recent_avg > older_avg else "decreasing"
                print(f"  6-month trend: {trend}")


def example_vintage_data():
    """Example: Accessing vintage (historical) data."""
    print("\n" + "=" * 60)
    print("Example 8: Vintage Data (ALFRED)")
    print("=" * 60)

    fred = FREDQuery()

    # Get vintage dates for GDP
    print("\nGDP Revision History (recent vintage dates):")
    vintages = fred.get_vintage_dates("GDP")

    if "vintage_dates" in vintages:
        dates = vintages["vintage_dates"][-10:]  # Last 10
        for vd in dates:
            print(f"  {vd}")

    # Compare current vs historical data
    print("\nComparing current vs historical GDP view:")
    current = fred.get_observations("GDP", limit=1, sort_order="desc")
    if "observations" in current and current["observations"]:
        obs = current["observations"][0]
        print(f"  Current value for {obs['date']}: ${obs['value']} billion")


def example_sources():
    """Example: Working with data sources."""
    print("\n" + "=" * 60)
    print("Example 9: Data Sources")
    print("=" * 60)

    fred = FREDQuery()

    # Get sources
    print("\nMajor Data Sources:")
    sources = fred.get_sources(limit=10, order_by="name")
    if "sources" in sources:
        for s in sources["sources"]:
            print(f"  [{s['id']:3}] {s['name'][:50]}...")

    # Get releases from BLS
    print("\nReleases from Bureau of Labor Statistics (ID: 22):")
    bls = fred.get_source_releases(22, limit=5)
    if "releases" in bls:
        for r in bls["releases"]:
            print(f"  {r['name'][:50]}...")


def example_regional_data():
    """Example: Regional/geographic data."""
    print("\n" + "=" * 60)
    print("Example 10: Regional Data (GeoFRED)")
    print("=" * 60)

    fred = FREDQuery()

    # Get state unemployment rates
    print("\nState Unemployment Rates (sample):")
    regional = fred.get_regional_data(
        series_group="1220",  # Unemployment rate
        region_type="state",
        date="2023-01-01",
        units="Percent",
        frequency="a",
        season="NSA"
    )

    if "data" in regional:
        date_key = list(regional["data"].keys())[0]
        states = regional["data"][date_key][:10]
        for state in states:
            print(f"  {state['region']:20} {state['value']:>6}%")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("FRED API Examples")
    print("=" * 60)

    # Check for API key
    api_key = os.environ.get("FRED_API_KEY")
    if not api_key:
        print("\nERROR: FRED_API_KEY environment variable not set.")
        print("\nTo get an API key:")
        print("  1. Create account at https://fredaccount.stlouisfed.org")
        print("  2. Request API key from your account dashboard")
        print("  3. Set environment variable:")
        print("     export FRED_API_KEY='your_key_here'")
        return

    try:
        # Run examples
        example_basic_series()
        example_transformations()
        example_search()
        example_categories()
        example_releases()
        example_economic_indicators()
        example_time_series_analysis()
        example_vintage_data()
        example_sources()
        example_regional_data()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\nError running examples: {e}")
        raise


if __name__ == "__main__":
    main()
