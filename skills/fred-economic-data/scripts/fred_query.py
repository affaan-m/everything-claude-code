"""
FRED API Query Module

Provides a unified interface to query the Federal Reserve Economic Data (FRED) API.
"""

import os
import time
import requests
from typing import Optional, Dict, Any, List
from functools import lru_cache


class FREDQuery:
    """
    Client for querying the FRED API.

    Example:
        >>> fred = FREDQuery(api_key="your_key")
        >>> gdp = fred.get_observations("GDP")
        >>> print(gdp["observations"][-1])
    """

    BASE_URL = "https://api.stlouisfed.org/fred"
    GEOFRED_URL = "https://api.stlouisfed.org/geofred"

    def __init__(
        self,
        api_key: Optional[str] = None,
        cache_ttl: int = 3600,
        max_retries: int = 3,
        retry_delay: float = 1.0
    ):
        """
        Initialize FRED API client.

        Args:
            api_key: FRED API key. If not provided, uses FRED_API_KEY env var.
            cache_ttl: Cache time-to-live in seconds (default: 1 hour).
            max_retries: Maximum number of retries for failed requests.
            retry_delay: Base delay between retries in seconds.
        """
        self.api_key = api_key or os.environ.get("FRED_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key required. Set FRED_API_KEY environment variable or pass api_key parameter."
            )

        self.cache_ttl = cache_ttl
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._cache: Dict[str, tuple] = {}  # (timestamp, data)

    def _make_request(
        self,
        endpoint: str,
        params: Dict[str, Any],
        base_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Make API request with retry logic."""
        url = f"{base_url or self.BASE_URL}/{endpoint}"
        params["api_key"] = self.api_key
        params["file_type"] = "json"

        # Check cache
        cache_key = f"{url}:{str(sorted(params.items()))}"
        if cache_key in self._cache:
            timestamp, data = self._cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return data

        # Make request with retry
        for attempt in range(self.max_retries):
            try:
                response = requests.get(url, params=params, timeout=30)

                if response.status_code == 429:
                    # Rate limited - wait and retry
                    wait_time = self.retry_delay * (2 ** attempt)
                    time.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()

                # Cache successful response
                self._cache[cache_key] = (time.time(), data)
                return data

            except requests.exceptions.RequestException as e:
                if attempt == self.max_retries - 1:
                    return {"error": {"code": 500, "message": str(e)}}
                time.sleep(self.retry_delay * (2 ** attempt))

        return {"error": {"code": 500, "message": "Max retries exceeded"}}

    # ========== Series Endpoints ==========

    def get_series(self, series_id: str, **kwargs) -> Dict[str, Any]:
        """
        Get metadata for an economic data series.

        Args:
            series_id: The FRED series ID (e.g., "GDP", "UNRATE").
            **kwargs: Additional parameters (realtime_start, realtime_end).

        Returns:
            Series metadata including title, units, frequency, etc.
        """
        params = {"series_id": series_id, **kwargs}
        return self._make_request("series", params)

    def get_observations(
        self,
        series_id: str,
        observation_start: Optional[str] = None,
        observation_end: Optional[str] = None,
        units: str = "lin",
        frequency: Optional[str] = None,
        aggregation_method: str = "avg",
        limit: int = 100000,
        offset: int = 0,
        sort_order: str = "asc",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Get observations (data values) for an economic data series.

        Args:
            series_id: The FRED series ID.
            observation_start: Start date (YYYY-MM-DD).
            observation_end: End date (YYYY-MM-DD).
            units: Data transformation (lin, chg, ch1, pch, pc1, pca, cch, cca, log).
            frequency: Frequency aggregation (d, w, m, q, a, etc.).
            aggregation_method: Aggregation method (avg, sum, eop).
            limit: Maximum observations (1-100000).
            offset: Pagination offset.
            sort_order: Sort order (asc, desc).
            **kwargs: Additional parameters.

        Returns:
            Observations with dates and values.
        """
        params = {
            "series_id": series_id,
            "units": units,
            "aggregation_method": aggregation_method,
            "limit": limit,
            "offset": offset,
            "sort_order": sort_order,
            **kwargs
        }
        if observation_start:
            params["observation_start"] = observation_start
        if observation_end:
            params["observation_end"] = observation_end
        if frequency:
            params["frequency"] = frequency

        return self._make_request("series/observations", params)

    def search_series(
        self,
        search_text: str,
        search_type: str = "full_text",
        limit: int = 100,
        offset: int = 0,
        order_by: str = "search_rank",
        sort_order: str = "desc",
        filter_variable: Optional[str] = None,
        filter_value: Optional[str] = None,
        tag_names: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Search for economic data series by keywords.

        Args:
            search_text: Keywords to search.
            search_type: Search type (full_text, series_id).
            limit: Maximum results (1-1000).
            offset: Pagination offset.
            order_by: Sort field.
            sort_order: Sort direction.
            filter_variable: Filter by (frequency, units, seasonal_adjustment).
            filter_value: Filter value.
            tag_names: Semicolon-delimited tags.
            **kwargs: Additional parameters.

        Returns:
            Matching series with metadata.
        """
        params = {
            "search_text": search_text,
            "search_type": search_type,
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            **kwargs
        }
        if filter_variable:
            params["filter_variable"] = filter_variable
        if filter_value:
            params["filter_value"] = filter_value
        if tag_names:
            params["tag_names"] = tag_names

        return self._make_request("series/search", params)

    def get_series_categories(self, series_id: str, **kwargs) -> Dict[str, Any]:
        """Get categories for a series."""
        params = {"series_id": series_id, **kwargs}
        return self._make_request("series/categories", params)

    def get_series_release(self, series_id: str, **kwargs) -> Dict[str, Any]:
        """Get release for a series."""
        params = {"series_id": series_id, **kwargs}
        return self._make_request("series/release", params)

    def get_series_tags(self, series_id: str, **kwargs) -> Dict[str, Any]:
        """Get tags for a series."""
        params = {"series_id": series_id, **kwargs}
        return self._make_request("series/tags", params)

    def get_series_updates(
        self,
        limit: int = 100,
        offset: int = 0,
        filter_value: str = "all",
        **kwargs
    ) -> Dict[str, Any]:
        """Get recently updated series."""
        params = {
            "limit": limit,
            "offset": offset,
            "filter_value": filter_value,
            **kwargs
        }
        return self._make_request("series/updates", params)

    def get_vintage_dates(self, series_id: str, **kwargs) -> Dict[str, Any]:
        """Get vintage dates for a series (when data was revised)."""
        params = {"series_id": series_id, **kwargs}
        return self._make_request("series/vintagedates", params)

    # ========== Category Endpoints ==========

    def get_category(self, category_id: int = 0, **kwargs) -> Dict[str, Any]:
        """
        Get a category.

        Args:
            category_id: Category ID (0 = root).
        """
        params = {"category_id": category_id, **kwargs}
        return self._make_request("category", params)

    def get_category_children(self, category_id: int = 0, **kwargs) -> Dict[str, Any]:
        """Get child categories."""
        params = {"category_id": category_id, **kwargs}
        return self._make_request("category/children", params)

    def get_category_series(
        self,
        category_id: int,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "series_id",
        sort_order: str = "asc",
        **kwargs
    ) -> Dict[str, Any]:
        """Get series in a category."""
        params = {
            "category_id": category_id,
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            **kwargs
        }
        return self._make_request("category/series", params)

    def get_category_tags(self, category_id: int, **kwargs) -> Dict[str, Any]:
        """Get tags for a category."""
        params = {"category_id": category_id, **kwargs}
        return self._make_request("category/tags", params)

    # ========== Release Endpoints ==========

    def get_releases(
        self,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "release_id",
        sort_order: str = "asc",
        **kwargs
    ) -> Dict[str, Any]:
        """Get all releases."""
        params = {
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            **kwargs
        }
        return self._make_request("releases", params)

    def get_release_dates(
        self,
        realtime_start: Optional[str] = None,
        realtime_end: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "release_date",
        sort_order: str = "desc",
        include_release_dates_with_no_data: str = "false",
        **kwargs
    ) -> Dict[str, Any]:
        """Get release dates for all releases."""
        params = {
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            "include_release_dates_with_no_data": include_release_dates_with_no_data,
            **kwargs
        }
        if realtime_start:
            params["realtime_start"] = realtime_start
        if realtime_end:
            params["realtime_end"] = realtime_end
        return self._make_request("releases/dates", params)

    def get_release(self, release_id: int, **kwargs) -> Dict[str, Any]:
        """Get a specific release."""
        params = {"release_id": release_id, **kwargs}
        return self._make_request("release", params)

    def get_release_series(
        self,
        release_id: int,
        limit: int = 100,
        offset: int = 0,
        **kwargs
    ) -> Dict[str, Any]:
        """Get series in a release."""
        params = {
            "release_id": release_id,
            "limit": limit,
            "offset": offset,
            **kwargs
        }
        return self._make_request("release/series", params)

    def get_release_sources(self, release_id: int, **kwargs) -> Dict[str, Any]:
        """Get sources for a release."""
        params = {"release_id": release_id, **kwargs}
        return self._make_request("release/sources", params)

    def get_release_tables(self, release_id: int, **kwargs) -> Dict[str, Any]:
        """Get release table structure."""
        params = {"release_id": release_id, **kwargs}
        return self._make_request("release/tables", params)

    # ========== Tag Endpoints ==========

    def get_tags(
        self,
        tag_group_id: Optional[str] = None,
        search_text: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "series_count",
        sort_order: str = "desc",
        **kwargs
    ) -> Dict[str, Any]:
        """Get FRED tags."""
        params = {
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            **kwargs
        }
        if tag_group_id:
            params["tag_group_id"] = tag_group_id
        if search_text:
            params["search_text"] = search_text
        return self._make_request("tags", params)

    def get_related_tags(
        self,
        tag_names: str,
        limit: int = 100,
        offset: int = 0,
        **kwargs
    ) -> Dict[str, Any]:
        """Get related tags."""
        params = {
            "tag_names": tag_names,
            "limit": limit,
            "offset": offset,
            **kwargs
        }
        return self._make_request("related_tags", params)

    def get_series_by_tags(
        self,
        tag_names: List[str],
        exclude_tag_names: Optional[List[str]] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "popularity",
        sort_order: str = "desc",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Get series matching all specified tags.

        Args:
            tag_names: List of tags (series must match all).
            exclude_tag_names: Tags to exclude.
            limit: Maximum results.
            offset: Pagination offset.
            order_by: Sort field.
            sort_order: Sort direction.
        """
        params = {
            "tag_names": ";".join(tag_names),
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            **kwargs
        }
        if exclude_tag_names:
            params["exclude_tag_names"] = ";".join(exclude_tag_names)
        return self._make_request("tags/series", params)

    # ========== Source Endpoints ==========

    def get_sources(
        self,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "source_id",
        sort_order: str = "asc",
        **kwargs
    ) -> Dict[str, Any]:
        """Get all data sources."""
        params = {
            "limit": limit,
            "offset": offset,
            "order_by": order_by,
            "sort_order": sort_order,
            **kwargs
        }
        return self._make_request("sources", params)

    def get_source(self, source_id: int, **kwargs) -> Dict[str, Any]:
        """Get a specific source."""
        params = {"source_id": source_id, **kwargs}
        return self._make_request("source", params)

    def get_source_releases(
        self,
        source_id: int,
        limit: int = 100,
        offset: int = 0,
        **kwargs
    ) -> Dict[str, Any]:
        """Get releases from a source."""
        params = {
            "source_id": source_id,
            "limit": limit,
            "offset": offset,
            **kwargs
        }
        return self._make_request("source/releases", params)

    # ========== GeoFRED Endpoints ==========

    def get_shapes(self, shape: str) -> Dict[str, Any]:
        """
        Get GeoJSON shape files for mapping.

        Args:
            shape: Shape type (state, county, msa, country, frb, bea, etc.)
        """
        params = {"shape": shape}
        return self._make_request("shapes/file", params, base_url=self.GEOFRED_URL)

    def get_series_group(self, series_id: str) -> Dict[str, Any]:
        """Get metadata for a regional series group."""
        params = {"series_id": series_id}
        return self._make_request("series/group", params, base_url=self.GEOFRED_URL)

    def get_series_data(
        self,
        series_id: str,
        date: Optional[str] = None,
        start_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get regional data for a series."""
        params = {"series_id": series_id}
        if date:
            params["date"] = date
        if start_date:
            params["start_date"] = start_date
        return self._make_request("series/data", params, base_url=self.GEOFRED_URL)

    def get_regional_data(
        self,
        series_group: str,
        region_type: str,
        date: str,
        units: str,
        season: str = "NSA",
        frequency: str = "a",
        transformation: str = "lin",
        aggregation_method: str = "avg",
        start_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get regional data by series group.

        Args:
            series_group: Series group ID.
            region_type: Region type (state, county, msa, country, etc.)
            date: Target date (YYYY-MM-DD).
            units: Units of measurement.
            season: Seasonality (SA, NSA, SSA, SAAR, NSAAR).
            frequency: Frequency (d, w, m, q, a).
            transformation: Data transformation.
            aggregation_method: Aggregation method.
            start_date: Start date for range.
        """
        params = {
            "series_group": series_group,
            "region_type": region_type,
            "date": date,
            "units": units,
            "season": season,
            "frequency": frequency,
            "transformation": transformation,
            "aggregation_method": aggregation_method
        }
        if start_date:
            params["start_date"] = start_date
        return self._make_request("regional/data", params, base_url=self.GEOFRED_URL)

    # ========== Utility Methods ==========

    def clear_cache(self):
        """Clear the response cache."""
        self._cache.clear()


# Convenience function for quick queries
def query_fred(series_id: str, api_key: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    """
    Quick function to query a FRED series.

    Args:
        series_id: The FRED series ID.
        api_key: API key (uses FRED_API_KEY env var if not provided).
        **kwargs: Additional parameters for get_observations.

    Returns:
        Series observations.
    """
    client = FREDQuery(api_key=api_key)
    return client.get_observations(series_id, **kwargs)


if __name__ == "__main__":
    # Quick test
    import json

    api_key = os.environ.get("FRED_API_KEY")
    if api_key:
        fred = FREDQuery(api_key=api_key)

        # Get GDP data
        print("Fetching GDP data...")
        gdp = fred.get_observations("GDP", limit=5, sort_order="desc")
        print(json.dumps(gdp, indent=2))
    else:
        print("Set FRED_API_KEY environment variable to test")
