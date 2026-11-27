## What does Jobbland.se Scraper do?

Jobbland.se Scraper collects structured Swedish job listings from JobbSafari, the job board that now serves the former Jobbland.se site. Use a JobbSafari search URL, or enter a keyword and location, to extract job titles, companies, locations, categories, salary estimates, benefits, full descriptions, posting dates, application links, and direct job URLs.

The Actor is useful for recruitment research, labor market analysis, job board monitoring, sales prospecting, HR analytics, and datasets built from Swedish job listing data. Results can be exported to JSON, CSV, Excel, XML, or sent to other tools through Apify integrations.

## Why use Jobbland.se Scraper?

- **Swedish jobs dataset creation** - Build structured datasets from JobbSafari without manually copying listings.
- **Flexible search collection** - Collect jobs from search pages, city pages, category pages, profession pages, company pages, and paginated result URLs.
- **Hiring intelligence** - Track what companies are hiring for, where roles are located, and how job demand changes over time.
- **Rich job details** - Capture full descriptions, categories, salary estimates, benefits, and related job titles for each listing.
- **Automation-ready output** - Use Apify schedules, webhooks, API access, and exports to feed spreadsheets, databases, or dashboards.

## What data can you extract from JobbSafari?

| Field | Description |
|-------|-------------|
| `id` | JobbSafari job identifier |
| `title` | Job listing title |
| `slug` | Job listing slug |
| `company` | Hiring company name |
| `company_id` | Company identifier |
| `company_slug` | Company slug |
| `category` | Job category name |
| `category_id` | Job category identifier |
| `category_slug` | Job category slug |
| `job_titles` | Related job titles |
| `salary` | Estimated salary range, median, average, period, year, and currency |
| `benefits` | Benefits listed in the ad |
| `location` | Primary job location |
| `municipality` | Municipality for the primary location |
| `location_slug` | Location slug |
| `additional_locations` | Extra locations connected to the job |
| `apply_method` | Application method, for example `url` or `email` |
| `apply_url` | Application URL when published |
| `posted_at` | Posting timestamp as published by JobbSafari |
| `ends_at` | Application deadline as published by JobbSafari |
| `date_updated` | Last update timestamp |
| `description_html` | Full job description with formatting |
| `description_text` | Full job description as plain text |
| `description_summary` | Short description summary |
| `seniority` | Seniority level when published |
| `employment_type` | Employment type when published |
| `working_hours` | Working hours when published |
| `engagement_type` | Engagement type when published |
| `source_name` | Source name reported by JobbSafari |
| `banner_image` | Banner image URL when published |
| `logo_url` | Company or listing logo URL |
| `product_name` | Listing product name |
| `product_type` | Listing product type |
| `recommended_in_search` | Whether the listing is recommended in search |
| `status` | Listing status code |
| `url` | Direct JobbSafari job listing URL |
| `source` | Source website, `jobbsafari.se` |
| `search_total_items` | Total matching results reported by the API |
| `search_total_pages` | Total matching result pages |
| `search_page` | Result page where the item was collected |

## How to scrape JobbSafari data

1. Open the Actor on Apify.
2. Add a JobbSafari search URL, or enter a keyword and location.
3. Set `results_wanted` to the number of job listings you want.
4. Set `max_pages` as a safety cap for result pages.
5. Choose whether to include full descriptions and rich details.
6. Run the Actor and download the dataset or connect it to your workflow.

For the most precise filtering, copy the URL directly from JobbSafari after applying filters on the website.

A supplied keyword or location selects direct search and the URL input is ignored. If both keyword and location are empty, the URL input is used, including its default value.

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | String | No | `https://jobbsafari.se/lediga-jobb?sok=software&ort=stockholm` | JobbSafari search URL, city URL, category URL, profession URL, company URL, or paginated URL. |
| `keyword` | String | No | - | Search keyword. Takes precedence over the URL input. |
| `location` | String | No | - | City or area, for example `Stockholm`, `Goteborg`, `Malmo`, or `Uppsala`. Takes precedence over the URL input. |
| `results_wanted` | Integer | No | `20` | Maximum number of jobs to collect. |
| `max_pages` | Integer | No | `5` | Maximum result pages to process. JobbSafari returns up to 30 jobs per page. |
| `includeDescriptions` | Boolean | No | `false` | Fetch full descriptions and rich details. When enabled, adds one detail request per job through Apify residential proxy (Sweden) and incurs proxy cost. |
| `proxyConfiguration` | Object | No | Disabled | Optional proxy settings for the listing API. Descriptions use Apify residential proxy (Sweden) automatically. |

