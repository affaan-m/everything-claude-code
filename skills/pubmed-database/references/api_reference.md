# PubMed E-utilities API Reference

## Overview

The NCBI E-utilities provide programmatic access to PubMed and other Entrez databases through a REST API. The base URL for all E-utilities is:

```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
```

## API Key Requirements

As of December 1, 2018, NCBI enforces API key usage for E-utility calls. API keys increase rate limits from 3 requests/second to 10 requests/second. To obtain an API key, register for an NCBI account and generate a key from your account settings.

Include the API key in requests using the `&api_key` parameter:
```
esearch.fcgi?db=pubmed&term=cancer&api_key=YOUR_API_KEY
```

## Rate Limits

- **Without API key**: 3 requests per second
- **With API key**: 10 requests per second
- Always include a User-Agent header in requests

## Core E-utility Tools

### 1. ESearch - Query Databases

**Endpoint**: `esearch.fcgi`

**Purpose**: Search an Entrez database and retrieve a list of UIDs (e.g., PMIDs for PubMed)

**Required Parameters**:
- `db` - Database to search (e.g., pubmed, gene, protein)
- `term` - Search query

**Optional Parameters**:
- `retmax` - Maximum records to return (default: 20, max: 10000)
- `retstart` - Index of first record to return (default: 0)
- `usehistory=y` - Store results on history server for large result sets
- `retmode` - Return format (xml, json)
- `sort` - Sort order (relevance, pub_date, first_author, last_author, journal)
- `field` - Limit search to specific field
- `datetype` - Type of date to use for filtering (pdat for publication date)
- `mindate` - Minimum date (YYYY/MM/DD format)
- `maxdate` - Maximum date (YYYY/MM/DD format)

**Example Request**:
```
esearch.fcgi?db=pubmed&term=breast+cancer&retmax=100&retmode=json&api_key=YOUR_API_KEY
```

**Response Elements**:
- `Count` - Total number of records matching query
- `RetMax` - Number of records returned in this response
- `RetStart` - Index of first returned record
- `IdList` - List of UIDs (PMIDs)
- `WebEnv` - History server environment string (when usehistory=y)
- `QueryKey` - Query key for history server (when usehistory=y)

### 2. EFetch - Download Records

**Endpoint**: `efetch.fcgi`

**Purpose**: Retrieve full records from a database in various formats

**Required Parameters**:
- `db` - Database name
- `id` - Comma-separated list of UIDs, or use WebEnv/query_key from ESearch

**Optional Parameters**:
- `rettype` - Record type (abstract, medline, xml, uilist)
- `retmode` - Return mode (text, xml)
- `retstart` - Starting record index
- `retmax` - Maximum records per request

**Example Request**:
```
efetch.fcgi?db=pubmed&id=123456,234567&rettype=abstract&retmode=text&api_key=YOUR_API_KEY
```

**Common rettype Values for PubMed**:
- `abstract` - Abstract text
- `medline` - Full MEDLINE format
- `xml` - PubMed XML format
- `uilist` - List of UIDs only

### 3. ESummary - Retrieve Document Summaries

**Endpoint**: `esummary.fcgi`

**Purpose**: Get document summaries (DocSum) for a list of UIDs

**Required Parameters**:
- `db` - Database name
- `id` - Comma-separated UIDs or WebEnv/query_key

**Optional Parameters**:
- `retmode` - Return format (xml, json)
- `version` - DocSum version (1.0 or 2.0, default is 1.0)

**Example Request**:
```
esummary.fcgi?db=pubmed&id=123456,234567&retmode=json&version=2.0&api_key=YOUR_API_KEY
```

**DocSum Fields** (vary by database, common PubMed fields):
- Title
- Authors
- Source (journal)
- PubDate
- Volume, Issue, Pages
- DOI
- PmcRefCount (citations in PMC)

### 4. EPost - Upload UIDs

**Endpoint**: `epost.fcgi`

**Purpose**: Upload a list of UIDs to the history server for use in subsequent requests

**Required Parameters**:
- `db` - Database name
- `id` - Comma-separated list of UIDs

**Example Request**:
```
epost.fcgi?db=pubmed&id=123456,234567,345678&api_key=YOUR_API_KEY
```

**Response**:
Returns WebEnv and QueryKey for use in subsequent requests

### 5. ELink - Find Related Data

