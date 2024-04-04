import { context } from 'esbuild';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { createWidgetContexts } from './src/widgets/context.mjs';

const WATCH = process.argv.includes('--watch');

const createMainContext = () => context({
  entryPoints: [
    "src/main/main.ts",
    "src/main/preload.ts",
  ],
  outdir: "./build/",
  outbase: "./src/main",
  format: 'cjs',
  platform: "node",
  logLevel: 'info'
});

/** @type import("esbuild").Plugin */
const copyHtmlPlugin = {
  name: "HTMLPlugin",
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /.*\.[tj]sx?/ }, async ({ path }) => {
      const { outdir, outbase } = pluginBuild.initialOptions;
      try {
        const [, filepath, filename] = path
          .replace(process.cwd(), '.') //make path relative
          .replaceAll(/\\+/g, '/') //convert windows path to unix
          .split(/(.*)\/(.*)/); //split into path and filename [<empty string>, path, filename]

        const destinationPath = `${outdir}${filepath.replace(outbase, '')}`;
        const htmlFilename = `${filename.split(/(.*)\..*/)[1]}.html`;
        if (!existsSync(`${filepath}/${htmlFilename}`)) return;
        await fs.mkdir(destinationPath, { recursive: true });
        await fs.copyFile(`${filepath}/${htmlFilename}`, `${destinationPath}/${htmlFilename}`);
        return { watchFiles: [`${filepath}/${htmlFilename}`] };
      } catch (e) { console.log(e); };
    });
  }
};

const createRenderContext = () => context({
  entryPoints: [
    "src/render/**/*.ts"
  ],
  plugins: [copyHtmlPlugin],
  outbase: "./src/render",
  outdir: "./build",
  loader: {
    '.html': 'text',
    '.raw.css': 'text'
  },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  // minify: !WATCH,
  logLevel: 'info'
});

const contexts = await Promise.all([
  createMainContext(),
  createRenderContext(),
  ...createWidgetContexts('src/widgets')
]);

if (WATCH) {

  for (const ctx of contexts) await ctx.watch();

} else {

  for (const ctx of contexts) await ctx.rebuild();
  for (const ctx of contexts) ctx.dispose();

};
