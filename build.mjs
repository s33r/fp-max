import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev');

function copyHtml() {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  fs.copyFileSync('src/index.html', 'dist/index.html');
  console.log('Copied index.html to dist/');
}

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

copyHtml();

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');

  fs.watch('src/index.html', () => {
    copyHtml();
  });
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete!');
}
