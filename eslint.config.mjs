import nx from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import tailwind from 'eslint-plugin-tailwindcss';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import cspell from '@cspell/eslint-plugin';

const tsProjects = [
  './backend/tsconfig.json',
  './frontend/tsconfig.json',
  './ui/tsconfig.json',
  // './integration-tests/tsconfig.json', // [TODO]: not TS yet
];

export default [
  // Nx base and TypeScript presets
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,

  // Ignored paths
  { ignores: ['node_modules', 'dist', 'coverage', '.nx', 'tmp'] },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': a11y,
      tailwindcss: tailwind,
      '@nx': nx,
      '@cspell': cspell,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: { config: './frontend/tailwind.config.js' },
      'import/resolver': {
        typescript: { project: tsProjects },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'] },
      },
    },
    rules: {
      // Nx boundaries
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
        },
      ],

      // General style
      'prettier/prettier': 'error',
      curly: ['error', 'all'],

      // TypeScript
      // Removed duplicates already enforced by TypeScript:
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/return-await': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: false, variables: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility [todo]: review if we can enable them, otherwise why using jsx-a11y?
      'jsx-a11y/media-has-caption': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',

      // Tailwind
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/no-custom-classname': [
        'error',
        {
          whitelist: [
            'bg-primary-dark',
            'text-darkGray',
            'publisher',
            'subscriber',
            'screen-subscriber',
          ],
        },
      ],

      // Spellcheck (CSpell)
      '@cspell/spellchecker': [
        'error',
        {
          checkStrings: false,
          checkComments: true,
          cspell: { language: 'en-US' },
          customWordListFile: './customWordList.txt',
        },
      ],
    },
  },
];
