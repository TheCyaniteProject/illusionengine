import { context } from 'esbuild';
import fs from 'fs/promises';
import { existsSync } from 'fs';

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

/** @type import("esbuild").Plugin */
const WidgetPlugin = {
  name: "HTMLPlugin",
  setup(pluginBuild) {

    pluginBuild.onLoad({ filter: /widget.json/ }, async ({ path }) => {
      const { outdir, outbase } = pluginBuild.initialOptions;
      try {
        const { entrypoint } = JSON.parse(await fs.readFile(path, { encoding: 'utf8' }));
        const [, filepath] = path
          .replace(process.cwd(), '.') //make path relative
          .replaceAll(/\\+/g, '/') //convert windows path to unix
          .split(/(.*)\/(.*)/); //split into path and filename [<empty string>, path, filename]

        const script = entrypoint.replace(/\.html$/, '.js')

        const destinationPath = `${outdir}${filepath.replace(outbase, '')}`;
        await fs.mkdir(destinationPath, { recursive: true });
        await fs.copyFile(`${filepath}/${entrypoint}`, `${destinationPath}/${entrypoint}`);
        return { watchFiles: [`${filepath}/${entrypoint}`] };
      } catch (e) { console.log(e); };
    });

    pluginBuild.onEnd(async ({ path }) => { });
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
    "src/widgets/**/*.ts"
  ],
  plugins: [copyHtmlPlugin, WidgetPlugin],
  outbase: "./src/widgets",
  outdir: "./build",
  bundle: true,
  loader: {
    '.gif': 'file',
    '.json': 'file'
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

};
