import { context } from 'esbuild';
import fs from 'fs/promises';

const WATCH = process.argv.includes('--watch');

const createMainContext = async () => await context({
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
    pluginBuild.onLoad({ filter: /index\.[tj]sx?/ }, async ({ path }) => {
      const { outdir, outbase } = pluginBuild.initialOptions;
      try {
        const [, filepath] = path
          .replace(process.cwd(), '.') //make path relative
          .replaceAll(/\\+/g, '/') //convert windows path to unix
          .split(/(.*)\/(.*)/); //split into path and filename [<empty string>, path, filename]

        const destinationPath = `${outdir}${filepath.replace(outbase, '')}`;
        await fs.mkdir(destinationPath, { recursive: true });
        await fs.copyFile(`${filepath}/index.html`, `${destinationPath}/index.html`);
        return { watchFiles: [`${filepath}/index.html`] };
      } catch (e) { console.log(e); };
    });
  }
};

const createRenderContext = async () => await context({
  entryPoints: [
    "src/render/**/*.ts"
  ],
  plugins: [copyHtmlPlugin],
  outbase: "./src/render",
  outdir: "./build",
  bundle: true,
  format: 'esm',
  platform: 'browser',
  // minify: !WATCH,
  logLevel: 'info'
});

const createWidgetContext = async () => await context({
  entryPoints: [
    "src/widgets/**/index.ts"
  ],
  plugins: [copyHtmlPlugin],
  outbase: "./src/widgets",
  outdir: "./build",
  bundle: true,
  loader: {
    '.html': 'file',
    '.gif': 'file'
  },
  format: 'esm',
  platform: 'browser',
  // minify: !WATCH,
  logLevel: 'info'
});


const contexts = await Promise.all([
  createMainContext(),
  createRenderContext(),
  createWidgetContext()
]);

if (WATCH) {

  for (const ctx of contexts) ctx.watch();

} else {

  await Promise.all(contexts.map(ctx => ctx.rebuild()));
  for (const ctx of contexts) ctx.dispose();

}
