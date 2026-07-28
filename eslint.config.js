import prettier from 'eslint-config-prettier';

import apify from '@apify/eslint-config/js.js';

export default [
    { ignores: ['**/dist', 'storage/**'] },
    ...apify,
    {
        rules: {
            'import-x/no-default-export': 'off',
        },
    },
    prettier,
];
