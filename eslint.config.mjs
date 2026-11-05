import { base } from '@quilt/eslint-config';

// ESLint 10 discovers each app/package's nearest config when linting the workspace.
export default base({
  projectDir: import.meta.dirname,
  typedFiles: [],
  extraIgnores: ['packages/db/drizzle/**'],
});
