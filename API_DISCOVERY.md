# API Discovery - JobbSafari (jobbsafari.se)

## Target

JobbSafari, the Swedish job board formerly published as Jobbland.se. `https://jobbland.se/*` now returns a 301 redirect to `https://jobbsafari.se/*`, so the old Jobbland API path no longer serves data.

## Selected API (primary)

`GET https://jobbsafari.se/api/next/job-entries`

- Public, no authentication, no cookies.
- The `/api/*` namespace is not behind the Cloudflare challenge that blocks page HTML.
- Verified 2026-11-27 with `impit` browser profiles `chrome` and `firefox`, with and without a referer.

## Request contract

| Item | Value |
|---|---|
| Method | `GET` |
| URL | `https://jobbsafari.se/api/next/job-entries` |
| Query: pagination | `page` (1-based). Fixed page size of 30. |
| Query: search | `search` (raw text, spaces allowed; `sok` is also accepted) |
| Query: area | `area` (slug, e.g. `stockholm`; `ort` is also accepted) |
| Query: filters | `category`, `title`, `company`, `job_location_type`, `employment_type`, `competence` |
| Headers | `accept: application/json`; `referer` is optional |
| Auth | None |

The website URL aliases `sok`, `ort`, `kategori`, `yrke`, `foretag`, `arbetsplats`, `omfattning`, and `kompetens` map to the API names above. Search text must not be slugified: `search=software engineer` returns more results than `search=software-engineer`.

## Response shape

```json
{
  "count": 271,
  "results": [
    {
      "pk": 20737775,
      "title": "Platform Engineer inom Observability",
      "slug": "platform-engineer-...-20737775",
      "startDate": "11/18/2026, 12:21:53 PM",
      "endDate": "12/11/2026, 9:59:00 PM",
      "dateUpdated": "2026-11-26T07:00:41.936305+02:00",
      "company": { "pk": 540361, "name": "Example AB", "slug": "example-ab", "logoUrl": "https://...", "listable": true, "hasPcp": false },
      "locations": [{ "pk": 15960, "area": { "pk": 15960, "name": "Stockholm", "slug": "stockholm" }, "name": "Stockholm" }],
      "categories": [],
      "mainCategories": [],
      "subcategories": [],
      "logoUrl": "https://...",
      "apply": { "method": "url", "href": "https://employer.example/jobs/123" },
      "publishLevel": { "name": "Job Ad Campaign", "type": "campaign", "recommendInSearch": true },
      "status": 2
    }
  ]
}
```

`categories`, `mainCategories`, and `subcategories` were empty in every sampled result. The search response has no description, salary, or workplace-type field.

## Description enrichment

The listing API does not return descriptions. Job detail pages are Next.js SSG pages whose `__NEXT_DATA__` script contains the full job entry. Direct requests get a Cloudflare managed challenge (403). Apify residential proxy with country `SE` passes the challenge (200) and returns the page HTML.

| Item | Value |
|---|---|
| URL | `https://jobbsafari.se/jobb/<slug>` |
| Method | `GET` |
| Headers | `accept: text/html`, `referer: https://jobbsafari.se/lediga-jobb` |
| Proxy | Apify residential, country `SE` |
| Parser | `<script id="__NEXT_DATA__" type="application/json">...</script>`, then `props.pageProps.jobEntry` |

Fields available on the detail entry:

| Field | Type | Example |
|---|---|---|
| `description` | string (HTML) | `<p>...</p>` |
| `description_summary` | string | short summary |
| `category` | object | `{ pk, name, slug }` |
| `jobTitles` | array | `[{ pk, name, slug }]` |
| `salary` | object | `{ low, high, median, average, percentile_10..90, period, year, currency, jobtitle }` |
| `benefits` | array of strings | `["Remote work"]` |
| `seniority`, `employmentType`, `workingHours`, `engagement_type` | string or object | often null |
| `sourceName` | string | `JobbSafari` |
| `bannerImage` | string or null | image URL |

The actor fetches detail pages with an internal concurrency of 8 and merges the fields into each listing. Descriptions are off by default; set `includeDescriptions: true` to enable this stage.

`/_next/data/<buildId>/jobb/<slug>.json` returns 404 for this page, so the HTML page is the only public source. The backend API `https://api.jobbland.no/api/jobentries` returns 401 without a server-side token.

## Pagination

- `page` starts at 1 and returns 30 items per page.
- Stop when the page is empty, `page >= ceil(count / 30)`, or the requested result cap is reached.
- `count` is the total matching items for the query.
- Ordering is real-time; a single item can repeat across consecutive pages, so records are deduplicated by `pk`.

