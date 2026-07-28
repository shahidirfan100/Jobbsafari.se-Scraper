import { readFile } from 'node:fs/promises';

import { Actor, log } from 'apify';
import { Impit } from 'impit';

const DOMAIN = 'https://jobbland.se';
const API_URL = `${DOMAIN}/api/v2/jobentries`;
const DEFAULT_RESULTS_WANTED = 20;
const DEFAULT_MAX_PAGES = 5;
const DESCRIPTION_CONCURRENCY = 5;

await Actor.init();

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeSlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function addDelimitedParam(params, key, value) {
    if (!value) return;
    const values = Array.isArray(value) ? value : String(value).split(/[;,]/);
    const cleaned = values.map((item) => normalizeSlug(item)).filter(Boolean);
    if (cleaned.length) params.set(key, cleaned.join(';'));
}

function parseJobblandUrl(inputUrl) {
    if (!inputUrl) return {};

    const parsed = new URL(inputUrl, DOMAIN);
    const params = {};

    for (const [key, value] of parsed.searchParams.entries()) {
        if (!value) continue;
        if (key === 'search' || key === 'q' || key === 'keyword') params.search = value;
        else if (key === 'area' || key === 'location') params.area = value;
        else if (key === 'category') params.category = value;
        else if (key === 'title' || key === 'yrke') params.title = value;
        else if (key === 'company' || key === 'foretag') params.company = value;
        else if (key === 'job_location_type') params.job_location_type = value;
        else if (key === 'employment_type') params.employment_type = value;
        else if (key === 'working_hour') params.working_hour = value;
        else if (key === 'salary_min') params.salary_min = value;
        else if (key === 'order_by') params.order_by = value;
        else if (key === 'page') params.page = value;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    const startIndex = parts.indexOf('lediga-jobb');
    const segments = startIndex >= 0 ? parts.slice(startIndex + 1) : [];

    for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];
        const next = segments[index + 1];

        if (segment === 'kategori' && next) {
            params.category = next;
            index++;
        } else if (segment === 'yrke' && next) {
            params.title = next;
            index++;
        } else if (segment === 'foretag' && next) {
            params.company = next;
            index++;
        } else if (segment === 'distans') {
            params.job_location_type = 'remote';
        } else if (segment !== 'sida') {
            params.area = segment;
        }
    }

    return params;
}

function buildApiUrl({ page, url, keyword, location, category, title, company, jobLocationType, employmentType, workingHour, salaryMin, orderBy }) {
    const urlParams = parseJobblandUrl(url);
    const params = new URLSearchParams({
        format: 'json',
        site: 'jobbland.se',
        page: String(page),
        order_by: urlParams.order_by || orderBy || 'search_rank',
    });

    addDelimitedParam(params, 'search', urlParams.search || keyword);
    addDelimitedParam(params, 'area', urlParams.area || location);
    addDelimitedParam(params, 'category', urlParams.category || category);
    addDelimitedParam(params, 'title', urlParams.title || title);
    addDelimitedParam(params, 'company', urlParams.company || company);
    addDelimitedParam(params, 'job_location_type', urlParams.job_location_type || jobLocationType);
    addDelimitedParam(params, 'employment_type', urlParams.employment_type || employmentType);
    addDelimitedParam(params, 'working_hour', urlParams.working_hour || workingHour);
    addDelimitedParam(params, 'salary_min', urlParams.salary_min || salaryMin);

    return `${API_URL}?${params.toString()}`;
}

function cleanObject(value) {
    if (value === null || value === undefined || value === '') return undefined;

    if (Array.isArray(value)) {
        const cleanedArray = value.map((item) => cleanObject(item)).filter((item) => item !== undefined);
        return cleanedArray.length ? cleanedArray : undefined;
    }

    if (typeof value === 'object') {
        const cleanedObject = {};
        for (const [key, nestedValue] of Object.entries(value)) {
            const cleanedValue = cleanObject(nestedValue);
            if (cleanedValue !== undefined) cleanedObject[key] = cleanedValue;
        }
        return Object.keys(cleanedObject).length ? cleanedObject : undefined;
    }

    return value;
}

