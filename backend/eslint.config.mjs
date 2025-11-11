import js from '@eslint/js';

export default [
  { files: ['**/*.{ts,tsx,js,jsx}'], languageOptions: { globals: js.environments.node.globals } },
];
