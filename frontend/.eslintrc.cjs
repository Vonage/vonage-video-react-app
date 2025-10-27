module.exports = {
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off', // duplicate rule
    '@typescript-eslint/return-await': 'off', // this rule was breaking eslint
    'jsx-a11y/media-has-caption': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/require-default-props': 'off',
    
    'jsdoc/require-jsdoc': 'off', // to keep code base consistency since const functions are not required to have jsdoc,

    /*
    * Functions and classes are hoisted, so they can be used before their declaration.
    */
    '@typescript-eslint/no-use-before-define': ['error', { 
      functions: false,
      classes: false,
      variables: true,
    }],

    'no-redeclare': 'off', // duplicate rule, typescript already checks for this
    '@typescript-eslint/no-shadow': 'off', // duplicate rule, typescript already checks for this
    'consistent-return': 'off', // this rule goes against standard useEffect patterns,
    'tailwindcss/classnames-order': 'off', // this rule forces the changes to be more disruptive than beneficial and prevent grouping classes logically
  },
};
