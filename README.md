## What does Jobbland.se Scraper do?

Jobbland.se Scraper is a Jobbland.se scraper that collects structured Swedish job listings from public Jobbland search pages. Use a Jobbland URL, or enter a keyword and location, to extract job titles, companies, locations, categories, salary signals, posting dates, application deadlines, descriptions, company details, logos, and direct job URLs.

This Actor is useful for recruitment research, labor market analysis, job board monitoring, sales prospecting, HR analytics, and AI datasets built from Swedish job listing data. Results can be exported to JSON, CSV, Excel, XML, or sent to other tools through Apify integrations.

## Why use Jobbland.se Scraper?

- **Swedish jobs dataset creation** - Build structured datasets from Jobbland.se without manually copying listings.
- **Flexible search collection** - Collect jobs from general search pages, city pages, category pages, profession pages, company pages, and paginated result URLs.
- **Hiring intelligence** - Track what companies are hiring for, where roles are located, which categories are active, and how job demand changes over time.
- **Automation-ready output** - Use Apify schedules, webhooks, API access, and exports to feed spreadsheets, databases, or dashboards.
- **Description capture** - Include full job descriptions in HTML and plain text when available, which is useful for classification, search, and AI processing.

## What data can you extract from Jobbland.se?

| Field | Description |
|-------|-------------|
| `id` | Jobbland job identifier |
| `title` | Job listing title |
| `company` | Hiring company name |
| `company_url` | Company page URL when available |
| `category` | Job category, such as Data och IT |
| `location` | Primary job location |
| `location_parent` | Parent region or county |
| `additional_locations` | Extra locations connected to the job |
| `job_location_type` | Workplace type, for example remote or on-site |
| `salary` | Published salary text when available |
| `salary_estimate` | Estimated salary range and period when available |
| `posted_at` | Posting timestamp |
| `ends_at` | Application deadline timestamp |
| `description_html` | Full job description with formatting |
| `description_text` | Full job description as plain text |
| `excerpt` | Short listing summary |
| `logo_url` | Company logo URL |
| `url` | Direct Jobbland job listing URL |
| `source` | Source website, `jobbland.se` |

## How to scrape Jobbland.se data

1. Open the Actor on Apify.
2. Add a Jobbland search URL, or enter a keyword and location.
3. Set `results_wanted` to the number of job listings you want.
4. Set `max_pages` as a safety cap for result pages.
5. Choose whether to include full descriptions.
6. Run the Actor and download the dataset or connect it to your workflow.

For the most precise filtering, copy the URL directly from Jobbland.se after applying filters on the website.

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | String | No | - | Jobbland search URL, city URL, category URL, profession URL, company URL, or paginated URL. |
| `keyword` | String | No | - | Search keyword used when no URL is provided. |
| `location` | String | No | - | City or area, for example `Stockholm`, `Goteborg`, `Malmo`, or `Uppsala`. |
| `results_wanted` | Integer | No | `20` | Maximum number of jobs to collect. |
| `max_pages` | Integer | No | `5` | Maximum result pages to process. Jobbland returns up to 30 jobs per page. |
| `includeDescriptions` | Boolean | No | `true` | Include full job description HTML and plain text when available. |
| `proxyConfiguration` | Object | No | Disabled | Optional proxy settings. The Actor works without a proxy in normal conditions. |

## Output Data

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Jobbland job identifier. |
| `title` | String | Job title. |
| `company` | String | Hiring company name. |
| `company_slug` | String | Company slug. |
| `company_url` | String | Company page URL. |
| `category` | String | Job category name. |
| `category_slug` | String | Job category slug. |
| `location` | String | Primary job location. |
| `location_parent` | String | Parent location or county. |
| `additional_locations` | Array | Additional job locations. |
| `job_location_type` | String | Workplace type. |
| `apply_method` | String | Application method when published. |
| `salary` | String | Published salary text when available. |
| `salary_estimate` | Object | Salary estimate values, period, year, and job title when available. |
| `posted_at` | String | Posting timestamp. |
| `ends_at` | String | Application deadline timestamp. |
| `description_html` | String | Full job description with formatting. |
| `description_text` | String | Full job description as plain text. |
| `excerpt` | String | Short listing summary. |
| `logo_url` | String | Company logo URL. |
| `slug` | String | Job listing slug. |
| `url` | String | Direct job listing URL. |
| `source` | String | Source website. |
| `search_total_items` | Number | Total matching results reported by the search page. |
| `search_total_pages` | Number | Total matching result pages reported by the search page. |
| `search_page` | Number | Result page where the item was collected. |