## Output Data

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | JobbSafari job identifier. |
| `title` | String | Job title. |
| `slug` | String | Job listing slug. |
| `company` | String | Hiring company name. |
| `company_id` | Number | Company identifier. |
| `company_slug` | String | Company slug. |
| `category` | String | Job category name. |
| `category_id` | Number | Job category identifier. |
| `category_slug` | String | Job category slug. |
| `job_titles` | Array | Related job titles. |
| `salary` | Object | Estimated salary range, median, average, period, year, and currency. |
| `benefits` | Array | Benefits listed in the ad. |
| `location` | String | Primary job location. |
| `municipality` | String | Municipality for the primary location. |
| `location_slug` | String | Location slug. |
| `additional_locations` | Array | Additional job locations. |
| `apply_method` | String | Application method. |
| `apply_url` | String | Application URL. |
| `posted_at` | String | Posting timestamp as published. |
| `ends_at` | String | Application deadline as published. |
| `date_updated` | String | Last update timestamp. |
| `description_html` | String | Full job description with formatting. |
| `description_text` | String | Full job description as plain text. |
| `description_summary` | String | Short description summary. |
| `seniority` | String | Seniority level when published. |
| `employment_type` | String | Employment type when published. |
| `working_hours` | String | Working hours when published. |
| `engagement_type` | String | Engagement type when published. |
| `source_name` | String | Source name reported by JobbSafari. |
| `banner_image` | String | Banner image URL when published. |
| `logo_url` | String | Company or listing logo URL. |
| `product_name` | String | Listing product name. |
| `product_type` | String | Listing product type. |
| `recommended_in_search` | Boolean | Whether the listing is recommended in search. |
| `status` | Number | Listing status code. |
| `url` | String | Direct job listing URL. |
| `source` | String | Source website. |
| `search_total_items` | Number | Total matching results reported by the API. |
| `search_total_pages` | Number | Total matching result pages. |
| `search_page` | Number | Result page where the item was collected. |

Descriptions, salary estimates, category, and benefits are read from the public job detail page through Apify residential proxy (Sweden). Descriptions are off by default; set `includeDescriptions` to `true` to enable them.

## Usage Examples

### Basic JobbSafari URL extraction

Collect jobs from a JobbSafari search URL:

```json
{
  "url": "https://jobbsafari.se/lediga-jobb?sok=software&ort=stockholm",
  "results_wanted": 50,
  "max_pages": 3,
  "includeDescriptions": true
}
```

### Search by keyword and location

Use form fields instead of a copied URL:

```json
{
  "keyword": "data analyst",
  "location": "Stockholm",
  "results_wanted": 40,
  "max_pages": 4
}
```

### Monitor a category page

Collect jobs from a public category URL:

```json
{
  "url": "https://jobbsafari.se/lediga-jobb/kategori/data-och-it",
  "results_wanted": 100,
  "max_pages": 5
}
```

## Sample Output

```json
{
  "id": 20737775,
  "title": "Vi söker Platform Engineer inom Observability & Elastic",
  "slug": "sakerhetspolisen-vi-soker-platform-engineer-inom-observability-elastic-sdsuu-20737775",
  "company": "Säkerhetspolisen",
  "company_id": 540361,
  "company_slug": "sakerhetspolisen",
  "category": "Data och IT",
  "category_id": 454,
  "category_slug": "data-och-it",
  "job_titles": ["Mjukvaruingenjör", "Ingenjör", "IT Engineer", "Software Engineer", "Engineer"],
  "salary": {
    "low": "46200.00",
    "high": "62600.00",
    "median": "53500.00",
    "average": "55500.00",
    "period": "month",
    "year": 2025,
    "currency": "SEK",
    "jobtitle": "Mjukvaruingenjör"
  },
  "benefits": ["Möjlighet till friskvård på arbetstid och individuellt friskvårdsbidrag."],
  "location": "Stockholm",
  "municipality": "Stockholm",
  "location_slug": "stockholm",
  "apply_method": "url",
  "apply_url": "https://www.sakerhetspolisen.se/jobba-hos-oss/lediga-jobb/lediga-jobb/platform-engineer---observability--elastic.html",
  "posted_at": "11/18/2026, 12:21:53 PM",
  "ends_at": "12/11/2026, 9:59:00 PM",
  "date_updated": "2026-11-26T07:00:41.936305+02:00",
  "description_summary": "Säkerhetspolisen söker en Platform Engineer med fokus på observability för att utveckla och förvalta myndighetens observability-plattformar.",
  "description_text": "Säkerhetspolisen söker en Platform Engineer med fokus på observability...",
  "logo_url": "https://duunitori.imgix.net/media/next/17f2d8cb-ab9c-444a-aa71-03b0c3a8cf2b.jpg",
  "product_name": "Job Ad Campaign - Impact",
  "product_type": "campaign",
  "recommended_in_search": true,
  "status": 2,
  "url": "https://jobbsafari.se/jobb/sakerhetspolisen-vi-soker-platform-engineer-inom-observability-elastic-sdsuu-20737775",
  "source": "jobbsafari.se",
  "search_total_items": 271,
  "search_total_pages": 10,
  "search_page": 1
}
```

