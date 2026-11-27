import { describe, expect, it } from 'vitest';

import { buildApiUrl, normalizeSlug, parseSearchUrl } from '../src/params.js';

describe('parseSearchUrl', () => {
    it('maps Swedish query aliases', () => {
        expect(parseSearchUrl('https://jobbsafari.se/lediga-jobb?sok=software&ort=stockholm&page=2')).toEqual({
            search: 'software',
            area: 'stockholm',
            page: '2',
        });
    });

    it('reads area and category from the path', () => {
        expect(parseSearchUrl('https://jobbsafari.se/lediga-jobb/stockholm/kategori/data-och-it')).toEqual({
            area: 'stockholm',
            category: 'data-och-it',
        });
    });
});

describe('buildApiUrl', () => {
    it('keeps search text unmodified and slugifies the area', () => {
        const url = buildApiUrl({ page: 1, keyword: 'software engineer', location: 'Göteborg' });
        expect(url).toBe('https://jobbsafari.se/api/next/job-entries?page=1&search=software+engineer&area=goteborg');
    });

    it('prefers URL search and area over direct input', () => {
        const url = buildApiUrl({
            page: 2,
            searchUrl: 'https://jobbsafari.se/lediga-jobb?sok=utvecklare&ort=malmo',
            keyword: 'ignored',
            location: 'ignored',
        });
        expect(url).toBe('https://jobbsafari.se/api/next/job-entries?page=2&search=utvecklare&area=malmo');
    });
});

describe('normalizeSlug', () => {
    it('strips Swedish characters', () => {
        expect(normalizeSlug('Malmö')).toBe('malmo');
    });
});