## Usage Examples

### Basic Jobbland URL extraction

Collect jobs from a Jobbland search URL:

```json
{
  "url": "https://jobbland.se/lediga-jobb/stockholm?search=software",
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
  "url": "https://jobbland.se/lediga-jobb/kategori/data-och-it",
  "results_wanted": 100,
  "max_pages": 5,
  "includeDescriptions": false
}
```

## Sample Output

```json
{
  "id": 20428226,
  "title": "Software Engineer",
  "company": "Forsvarets radioanstalt",
  "company_slug": "forsvarets-radioanstalt",
  "company_url": "https://jobbland.se/lediga-jobb/foretag/forsvarets-radioanstalt",
  "category": "Data och IT",
  "category_slug": "data-och-it",
  "location": "Stockholm",
  "location_parent": "Stockholms lan",
  "job_location_type": "on-site",
  "salary_estimate": {
    "low": "45200.00",
    "high": "62000.00",
    "median": "52500.00",
    "period": "month",
    "year": 2024,
    "jobtitle": "Software Engineer"
  },
  "posted_at": "2026-07-12T22:00:01+00:00",
  "ends_at": "2026-08-09T21:59:59+00:00",
  "description_text": "Vill du gora samhallsnytta och bidra till Sveriges oberoende...",
  "excerpt": "Example job summary from the listing.",
  "logo_url": "https://jobbland.se/example-logo.png",
  "slug": "software-engineer-sfsor-20428226",
  "url": "https://jobbland.se/jobb/software-engineer-sfsor-20428226",
  "source": "jobbland.se",
  "search_total_items": 245,
  "search_total_pages": 9,
  "search_page": 1
}
```

## Tips for best results

- Use a complete Jobbland.se URL when you need the exact filters shown on the website.
- Start with `results_wanted` set to `20` for a test run, then increase it after checking the dataset.
- Increase `max_pages` when you need broader coverage.
- Turn off `includeDescriptions` when you only need listing-level data and want faster collection.
- Some fields may be missing because Jobbland does not publish them for every job. Missing values are removed from the saved item.
- Public websites can change. If output quality changes, report the issue from the Actor page.

## Integrations

- **Google Sheets** - Send Jobbland job listings to a spreadsheet for review or sharing.
- **Webhooks** - Trigger downstream workflows after each run.
- **Make or Zapier** - Send new job listings into no-code automations.
- **Apify API** - Pull datasets into your own application, database, or analytics workflow.
- **CSV, Excel, JSON, and XML** - Download results in common formats from Apify datasets.

## Frequently Asked Questions

### Can I export Jobbland.se data to CSV or Excel?

Yes. Apify datasets can be downloaded as CSV, Excel, JSON, XML, and other supported formats.

### Can I run this Jobbland.se scraper on a schedule?

Yes. Schedule the Actor in Apify Console to collect fresh Jobbland listings hourly, daily, weekly, or at another interval.

### Can I scrape Jobbland city pages?

Yes. Use a URL such as `https://jobbland.se/lediga-jobb/stockholm`, or enter `Stockholm` in the `location` input.

### Can I scrape category, profession, and company pages?

Yes. Copy the relevant public Jobbland.se URL into the `url` input.

### Why are some fields missing?

Some fields are missing when Jobbland.se does not publish that information for a specific listing. The Actor removes empty values so each dataset item stays clean.

### Is this Actor suitable for non-technical users?

Yes. You can run it from Apify Console with form-based inputs, then download the dataset without writing code.

### Is it legal to scrape Jobbland.se?

Scraping public web data can be legal, but you are responsible for complying with applicable laws, website terms, and privacy rules.

## Related Actors

- [LinkedIn Job Scraper](https://apify.com/shahidirfan/linkedin-job-scraper) - Collect job listings from LinkedIn for broader recruiting and market research.
- [USA Jobs Scraper](https://apify.com/shahidirfan/usa-jobs-scraper) - Extract public federal job listings from USAJobs.gov.
- [FinnNO Job Scraper](https://apify.com/shahidirfan/finnno-job-scraper) - Collect job listings from Finn.no for Norwegian labor market research.
- [APEC Jobs Scraper](https://apify.com/shahidirfan/apec-jobs-scraper) - Extract executive and professional job listings from APEC.fr.

## Support

For issues, feature requests, or custom Actor work, use the Issues tab on the Actor page or contact the developer through Apify.

## Legal Notice

This Actor is designed for legitimate collection of publicly available job listing data from Jobbland.se. Users are responsible for using the data responsibly and complying with applicable laws, website terms, and privacy rules.
