const fs = require('fs');
const path = require('path');
const { readdir } = require('node:fs/promises');
// 03-files-in-folder
void (async function () {
  const curentDir = path.resolve(__dirname, 'secret-folder');
  console.log();
  console.log();

  console.log('files in secret-folder:');
  console.log('----------------------------------------');

  console.log('<file name>-<file extension>-<file size>');

  const files = await readdir(curentDir, { withFileTypes: true });

  const f = await Promise.all(
    files.map(async (elDirent) => {
      const elPath = path.resolve(curentDir, elDirent.name);
      const stats = await getStats(elPath);
      const extName = path.extname(elDirent.name);
      const baseName = path.basename(elPath, extName);
      if (stats.isFile()) {
        // console.log(elDirent, stats.size, elDirent.name);
        return `${baseName} - ${extName.slice(1)} - ${
          Math.round((stats.size / 1024) * 100) / 100
        }kB`;
      }
      return '';
      // });
    }),
  );

  f.filter((v) => v).map((v) => console.log(v));

  console.log('----------------------------------------');
})();

function getStats(path) {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        console.log('произошла ошибка. function stats.');
        return;
      }
      resolve(stats);
    });
  });
}
