module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'prettier',
    ],
    env: {
        node: true,
        es6: true,
    },
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': 'off',
        'no-unused-vars': 'off', // Usar la regla de TypeScript
    },
    ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};