**Endpoint**: `elink.fcgi`

**Purpose**: Find related records within the same database or in different databases

**Required Parameters**:
- `dbfrom` - Source database
- `db` - Target database (can be same as dbfrom)
- `id` - UID(s) from source database

**Optional Parameters**:
- `cmd` - Link command (neighbor, neighbor_history, prlinks, llinks, etc.)
- `linkname` - Specific link type to retrieve
- `term` - Filter results with search query
- `holding` - Filter by library holdings

**Example Request**:
```
elink.fcgi?dbfrom=pubmed&db=pubmed&id=123456&cmd=neighbor&api_key=YOUR_API_KEY
```

**Common Link Commands**:
- `neighbor` - Return related records
- `neighbor_history` - Post related records to history server
- `prlinks` - Return provider URLs
- `llinks` - Return LinkOut URLs

### 6. EInfo - Database Information

**Endpoint**: `einfo.fcgi`

**Purpose**: Get information about available Entrez databases or specific database fields

**Parameters**:
- `db` - Database name (optional; omit to list all databases)
- `retmode` - Return format (xml, json)

**Example Request**:
```
einfo.fcgi?db=pubmed&retmode=json&api_key=YOUR_API_KEY
```

**Returns**:
- Database description
- Record count
- Last update date
- Available search fields with descriptions

### 7. EGQuery - Global Query

**Endpoint**: `egquery.fcgi`

**Purpose**: Search term counts across all Entrez databases

**Required Parameters**:
- `term` - Search query

**Example Request**:
```
egquery.fcgi?term=cancer&api_key=YOUR_API_KEY
```

### 8. ESpell - Spelling Suggestions

**Endpoint**: `espell.fcgi`

**Purpose**: Get spelling suggestions for queries

**Required Parameters**:
- `db` - Database name
- `term` - Search term with potential misspelling

**Example Request**:
```
espell.fcgi?db=pubmed&term=cancre&api_key=YOUR_API_KEY
```

### 9. ECitMatch - Citation Matching

**Endpoint**: `ecitmatch.cgi`

**Purpose**: Search PubMed citations using journal, year, volume, page, author information

**Request Format**: POST request with citation strings

**Citation String Format**:
```
journal|year|volume|page|author|key|
```

**Example**:
```
Science|2008|320|5880|1185|key1|
Nature|2010|463|7279|318|key2|
```

**Rate Limit**: 3 requests per second with User-Agent header required

## Best Practices

### Use History Server for Large Result Sets

For queries returning more than 500 records, use the history server:

1. **Initial Search with History**:
```
esearch.fcgi?db=pubmed&term=cancer&usehistory=y&retmode=json&api_key=YOUR_API_KEY
```

2. **Retrieve Records in Batches**:
```
efetch.fcgi?db=pubmed&query_key=1&WebEnv=MCID_12345&retstart=0&retmax=500&rettype=xml&api_key=YOUR_API_KEY
efetch.fcgi?db=pubmed&query_key=1&WebEnv=MCID_12345&retstart=500&retmax=500&rettype=xml&api_key=YOUR_API_KEY
```

### Batch Operations

Use EPost to upload large lists of UIDs before fetching:

```
# Step 1: Post UIDs
epost.fcgi?db=pubmed&id=123,456,789,...&api_key=YOUR_API_KEY

# Step 2: Fetch using WebEnv/query_key
efetch.fcgi?db=pubmed&query_key=1&WebEnv=MCID_12345&rettype=xml&api_key=YOUR_API_KEY
```

### Error Handling

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (check parameters)
- `414` - URI too long (use POST or history server)
- `429` - Rate limit exceeded

### Caching

Implement local caching to:
- Reduce redundant API calls
- Stay within rate limits
- Improve response times
- Respect NCBI resources

## Response Formats

### XML (Default)

Most detailed format with full structured data. Each database has its own DTD (Document Type Definition).

### JSON

Available for most utilities with `retmode=json`. Easier to parse in modern applications.

### Text

Plain text format, useful for abstracts and simple data retrieval.

## Support and Resources

- **API Documentation**: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- **Mailing List**: utilities-announce@ncbi.nlm.nih.gov
- **Support**: vog.hin.mln.ibcn@seitilitue
- **NLM Help Desk**: 1-888-FIND-NLM (1-888-346-3656)
