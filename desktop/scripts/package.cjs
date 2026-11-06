const { packager } = require('@electron/packager');
packager({
  dir: process.cwd(),
  name: 'MediTrack',
  out: 'release',
  overwrite: true,
  asar: true,
  ignore: /^\/(src|test|scripts|evidence|reports|test-results|playwright-report|\.cache|\.maestro|release)(\/|$)/,
})
  .then((paths) => console.log(paths.join('\n')))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
