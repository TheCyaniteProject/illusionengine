import { context } from 'esbuild';
import { copyFile } from 'fs/promises';

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
    pluginBuild.onEnd(async () => {
      try {
        copyFile('src/render/index.html', `${pluginBuild.initialOptions.outdir}/index.html`);
      } catch (e) { console.log(e); };
    });
  }
};

const createRenderContext = async () => await context({
  entryPoints: [
    "src/render/**/*.ts"
  ],
  plugins: [copyHtmlPlugin],
  outbase: "./src",
  outdir: "./build",
  bundle: true,
  format: 'esm',
  platform: 'browser',
  // minify: !WATCH,
  logLevel: 'info'
});

const createWidgetContext = async () => await context({
  entryPoints: [
    "src/widgets/**/*.ts"
  ],
  plugins: [copyHtmlPlugin],
  outbase: "./src/widgets",
  outdir: "./build",
  bundle: true,
  loader: {
    '.gif': "dataurl",
    '.css': "dataurl"
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
