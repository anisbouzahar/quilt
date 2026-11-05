import path from 'node:path';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{ts,tsx}'];
const unusedVariableOptions = {
  argsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
};
const serverOnlyImports = {
  group: [
    '@quilt/db',
    '@quilt/db/*',
    '@nestjs/*',
    'pg',
    'drizzle-orm',
    'drizzle-orm/*',
    'node:*',
  ],
  message:
    'Keep server and database code out of client and framework-independent packages.',
};
const clientBoundaries = {
  'no-restricted-imports': ['error', { patterns: [serverOnlyImports] }],
};

/** Paths are relative to the consuming eslint.config.mjs, never this package. */
export function base({
  projectDir,
  typedFiles = ['src/**/*.{ts,tsx}'],
  extraIgnores = [],
}) {
  return defineConfig(
    globalIgnores([
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/.next/**',
      '**/.source/**',
      '**/out/**',
      '**/.pnpm-store/**',
      '**/.pnpm-cache/**',
      '**/next-env.d.ts',
      '**/expo-env.d.ts',
      ...extraIgnores,
    ]),
    js.configs.recommended,
    {
      files: sourceFiles,
      extends: [tseslint.configs.recommended],
      languageOptions: { parserOptions: { tsconfigRootDir: projectDir } },
    },
    ...(typedFiles.length
      ? [
          {
            files: typedFiles,
            extends: [tseslint.configs.recommendedTypeChecked],
            languageOptions: {
              parserOptions: {
                projectService: true,
                tsconfigRootDir: projectDir,
              },
            },
          },
        ]
      : []),
    {
      files: sourceFiles,
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', unusedVariableOptions],
      },
    },
    {
      files: ['**/*.{js,cjs,mjs}'],
      languageOptions: { globals: globals.node },
    },
  );
}

export function node(options) {
  return defineConfig(base(options), {
    files: sourceFiles,
    languageOptions: { globals: globals.node },
  });
}

export function domain(options) {
  return defineConfig(base(options), {
    files: sourceFiles,
    rules: clientBoundaries,
  });
}

export function reactNative(options) {
  return defineConfig(
    base(options),
    {
      files: sourceFiles,
      extends: [reactHooks.configs.flat.recommended],
      languageOptions: { globals: globals['react-native'] },
      rules: { ...clientBoundaries, 'react-hooks/exhaustive-deps': 'error' },
    },
    {
      files: ['**/*.web.{ts,tsx}'],
      languageOptions: { globals: globals.browser },
    },
  );
}

export function next(options) {
  return defineConfig(
    base({ ...options, typedFiles: options.typedFiles ?? sourceFiles }),
    {
      files: sourceFiles,
      extends: [reactHooks.configs.flat.recommended],
      languageOptions: { globals: { ...globals.node, ...globals.browser } },
      plugins: { '@next/next': nextPlugin },
      settings: { next: { rootDir: options.projectDir } },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        'react-hooks/exhaustive-deps': 'error',
        '@next/next/no-html-link-for-pages': [
          'error',
          path.join(options.projectDir, 'src/app'),
        ],
      },
    },
  );
}
