import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

const isWatch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev');

const buildOptions = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  sourcemap: isDev,
  minify: !isDev,
  target: ['es2020'],
  loader: {
    '.ts': 'tsx',
    '.tsx': 'tsx',
  },
  plugins: [sassPlugin()],
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete!');
}
