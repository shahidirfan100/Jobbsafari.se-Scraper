import { log } from 'apify';

const MAX_ATTEMPTS = 3;
const MAX_DELAY_MS = 5000;

export class RetryableError extends Error {}

export async function fetchPage(client, requestUrl, referer, { maxAttempts = MAX_ATTEMPTS, baseDelayMs = 1000 } = {}) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            let response;
            try {
                response = await client.fetch(requestUrl, {
                    headers: { referer, accept: 'application/json' },
                });
            } catch (error) {
                throw new RetryableError(error.message);
            }

            if (response.status === 429 || response.status >= 500) {
                const retryAfter = Number(response.headers.get('retry-after'));
                const error = new RetryableError(`HTTP ${response.status}`);
                error.retryAfter = Number.isFinite(retryAfter) ? retryAfter : undefined;
                throw error;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('json')) {
                throw new Error(`Unexpected content type: ${contentType}`);
            }

            const data = await response.json();
            if (!Array.isArray(data?.results)) {
                throw new Error(`Unexpected response keys: ${Object.keys(data || {}).join(', ') || 'empty'}`);
            }

            return data;
        } catch (error) {
            if (!(error instanceof RetryableError) || attempt === maxAttempts) throw error;

            const delay = Math.min(error.retryAfter ? error.retryAfter * 1000 : attempt * baseDelayMs, MAX_DELAY_MS);
            log.warning(`Request attempt ${attempt} failed (${error.message}). Retrying in ${delay} ms.`);
            await new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        }
    }

    throw new Error('Request failed');
}
