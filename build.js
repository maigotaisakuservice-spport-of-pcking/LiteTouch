const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const entryPoints = {
  'all': path.join(__dirname, 'src/entries/all.js'),
  'guide': path.join(__dirname, 'src/entries/guide.js'),
  'efo': path.join(__dirname, 'src/entries/efo.js'),
  'menu': path.join(__dirname, 'src/entries/menu.js'),
  'autoflow': path.join(__dirname, 'src/entries/autoflow.js'),
};

async function build() {
  const docsV1Dir = path.join(__dirname, 'docs/v1');
  if (!fs.existsSync(docsV1Dir)) {
    fs.mkdirSync(docsV1Dir, { recursive: true });
  }

  for (const [name, entry] of Object.entries(entryPoints)) {
    if (fs.existsSync(entry)) {
      await esbuild.build({
        entryPoints: [entry],
        outfile: path.join(docsV1Dir, `${name}.js`),
        bundle: true,
        minify: false,
        format: 'iife',
        target: ['es2020'],
      });
      console.log(`Successfully built docs/v1/${name}.js`);
    } else {
      console.warn(`Skipping ${name}: entry file ${entry} does not exist.`);
    }
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
