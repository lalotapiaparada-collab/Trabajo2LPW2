import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  jsxA11yPlugin.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Regla de seguridad contra ataques de Cross-Site Scripting (XSS):
      'react/no-danger': 'error',
      // Reglas WCAG 2.2 AA accesibilidad
      'jsx-a11y/no-autofocus': 'warn',
    },
  }
);
