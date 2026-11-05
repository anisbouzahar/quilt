import { node } from '@quilt/eslint-config';

export default node({
  projectDir: import.meta.dirname,
  extraIgnores: ['drizzle/**'],
});
