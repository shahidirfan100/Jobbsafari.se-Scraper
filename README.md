# Jobbland.se Scraper

Extract job listings from Jobbland.se for Swedish hiring research, lead generation, job market tracking, and recruitment analysis. Collect structured job data including titles, companies, locations, categories, full descriptions, deadlines, salary estimates, company links, logo URLs, and listing URLs.

## Features

- **Job search collection** - Gather jobs from general searches, city pages, category pages, profession pages, and company pages.
- **Flexible filters** - Search by keyword, location, category, company, profession, workplace type, employment type, working hours, and salary.
- **Pagination support** - Automatically moves through result pages until your requested result count or page limit is reached.
- **Full descriptions** - Include job description HTML and a plain text version when available.
- **Clean dataset** - Empty and unavailable values are removed from each saved item.
- **Business-ready output** - Results are ready for spreadsheets, dashboards, databases, and monitoring workflows.

## Use Cases

### Recruitment Research
Track hiring activity by city, category, company, or profession. Recruiters can monitor demand for roles, compare employers, and build prospect lists from current Jobbland listings.

### Labor Market Analysis
Collect Swedish job market data for category trends, location demand, salary signals, and posting volume. Analysts can compare locations such as Stockholm, Goteborg, Malmo, and Uppsala.

### Competitive Monitoring
Follow selected companies and see what roles they are hiring for. This helps sales, staffing, and employer branding teams understand market movement.

### Job Alert Pipelines
Create automated workflows that collect new listings and send them to business systems, spreadsheets, or notification tools.

---

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | String | No | - | Jobbland search URL, city URL, category URL, profession URL, company URL, or paginated URL. |
| `keyword` | String | No | - | Search keyword used when no URL is provided. |
| `location` | String | No | - | City or area, for example `Stockholm`, `Goteborg`, or `Malmo`. |
| `category` | String | No | - | Category slug such as `data-och-it`. |
| `company` | String | No | - | Company slug such as `tullverket`. |
| `title` | String | No | - | Profession slug such as `software-engineer-sv`. |
| `jobLocationType` | String | No | - | Workplace type filter such as `remote` or `on-site`. |
| `employmentType` | String | No | - | Employment type filter supported by Jobbland. |
| `workingHour` | String | No | - | Working hours filter supported by Jobbland. |
| `salaryMin` | String | No | - | Minimum salary filter. |
| `results_wanted` | Integer | No | `20` | Maximum number of jobs to collect. |
| `max_pages` | Integer | No | `5` | Maximum result pages to process. |
| `includeDescriptions` | Boolean | No | `true` | Include full job descriptions in HTML and plain text. |
| `proxyConfiguration` | Object | No | Disabled | Optional proxy settings. |

---

## Output Data

Each item can include:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Jobbland job identifier. |
| `title` | String | Job title. |
| `company` | String | Hiring company name. |
| `company_url` | String | Company page URL. |
| `category` | String | Job category. |
| `location` | String | Primary job location. |
| `location_parent` | String | Parent region or county. |
| `job_location_type` | String | Workplace type. |
| `salary_estimate` | Object | Salary estimate values when available. |
| `posted_at` | String | Posting timestamp. |
| `ends_at` | String | Application deadline timestamp. |
| `description_html` | String | Full job description with formatting. |
| `description_text` | String | Full job description as plain text. |
| `logo_url` | String | Company logo URL. |
| `url` | String | Job listing URL. |

---

## Usage Examples

### Search by URL

```json
{
    "url": "https://jobbland.se/lediga-jobb/stockholm?search=software",
    "results_wanted": 50,
    "max_pages": 3
}
```

### Search by Keyword and Location

```json
{
    "keyword": "data analyst",
    "location": "Stockholm",
    "results_wanted": 40
}
```

### Category Monitoring

```json
{
    "url": "https://jobbland.se/lediga-jobb/kategori/data-och-it",
    "results_wanted": 100,
    "max_pages": 5
}
```

---

## Sample Output

```json
{
    "id": 20428226,
    "title": "Software Engineer",
    "company": "Forsvarets radioanstalt",
    "company_url": "https://jobbland.se/lediga-jobb/foretag/forsvarets-radioanstalt",
    "category": "Data och IT",
    "location": "Stockholm",
    "location_parent": "Stockholms lan",
    "job_location_type": "on-site",
    "salary_estimate": {
        "low": "45200.00",
        "high": "62000.00",
        "median": "52500.00",
        "period": "month",
        "year": 2024
    },
    "posted_at": "2026-07-12T22:00:01+00:00",
    "ends_at": "2026-08-09T21:59:59+00:00",
    "description_html": "<p>Vill du gora samhallsnytta och bidra till Sveriges oberoende...</p>",
    "description_text": "Vill du gora samhallsnytta och bidra till Sveriges oberoende...",
    "url": "https://jobbland.se/jobb/software-engineer-sfsor-20428226"
}
```

---

## Tips for Best Results

### Start With a Working URL
- Use URLs copied from Jobbland search pages.
- City, category, profession, company, and paginated URLs are supported.

### Keep Test Runs Small
- Start with `20` to verify output.
- Increase `results_wanted` and `max_pages` for production collection.

### Combine Filters Carefully
- Use a URL when you want the exact filters visible on Jobbland.
- Use keyword and location fields for simple searches.

---

## Integrations

Connect your data with:

- **Google Sheets** - Review jobs in a spreadsheet.
- **Airtable** - Build a searchable hiring database.
- **Slack** - Send job alerts to a team channel.
- **Webhooks** - Send listings to your own systems.
- **Make** - Build automated workflows.
- **Zapier** - Trigger downstream actions.

### Export Formats

- **JSON** - For applications and workflows.
- **CSV** - For spreadsheet analysis.
- **Excel** - For business reporting.
- **XML** - For system integrations.

---

## Frequently Asked Questions

### Can I scrape Jobbland city pages?
Yes. Use a URL such as `https://jobbland.se/lediga-jobb/stockholm` or enter the city in `location`.

### Can I scrape category and profession pages?
Yes. Category URLs, profession URLs, and matching input filters are supported.

### What happens when a field is missing?
Missing fields are left out of the saved item, so the dataset stays clean.

### How many jobs can I collect?
You can set `results_wanted` to the number you need. Use `max_pages` as a safety limit for larger runs.

### Can I use this with the Apify API?
Yes. Run the actor from the Apify Console, API, schedules, webhooks, or integrations.

---

## Support

For issues or feature requests, contact support through the Apify Console.

### Resources

- [Apify Documentation](https://docs.apify.com/)
- [API Reference](https://docs.apify.com/api/v2)
- [Scheduling Runs](https://docs.apify.com/schedules)

---

## Legal Notice

This actor is designed for legitimate data collection purposes. Users are responsible for ensuring compliance with website terms of service and applicable laws. Use data responsibly and respect rate limits.
