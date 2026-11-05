import { themes } from '@quilt/ui/tokens';

function variables(colors: typeof themes.light) {
  return Object.entries(colors)
    .map(([name, value]) => `--quilt-${name}:${value};`)
    .join('');
}
/** One palette across the native app, web companion, and public site. */
export const brandThemeCSS = `:root{${variables(themes.light)}}.dark{${variables(themes.dark)}}`;
