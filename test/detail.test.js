import { describe, expect, it } from 'vitest';

import { extractNextData, htmlToText, mapJobDetail } from '../src/detail.js';

describe('extractNextData', () => {
    it('parses the Next.js data script', () => {
        const html =
            '<html><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"jobEntry":{"pk":1}}}}</script></html>';
        expect(extractNextData(html)).toEqual({ props: { pageProps: { jobEntry: { pk: 1 } } } });
    });

    it('returns null when the script is missing', () => {
        expect(extractNextData('<html></html>')).toBeNull();
    });
});

describe('mapJobDetail', () => {
    it('maps descriptions and rich fields', () => {
        const detail = mapJobDetail({
            description: '<p>Build <strong>things</strong>.</p>',
            description_summary: 'Build things.',
            category: { pk: 454, name: 'Data och IT', slug: 'data-och-it' },
            jobTitles: [{ name: 'Software Engineer' }, { name: '' }],
            salary: {
                low: '40000',
                high: '60000',
                median: '50000',
                average: '51000',
                period: 'month',
                year: 2025,
                currency: { code: 'SEK' },
                jobtitle: { name: 'Software Engineer' },
            },
            benefits: ['Remote work'],
            seniority: null,
            employmentType: { name: 'Full time' },
            workingHours: null,
            engagement_type: '',
            sourceName: 'JobbSafari',
            bannerImage: null,
        });

        expect(detail.description_text).toBe('Build things.');
        expect(detail.description_summary).toBe('Build things.');
        expect(detail.category).toBe('Data och IT');
        expect(detail.category_slug).toBe('data-och-it');
        expect(detail.job_titles).toEqual(['Software Engineer']);
        expect(detail.salary.median).toBe('50000');
        expect(detail.salary.currency).toBe('SEK');
        expect(detail.benefits).toEqual(['Remote work']);
        expect(detail.employment_type).toBe('Full time');
        expect(detail.source_name).toBe('JobbSafari');
    });

    it('returns an empty object without a job entry', () => {
        expect(mapJobDetail(null)).toEqual({});
    });
});

describe('htmlToText', () => {
    it('strips tags and decodes common entities', () => {
        expect(htmlToText('<p>A &amp; B<br>C</p>')).toBe('A & B\nC');
    });
});