function htmlToText(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s+/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function extractInitialState(html) {
    const marker = 'window.__INITIAL_STATE__=';
    const start = html.indexOf(marker);
    if (start === -1) return null;

    const stateStart = start + marker.length;
    const end = html.indexOf(';(function()', stateStart);
    const scriptEnd = html.indexOf('</script>', stateStart);
    const stateEnd = end !== -1 ? end : scriptEnd;
    if (stateEnd === -1) return null;

    try {
        return JSON.parse(html.slice(stateStart, stateEnd).trim().replace(/;$/, ''));
    } catch {
        return null;
    }
}

async function fetchDescription(client, jobUrl) {
    if (!jobUrl) return {};

    const response = await client.fetch(jobUrl, {
        headers: {
            referer: `${DOMAIN}/lediga-jobb`,
        },
    });

    if (!response.ok) {
        log.warning(`Description fetch failed | status=${response.status} | url=${jobUrl}`);
        return {};
    }

    const state = extractInitialState(await response.text());
    const descriptionHtml = state?.pageData?.jobentry?.description_html;
    if (!descriptionHtml) return {};

    return {
        description_html: descriptionHtml,
        description_text: htmlToText(descriptionHtml),
    };
}

async function mapJobEntry(job, context) {
    const salaryEstimate = job.salary_estimate
        ? {
            low: job.salary_estimate.low,
            high: job.salary_estimate.high,
            median: job.salary_estimate.median,
            average: job.salary_estimate.average,
            period: job.salary_estimate.period,
            year: job.salary_estimate.year,
            jobtitle: job.salary_estimate.jobtitle?.name,
        }
        : undefined;
    const url = job.link ? new URL(job.link, DOMAIN).href : undefined;
    const description = context.includeDescriptions ? await fetchDescription(context.client, url) : {};

    return cleanObject({
        id: job.id,
        title: job.heading,
        company: job.company_name || job.company?.name,
        company_id: job.company?.id,
        company_slug: job.company?.slug,
        company_url: job.company?.search_url || job.company?.link,
        company_vat_id: job.company?.vat_id,
        category: job.category?.name,
        category_slug: job.category?.slug,
        category_url: job.category?.link ? new URL(job.category.link, DOMAIN).href : undefined,
        location: job.location?.name || job.address || job.municipality_name,
        municipality: job.municipality_name,
        location_slug: job.location?.slug,
        location_parent: job.location?.parent_name,
        location_url: job.location?.search_url,
        additional_locations: job.additional_locations?.map((location) => location.name || location.slug || location),
        job_location_type: job.job_location_type,
        apply_method: job.apply_method,
        salary: job.salary,
        salary_estimate: salaryEstimate,
        posted_at: job.posted_at,
        ends_at: job.ends_at,
        description_html: description.description_html,
        description_text: description.description_text,
        seniority: job.seniority,
        required_spoken_languages: job.required_spoken_languages,
        excerpt: job.lede,
        logo_url: job.logo_url || job.company?.logo_url,
        product_name: job.product?.name || job.publish_level?.name,
        product_type: job.product?.type || job.publish_level?.type,
        recommended_in_search: job.product?.recommend_in_search ?? job.publish_level?.recommend_in_search,
        slug: job.slug,
        url,
        source: 'jobbland.se',
        search_total_items: context.pagination?.total_items,
        search_total_pages: context.pagination?.total_pages,
        search_page: context.pagination?.current_page,
    });
}

async function mapJobEntries(entries, context) {
    const mapped = [];
    for (let index = 0; index < entries.length; index += DESCRIPTION_CONCURRENCY) {
        const chunk = entries.slice(index, index + DESCRIPTION_CONCURRENCY);
        mapped.push(...await Promise.all(chunk.map((entry) => mapJobEntry(entry, context))));
    }
    return mapped;
}

async function fetchJson(client, requestUrl, referer) {
    const response = await client.fetch(requestUrl, {
        headers: {
            referer,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

async function main() {
    let input = (await Actor.getInput()) || {};
    if (!Actor.isAtHome() && Object.keys(input).length === 0) {
        try {
            input = JSON.parse(await readFile('INPUT.json', 'utf8'));
            log.info('Using local INPUT.json because no runtime input was provided');
        } catch {
            input = {};
        }
    }
    const {
        url,
        startUrl,
        startUrls,
        keyword,
        location,
        category,
        title,
        company,
        jobLocationType,
        employmentType,
        workingHour,
        salaryMin,
        orderBy,
        includeDescriptions = true,
        proxyConfiguration,
    } = input;

    const resultsWanted = positiveInteger(input.results_wanted, DEFAULT_RESULTS_WANTED);
    const maxPages = positiveInteger(input.max_pages, DEFAULT_MAX_PAGES);
    const inputUrl = url || startUrl || (Array.isArray(startUrls) ? startUrls[0]?.url || startUrls[0] : undefined);
    const urlPage = positiveInteger(parseJobblandUrl(inputUrl).page, 1);
    const isApifyCloud = Actor.isAtHome();
    const shouldUseProxy = Boolean(proxyConfiguration?.useApifyProxy || proxyConfiguration?.proxyUrls?.length);
    const proxyConfig = shouldUseProxy && isApifyCloud
        ? await Actor.createProxyConfiguration({ ...proxyConfiguration })
        : undefined;
    const proxyUrl = proxyConfig ? await proxyConfig.newUrl() : undefined;
    const client = new Impit({
        browser: 'chrome',
        ignoreTlsErrors: true,
        ...(proxyUrl && { proxyUrl }),
    });

    let saved = 0;
    let page = urlPage;
    const seen = new Set();
    const referer = inputUrl || `${DOMAIN}/lediga-jobb`;

    log.info(`Start run | target=${resultsWanted} | max_pages=${maxPages} | source=${inputUrl || 'search parameters'}`);

    for (let pagesProcessed = 0; saved < resultsWanted && pagesProcessed < maxPages; pagesProcessed++) {
        const requestUrl = buildApiUrl({
            page,
            url: inputUrl,
            keyword,
            location,
            category,
            title,
            company,
            jobLocationType,
            employmentType,
            workingHour,
            salaryMin,
            orderBy,
        });

        log.info(`Fetching API page ${page}`);
        const data = await fetchJson(client, requestUrl, referer);
        const entries = Array.isArray(data?.jobentries) ? data.jobentries : [];

        if (!entries.length) {
            log.info(`No jobs returned on page ${page}. Stopping.`);
            break;
        }

        const pendingEntries = [];
        for (const entry of entries) {
            if (saved + pendingEntries.length >= resultsWanted) break;
            const key = entry.id || entry.slug || entry.link;
            if (key && seen.has(key)) continue;
            if (key) seen.add(key);
            pendingEntries.push(entry);
        }
        const batch = await mapJobEntries(pendingEntries, {
            pagination: data.pagination,
            includeDescriptions,
            client,
        });

        if (batch.length) {
            await Actor.pushData(batch);
            saved += batch.length;
            log.info(`Saved ${batch.length} jobs. Total: ${saved}/${resultsWanted}`);
        }

        if (!data.pagination?.next_page || page >= data.pagination.total_pages) break;
        page++;
    }

    log.info(`Done | saved=${saved}`);
}

try {
    await main();
} finally {
    await Actor.exit();
}
