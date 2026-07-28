# API Discovery - Jobbland.se

## Existing Actor Audit

- Previous target: Remote.co, not Jobbland.se.
- Previous approach: CheerioCrawler, HTML/listing parsing, JSON-LD detail fallback.
- Previous output fields: title, company, category, location, date_posted, description_html, description_text, url.
- Current issue found: `src/main.js` referenced `category` without defining it.

## Selected API

- Endpoint: `https://jobbland.se/api/v2/jobentries`
- Method: `GET`
- Auth: None.
- Pagination: `page` query parameter. Response includes `pagination.current_page`, `pagination.next_page`, `pagination.total_items`, `pagination.total_pages`, and `pagination.page_size`.
- Required stable parameters: `format=json`, `site=jobbland.se`, `page`.
- Useful filters: `search`, `area`, `category`, `title`, `company`, `job_location_type`, `employment_type`, `working_hour`, `salary_min`, `order_by`.
- Field count: more than 30 useful listing fields before nested flattening.
- Description fields: the listing API does not expose full descriptions. The actor enriches records with `description_html` and `description_text` from Jobbland's serialized `window.__INITIAL_STATE__` job data using direct HTTP requests to job URLs. No browser automation, DOM selectors, or visual page parsing are used.
- Works with plain HTTP: Yes. Tested with direct HTTP calls and referer set to a Jobbland page.
- Browser required: No.
- Proxy required: No in local tests. Actor supports Apify/custom proxies when configured on Apify.

## Fields Available

The API returns structured job entries with fields including:

- `id`
- `heading`
- `slug`
- `link`
- `address`
- `municipality_name`
- `postal_code`
- `company_name`
- `company.id`
- `company.name`
- `company.slug`
- `company.logo_url`
- `company.search_url`
- `company.vat_id`
- `category.id`
- `category.name`
- `category.slug`
- `category.link`
- `location.id`
- `location.name`
- `location.slug`
- `location.search_url`
- `location.parent_name`
- `additional_locations`
- `logo_url`
- `posted_at`
- `ends_at`
- `apply_method`
- `salary`
- `salary_estimate.low`
- `salary_estimate.high`
- `salary_estimate.median`
- `salary_estimate.average`
- `salary_estimate.period`
- `salary_estimate.year`
- `job_location_type`
- `lede`
- Full `description_html` and `description_text` are available from serialized job state on the job URL, not from `/api/v2/jobentries`.
- `seniority`
- `required_spoken_languages`
- `product.name`
- `product.type`
- `product.recommend_in_search`

## Candidate Matrix

| Candidate | Header profile | Status/body marker | Fields | Pagination | Decision |
|---|---|---:|---:|---|---|
| `/api/v2/jobentries` | Direct HTTP with Jobbland referer | 200 JSON with `jobentries` | 30+ | `page`, `next_page`, totals | Selected |
| `/api/v2/jobentries` with guessed include/expand/detail parameters | Direct HTTP | 200 JSON, same list payload | No full description | Same as selected endpoint | Rejected for descriptions |
| `/api/v2/jobentries/{id or slug}` and related guessed detail endpoints | Direct HTTP | 404 JSON or redirects | No stable detail payload | No | Rejected |
| `/api/filter` | Direct HTTP | 200 JSON with filter counts | Filter metadata only | No job rows | Rejected as supporting-only |
| Job URL serialized state | Direct HTTP with Jobbland referer | 200 HTML containing `window.__INITIAL_STATE__` | Full `description_html` | Per job URL | Selected only for description enrichment |
| Listing page HTML | Browser/desktop HTTP | 200 HTML with rendered cards | Visible fields only | HTML links | Rejected by requirement |
| Detail page JSON-LD | Browser/desktop HTTP | 200 HTML with JSON-LD | Rich description | Per detail page only | Rejected by requirement to avoid HTML parsing |
| URLScan public scans | URLScan search | Existing scans were auth pages | Not useful | Not useful | Rejected |

## Tested URL Patterns

These URL patterns can be converted to API filters:

- `https://jobbland.se/lediga-jobb`
- `https://jobbland.se/lediga-jobb/stockholm`
- `https://jobbland.se/lediga-jobb/stockholm?search=software&page=2`
- `https://jobbland.se/lediga-jobb/kategori/data-och-it`
- `https://jobbland.se/lediga-jobb/yrke/software-engineer-sv`
- `https://jobbland.se/lediga-jobb/stockholm/kategori/data-och-it`
- `https://jobbland.se/lediga-jobb/stockholm/yrke/mjukvaruingenjor`
- `https://jobbland.se/lediga-jobb/foretag/tullverket`

## Implementation Notes

- Actor uses the selected list API directly for search and pagination.
- Full descriptions are not present in the list API. The actor uses direct HTTP to read the job's serialized application state and extract `pageData.jobentry.description_html`, then derives `description_text`.
- Browser automation is not used.
- User input takes priority over schema prefills and local `INPUT.json`.
- `url` takes priority over keyword/filter fields when both are provided.
- Dataset records are recursively cleaned so null, undefined, empty string, empty array, and empty object values are not pushed.
- Data is pushed page-by-page in batches.
