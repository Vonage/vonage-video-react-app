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
import customWordList from './customWordList.mjs';

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
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      '.nx',
      'tmp',
      // added to avoid typed rules breaking on config files
      '**/eslint.config.mjs',
      'customWordList.mjs',
    ],
  },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          // files that are *not* in any tsconfig but should still be linted
          allowDefaultProject: [
            'eslint.config.mjs',
            'frontend/vite.config.ts',
            // add more config files here if needed, e.g.
            // 'frontend/tailwind.config.*',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
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
      /**
       * Nx boundaries
       * @see https://nx.dev/docs/features/enforce-module-boundaries
       * */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            // example: apps can depend on ui + shared libs
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['scope:ui', 'scope:shared', 'type:lib'],
            },
            // // define to which libraries ui can depend on
            // { sourceTag: 'scope:ui', onlyDependOnLibsWithTags: ['scope:ui', 'scope:shared'] },
          ],
        },
      ],

      // General style
      'prettier/prettier': 'error',

      // TypeScript
      // Removed duplicates already enforced by TypeScript:
      'no-unused-vars': 'off',

      // ts checks these better than ESLint
      'no-redeclare': 'off',

      /**
       * This rule is redundant with `await` usage
       * async function foo() {
       *   return await bar(); // `return bar()` is sufficient
       * }
       *
       * Also is covered by @no-floating-promises
       */
      '@typescript-eslint/return-await': 'off',

      /**
       * This rule is too restrictive in practice
       * const isAllow = useSomeHook(({ isAllow }) => isAllow); // will error
       */
      '@typescript-eslint/no-shadow': 'off',

      // allow to type primitive types explicitly like `let x: number = 5;` ✅
      '@typescript-eslint/no-inferrable-types': 'off',

      /**
       * this rule is too restrictive in practice, e.g.,
       * expect(someAsyncFunction).toHaveBeenCalledWith(someArg); // will error because someAsyncFunction is async
       */
      '@typescript-eslint/no-misused-promises': 'off',

      // allow the exception pattern with leading for function with multiple args
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // functions an classes always are hoisted so this rule does not make sense for them
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: false, variables: true },
      ],

      // warn on develop so is not super annoying but will be rejected by husky pre-commit
      '@typescript-eslint/no-explicit-any': 'warn',

      // eslint cannot accurately check unbound methods so best to disable it
      '@typescript-eslint/unbound-method': 'off',

      /**
       * Empty functions are useful as placeholders or in tests
       */
      '@typescript-eslint/no-empty-function': 'off',

      // #region [TODO]: rules to review later
      /**
       * This rules are necessary in our code base but would require significant refactoring to enable them
       * By now we disable them since they were muted by configuration or explicit rules... but we want them enabled eventually
       */

      /**
       * Also necessary we should not render unknown values directly in templates
       */
      '@typescript-eslint/restrict-template-expressions': 'off',

      /**
       * Related with defensive programming
       * We need to remove this rule and assert the non-null values properly: TODO
       */
      '@typescript-eslint/no-non-null-assertion': 'off',

      /**
       * This one is also related with defensive programming
       * We need to assert every unknown value before using it: TODO
       */
      '@typescript-eslint/no-unsafe-call': 'off',

      /**
       * We need this rule to easier identify rejected promises origins
       * It will require refactoring to enable it though
       */
      '@typescript-eslint/prefer-promise-reject-errors': 'off',

      /**
       * Avoid unsafe assignments
       * We need to migrate to defensive programming and assert every unknown value before using it
       */
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      /**
       * Super important to avoid deadened async errors or forgotten promises,
       * We already catch error because that could have been prevented by proper this rule usage
       * It will require significant refactoring to enable it though
       */
      '@typescript-eslint/no-floating-promises': 'off',

      /**
       * Avoid creating class and interface with same name
       * We need this but it requires refactoring to enable it
       */
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'no-dupe-class-members': 'off',

      // #endregion

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
          cspell: { language: 'en-US', words: customWordList },
        },
      ],
    },
  },
];