## Tips for best results

- Use a complete JobbSafari URL when you need the exact filters shown on the website.
- Start with `results_wanted` set to `20` for a test run, then increase it after checking the dataset.
- Increase `max_pages` when you need broader coverage.
- Descriptions are off by default. Set `includeDescriptions` to `true` to collect full descriptions and rich details; this uses residential proxy bandwidth.
- Some fields may be missing because JobbSafari does not publish them for every job. Missing values are removed from the saved item.
- Public websites can change. If output quality changes, report the issue from the Actor page.

## Integrations

- **Google Sheets** - Send JobbSafari job listings to a spreadsheet for review or sharing.
- **Webhooks** - Trigger downstream workflows after each run.
- **Make or Zapier** - Send new job listings into no-code automations.
- **Apify API** - Pull datasets into your own application, database, or analytics workflow.
- **CSV, Excel, JSON, and XML** - Download results in common formats from Apify datasets.

## Frequently Asked Questions

### Can I export JobbSafari data to CSV or Excel?

Yes. Apify datasets can be downloaded as CSV, Excel, JSON, XML, and other supported formats.

### Can I run this JobbSafari scraper on a schedule?

Yes. Schedule the Actor in Apify Console to collect fresh JobbSafari listings hourly, daily, weekly, or at another interval.

### Can I scrape JobbSafari city pages?

Yes. Use a URL such as `https://jobbsafari.se/lediga-jobb/stockholm`, or enter `Stockholm` in the `location` input.

### Can I scrape category, profession, and company pages?

Yes. Copy the relevant public JobbSafari URL into the `url` input.

### Why are some fields missing?

Some fields are missing when JobbSafari does not publish that information for a specific listing. The Actor removes empty values so each dataset item stays clean.

### Do descriptions require a proxy?

Yes. The listing API is public, but job detail pages use a browser check. The Actor reads descriptions through Apify residential proxy (Sweden). Descriptions are off by default; set `includeDescriptions` to `true` to enable them.

### Is this Actor suitable for non-technical users?

Yes. You can run it from Apify Console with form-based inputs, then download the dataset without writing code.

### Is it legal to scrape JobbSafari?

Scraping public web data can be legal, but you are responsible for complying with applicable laws, website terms, and privacy rules.

## Related Actors

- [LinkedIn Job Scraper](https://apify.com/shahidirfan/linkedin-job-scraper) - Collect job listings from LinkedIn for broader recruiting and market research.
- [USA Jobs Scraper](https://apify.com/shahidirfan/usa-jobs-scraper) - Extract public federal job listings from USAJobs.gov.
- [FinnNO Job Scraper](https://apify.com/shahidirfan/finnno-job-scraper) - Collect job listings from Finn.no for Norwegian labor market research.
- [APEC Jobs Scraper](https://apify.com/shahidirfan/apec-jobs-scraper) - Extract executive and professional job listings from APEC.fr.

## Support

For issues, feature requests, or custom Actor work, use the Issues tab on the Actor page or contact the developer through Apify.

## Legal Notice

This Actor is designed for legitimate collection of publicly available job listing data from JobbSafari. Users are responsible for using the data responsibly and complying with applicable laws, website terms, and privacy rules.