## Field mapping to dataset

| Dataset field | Source |
|---|---|
| `id` | `pk` |
| `title` | `title` |
| `slug` | `slug` |
| `company`, `company_id`, `company_slug` | `company.name`, `company.pk`, `company.slug` |
| `location` | `locations[0].name` |
| `municipality`, `location_slug` | `locations[0].area.name`, `locations[0].area.slug` |
| `additional_locations` | `locations[1..].name` |
| `apply_method`, `apply_url` | `apply.method`, `apply.href` |
| `posted_at`, `ends_at` | `startDate`, `endDate` (as returned by the API) |
| `date_updated` | `dateUpdated` |
| `description_html`, `description_text` | detail `description` (HTML, plain text) |
| `description_summary` | detail `description_summary` |
| `category`, `category_id`, `category_slug` | detail `category.name`, `category.pk`, `category.slug` |
| `job_titles` | detail `jobTitles[].name` |
| `salary` | detail `salary.*` |
| `benefits` | detail `benefits` |
| `seniority`, `employment_type`, `working_hours`, `engagement_type` | detail fields |
| `source_name`, `banner_image` | detail `sourceName`, `bannerImage` |
| `logo_url` | `logoUrl` or `company.logoUrl` |
| `product_name`, `product_type`, `recommended_in_search` | `publishLevel.*` |
| `status` | `status` |
| `url` | `https://jobbsafari.se/jobb/<slug>` |
| `source` | `jobbsafari.se` |
| `search_total_items`, `search_total_pages`, `search_page` | `count`, `ceil(count / 30)`, current page |

## Rejected candidates

| Candidate | Result | Decision |
|---|---|---|
| `https://jobbland.se/api/v2/jobentries` | 301 to `https://jobbsafari.se/?...`, then Cloudflare 403 | Old path, removed |
| `https://jobbland.se/api/next/job-entries` | 301 to jobbsafari.se | Removed |
| `https://jobbsafari.se/api/v2/jobentries` | Next.js 404 page | Removed |
| `https://jobbsafari.se/jobb/<slug>` | Cloudflare 403 direct; 200 through Apify residential proxy (SE) | Selected for description enrichment |
| `https://jobbsafari.se/_next/data/<buildId>/jobb/<slug>.json` | 404 Next page | Not available |
| `/api/next/job-entries/<pk>`, `?pk=`, `?slug=`, `?id=` | 404, or parameter ignored | No single-entry API |
| `?detailed`, `?expand`, `?include`, `?fields`, `?full`, `?description` | Ignored, same compact payload | No description field |
| `https://api.jobbland.no/api/jobentries` | 401 without a server-side token | Not public |
| Search page `__NEXT_DATA__` | 30 listing items, no description | Listing only |
| `https://jobbsafari.no/api/next/job-entries` | Works, but serves Norwegian jobs | Wrong country for this actor |

## Browser profile matrix

| # | Profile | Headers | Result (2026-11-27) |
|---|---|---|---|
| 1 | `chrome` | `accept: application/json` | 200, 30 results |
| 2 | `chrome` | `accept` + `referer` | 200, 30 results |
| 3 | `firefox` | `accept` + `referer` | 200, 30 results |
| 4 | `chrome` and `firefox` | no headers | 200, 30 results |
| 5 | `chrome` | detail page, direct | 403, Cloudflare challenge |
| 6 | `chrome` | detail page, Apify datacenter proxy | 403, Cloudflare challenge |
| 7 | `chrome` | detail page, Apify residential proxy (SE) | 200, `__NEXT_DATA__` |

`chrome` is the selected profile. No proxy is required for the listing API. Detail pages require Apify residential proxy with country `SE`.

## Failure log

| Date | Symptom | Cause | Fix |
|---|---|---|---|
| 2026-11-27 | Run saved 0 jobs after "Fetching API page 1" | Jobbland.se rebranded to JobbSafari; the old `/api/v2/jobentries` path 301s to the new site and returns Cloudflare 403 | Switched to `https://jobbsafari.se/api/next/job-entries` |
| 2026-11-27 | `includeDescriptions` could not fill description fields | Listing API has no description; detail pages are Cloudflare-challenged for direct and datacenter requests | Added detail-page enrichment through Apify residential proxy (SE) with bounded concurrency |
| 2026-11-27 | Run reported `Succeeded` with 0 items after an HTTP error | `finally { await Actor.exit() }` masked the thrown error | Errors are logged and the run exits with code 1 |
