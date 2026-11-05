import { reactNative } from '@quilt/eslint-config';

export default reactNative({
  projectDir: import.meta.dirname,
  typedFiles: ['**/*.{ts,tsx}'],
});
