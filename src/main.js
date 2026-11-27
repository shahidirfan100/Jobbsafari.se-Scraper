import { Actor, log } from 'apify';
import { Impit } from 'impit';

import { extractNextData, mapJobDetail } from './detail.js';
import { fetchPage } from './http.js';
import { buildApiUrl, DOMAIN, parseSearchUrl } from './params.js';

const PAGE_SIZE = 30;
const DEFAULT_RESULTS_WANTED = 20;
const DEFAULT_MAX_PAGES = 5;
const DESCRIPTION_CONCURRENCY = 8;

await Actor.init();

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
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

function mapJob(entry, context) {
    const locations = Array.isArray(entry.locations) ? entry.locations : [];
    const primaryLocation = locations[0];

    return cleanObject({
        id: entry.pk,
        title: entry.title,
        slug: entry.slug,
        company: entry.company?.name,
        company_id: entry.company?.pk,
        company_slug: entry.company?.slug,
        location: primaryLocation?.name || primaryLocation?.area?.name,
        municipality: primaryLocation?.area?.name,
        location_slug: primaryLocation?.area?.slug,
        additional_locations: locations.slice(1).map((item) => item.name || item.area?.name),
        apply_method: entry.apply?.method,
        apply_url: entry.apply?.href,
        posted_at: entry.startDate,
        ends_at: entry.endDate,
        date_updated: entry.dateUpdated,
        logo_url: entry.logoUrl || entry.company?.logoUrl,
        product_name: entry.publishLevel?.name,
        product_type: entry.publishLevel?.type,
        recommended_in_search: entry.publishLevel?.recommendInSearch,
        status: entry.status,
        url: entry.slug ? `${DOMAIN}/jobb/${entry.slug}` : undefined,
        source: 'jobbsafari.se',
        search_total_items: context.count,
        search_total_pages: Math.ceil(context.count / PAGE_SIZE),
        search_page: context.page,
    });
}

async function getDescriptionProxyUrl(proxyConfiguration) {
    if (proxyConfiguration?.proxyUrls?.length) return proxyConfiguration.proxyUrls[0];
    if (!Actor.isAtHome() && !process.env.APIFY_TOKEN) return undefined;

    try {
        const proxyConfig = await Actor.createProxyConfiguration({
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
            apifyProxyCountry: 'SE',
        });
        return await proxyConfig.newUrl();
    } catch (error) {
        log.warning(`Residential proxy unavailable: ${error.message}`);
        return undefined;
    }
}

async function fetchJobDetail(client, jobUrl) {
    if (!client || !jobUrl) return {};

    try {
        const response = await client.fetch(jobUrl, {
            headers: { accept: 'text/html', referer: `${DOMAIN}/lediga-jobb` },
        });

        if (!response.ok) {
            log.warning(`Description fetch failed | status=${response.status} | url=${jobUrl}`);
            return {};
        }

        const data = extractNextData(await response.text());
        return mapJobDetail(data?.props?.pageProps?.jobEntry);
    } catch (error) {
        log.warning(`Description fetch failed | ${error.message} | url=${jobUrl}`);
        return {};
    }
}

async function enrichJobs(jobs, context) {
    if (!context.descriptionClient) return jobs;

    const enriched = [];
    for (let index = 0; index < jobs.length; index += context.concurrency) {
        const chunk = jobs.slice(index, index + context.concurrency);
        const results = await Promise.all(
            chunk.map(async (job) => {
                const detail = await fetchJobDetail(context.descriptionClient, job.url);
                return cleanObject({ ...job, ...detail });
            }),
        );
        enriched.push(...results);
    }

    return enriched;
}

async function main() {
    const input = (await Actor.getInput()) || {};
    const { url, keyword, location, proxyConfiguration } = input;
    const includeDescriptions = input.includeDescriptions === true;

    const resultsWanted = positiveInteger(input.results_wanted, DEFAULT_RESULTS_WANTED);
    const maxPages = positiveInteger(input.max_pages, DEFAULT_MAX_PAGES);
    const keywordValue = String(keyword || '').trim();
    const locationValue = String(location || '').trim();
    const hasDirectSearch = Boolean(keywordValue || locationValue);
    // A supplied keyword or location selects direct search; the URL (including its schema default) is ignored.
    const inputUrl = hasDirectSearch ? undefined : url;

    if (!inputUrl && !hasDirectSearch) {
        throw new Error('No search input. Provide a JobbSafari URL, a keyword, or a location.');
    }

    const urlPage = positiveInteger(parseSearchUrl(inputUrl).page, 1);
    const shouldUseProxy = Boolean(proxyConfiguration?.useApifyProxy || proxyConfiguration?.proxyUrls?.length);
    const proxyConfig =
        shouldUseProxy && Actor.isAtHome()
            ? await Actor.createProxyConfiguration({ ...proxyConfiguration })
            : undefined;
    const proxyUrl = proxyConfig ? await proxyConfig.newUrl() : undefined;
    const client = new Impit({ browser: 'chrome', ...(proxyUrl && { proxyUrl }) });

    let descriptionClient;
    if (includeDescriptions) {
        const descriptionProxyUrl = await getDescriptionProxyUrl(proxyConfiguration);
        if (descriptionProxyUrl) {
            descriptionClient = new Impit({ browser: 'chrome', proxyUrl: descriptionProxyUrl });
        } else {
            log.warning('Descriptions requested but no Swedish residential proxy is available. Skipping descriptions.');
        }
    }

    const referer = inputUrl || `${DOMAIN}/lediga-jobb`;
    const seen = new Set();
    let saved = 0;
    let page = urlPage;
    let pagesProcessed = 0;
    let stopReason = 'max_pages';

    const source = inputUrl || `keyword=${keywordValue || '-'} location=${locationValue || '-'}`;
    log.info(
        `Start run | target=${resultsWanted} | max_pages=${maxPages} | descriptions=${includeDescriptions} | source=${source}`,
    );

    while (saved < resultsWanted && pagesProcessed < maxPages) {
        const requestUrl = buildApiUrl({ page, searchUrl: inputUrl, keyword: keywordValue, location: locationValue });
        const data = await fetchPage(client, requestUrl, referer);
        pagesProcessed++;

        if (!data.results.length) {
            stopReason = 'no_results';
            break;
        }

        const batch = [];
        for (const entry of data.results) {
            if (saved + batch.length >= resultsWanted) break;
            const key = entry.pk || entry.slug;
            if (key && seen.has(key)) continue;
            if (key) seen.add(key);
            batch.push(mapJob(entry, { count: data.count, page }));
        }

        if (batch.length) {
            const enriched = await enrichJobs(batch, {
                descriptionClient,
                concurrency: DESCRIPTION_CONCURRENCY,
            });
            await Actor.pushData(enriched);
            saved += enriched.length;
            log.info(`Saved ${enriched.length} jobs. Total: ${saved}/${resultsWanted}`);
        }

        const totalPages = Math.ceil((data.count || 0) / PAGE_SIZE);
        if (saved >= resultsWanted) {
            stopReason = 'target_reached';
            break;
        }
        if (!totalPages || page >= totalPages) {
            stopReason = 'last_page';
            break;
        }
        page++;
    }

    log.info(`Done | saved=${saved} | pages=${pagesProcessed} | stop_reason=${stopReason}`);
}

try {
    await main();
    await Actor.exit();
} catch (error) {
    log.error(`Run failed: ${error.message}`);
    await Actor.exit({ exitCode: 1 });
}
