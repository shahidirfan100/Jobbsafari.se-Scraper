import { describe, expect, it } from 'vitest';

import { fetchPage } from '../src/http.js';

function response({ status, contentType = 'application/json', body }) {
    return {
        status,
        ok: status >= 200 && status < 300,
        headers: { get: (name) => (name === 'content-type' ? contentType : null) },
        json: async () => body,
    };
}

describe('fetchPage', () => {
    it('retries a 503 and returns the next successful page', async () => {
        let calls = 0;
        const client = {
            fetch: async () => {
                calls++;
                return calls < 3
                    ? response({ status: 503 })
                    : response({ status: 200, body: { count: 1, results: [{ pk: 1 }] } });
            },
        };

        const data = await fetchPage(client, 'https://example.test/api', 'https://example.test/', { baseDelayMs: 0 });
        expect(calls).toBe(3);
        expect(data.results).toHaveLength(1);
    });

    it('does not retry a permanent 403', async () => {
        let calls = 0;
        const client = {
            fetch: async () => {
                calls++;
                return response({ status: 403 });
            },
        };

        await expect(fetchPage(client, 'https://example.test/api', 'https://example.test/')).rejects.toThrow(
            'HTTP 403',
        );
        expect(calls).toBe(1);
    });

    it('fails cleanly on a malformed payload', async () => {
        const client = {
            fetch: async () => response({ status: 200, body: { items: [] } }),
        };

        await expect(fetchPage(client, 'https://example.test/api', 'https://example.test/')).rejects.toThrow(
            'Unexpected response keys',
        );
    });
});
