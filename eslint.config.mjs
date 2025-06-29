// ioBroker eslint template configuration file for js and ts files
// Please note that esm or react based modules need additional modules loaded.
import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        // specify files to exclude from linting here
        ignores: [
            '.dev-server/',
            '.vscode/',
            '*.test.js',
            'test/**/*.js',
            '*.config.mjs',
            'build',
            'dist',
            'admin/build',
            'admin/words.js',
            'admin/admin.d.ts',
            'admin/blockly.js',
            '**/adapter-config.d.ts',
            'node_modules',
            'typings',
            '.github',
            'test'
        ],
    },
    {
        // you may disable some 'jsdoc' warnings - but using jsdoc is highly recommended
        // as this improves maintainability. jsdoc warnings will not block buiuld process.
        rules: {
            'prettier/prettier': 'off',
            'no-else-return': 'off',
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-returns-description': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-param': 'off',
            'no-constant-binary-expression': 'off',
            'valid-typeof': 'off',

            //'jsdoc/require-jsdoc': 'off',
            //'no-async-promise-executor': 'off',
            //'prettier/prettier': 'off',
            //'@typescript-eslint/no-unused-vars': 'off',
            //'curly': 'off',
            //'jsdoc/require-returns-description': 'off',
            //'no-else-return': 'off',
            //'@typescript-eslint/ban-ts-comment': 'off',
            //'jsdoc/require-param-description': 'off',
            //'no-constant-binary-expression': 'off',
            //'valid-typeof': 'off',
            //'no-irregular-whitespace': 'off',


            // 'jsdoc/require-jsdoc': 'off',
            // 'jsdoc/require-param': 'off',
            // 'jsdoc/require-param-description': 'off',
            // 'jsdoc/require-returns-description': 'off',
            // 'jsdoc/require-returns-check': 'off',
        },
    },
];