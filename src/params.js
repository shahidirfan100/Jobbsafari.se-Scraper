export const DOMAIN = 'https://jobbsafari.se';
export const API_URL = `${DOMAIN}/api/next/job-entries`;

const SEARCH_PARAM_ALIASES = {
    search: 'search',
    sok: 'search',
    q: 'search',
    keyword: 'search',
    area: 'area',
    ort: 'area',
    location: 'area',
    category: 'category',
    kategori: 'category',
    title: 'title',
    yrke: 'title',
    company: 'company',
    foretag: 'company',
    job_location_type: 'job_location_type',
    arbetsplats: 'job_location_type',
    employment_type: 'employment_type',
    omfattning: 'employment_type',
    competence: 'competence',
    kompetens: 'competence',
    page: 'page',
    sida: 'page',
};
const FILTER_PARAMS = ['category', 'title', 'company', 'job_location_type', 'employment_type', 'competence'];
const PATH_TARGETS = ['area', 'category', 'title'];

export function normalizeSlug(value) {
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

export function parseSearchUrl(inputUrl) {
    if (!inputUrl) return {};

    const parsed = new URL(inputUrl, DOMAIN);
    const params = {};

    for (const [key, value] of parsed.searchParams.entries()) {
        const name = SEARCH_PARAM_ALIASES[key];
        if (name && value) params[name] = value;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    const startIndex = parts.indexOf('lediga-jobb');
    const segments = startIndex >= 0 ? parts.slice(startIndex + 1) : [];
    let nextTarget = 0;

    for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];
        const next = segments[index + 1];

        if (segment === 'sida' && next) {
            params.page = next;
            index++;
        } else if (segment === 'distans') {
            params.job_location_type = 'remote';
        } else if (segment === 'kategori' && next) {
            params.category = next;
            index++;
        } else if (segment === 'yrke' && next) {
            params.title = next;
            index++;
        } else if (segment === 'foretag' && next) {
            params.company = next;
            index++;
        } else if (nextTarget < PATH_TARGETS.length) {
            params[PATH_TARGETS[nextTarget]] = segment;
            nextTarget++;
        }
    }

    return params;
}

export function buildApiUrl({ page, searchUrl, keyword, location }) {
    const fromUrl = parseSearchUrl(searchUrl);
    const params = new URLSearchParams({ page: String(page) });

    const search = fromUrl.search || keyword;
    if (search) params.set('search', String(search).trim());

    const area = fromUrl.area || location;
    if (area) params.set('area', normalizeSlug(area));

    for (const name of FILTER_PARAMS) {
        if (fromUrl[name]) params.set(name, normalizeSlug(fromUrl[name]));
    }

    return `${API_URL}?${params.toString()}`;
}
