const fs = require('fs');
const path = require('path');
const { readdir } = require('node:fs/promises');
const { copyFile } = require('node:fs/promises');

/**
 * Копирование папки
 *
 * @param {string} pathToDir  - путь до папки
 */
async function copyDir(pathToDir) {
  console.log('start function copyDir()');

  // проверка - явл ли путь папкой
  if (!(await isDir(pathToDir))) {
    console.log(
      `\n\n[Ошибка][Путь ${pathToDir} не является папкой. Проверьте путь.]\n\n`,
    );
  }

  console.log(`Путь ${pathToDir} является папкой`);

  const srcDir = path.basename(pathToDir);
  const copyDir = `${srcDir}-copy`;

  // проверить есть уже папка для копирования если есть то удалить
  console.log('path.resolve(__dirname, copyDir)');
  console.log(path.resolve(__dirname, copyDir));

  // if (await isDir(path.resolve(__dirname, copyDir))) {
  const isCopyDirExist = await isPathExist(path.resolve(__dirname, copyDir));
  console.log('isCopyDirExist');
  console.log(isCopyDirExist);

  if (isCopyDirExist) {
    await removeDir(path.resolve(__dirname, copyDir));
    console.log(`Папка ${path.resolve(pathToDir, copyDir)} удалена`);
  }

  // создать папку для копирования с префиксом -copy
  // имя папки копирования

  const pathDirToCopy = await createDir(path.resolve(__dirname, copyDir));
  console.log('pathDirToCopy', pathDirToCopy);

  // определить файлы для копирования
  const files = await getFileListToCopy(pathToDir);
  console.log('files files');
  console.log(files);

  // скопировать файлы
  const copyF = await copyFiles(files, pathToDir, pathDirToCopy);
  console.log('// скопировать файлы const copyF = await  copyFiles');
  console.log(copyF);
}

copyDir(path.resolve(__dirname, 'files'));

/**
 * создать папку для копирования с префиксом -copy
 *
 * @param {string} pathToDir путь новой папки
 */
async function createDir(pathToDir) {
  return new Promise((resolve) => {
    fs.mkdir(pathToDir, { recursive: true }, (err) => {
      if (err) {
        console.log('Ошибка в функции createDir(pathToDir)');
        return;
      }
      console.log(`Папка ${pathToDir} создана`);
      resolve(pathToDir);
    });
  });
}

/**
 * является ли путь папкой
 *
 * @param {string} dir - путь к папке
 */
async function isDir(dir) {
  return new Promise((resolve) => {
    fs.stat(dir, (err, stats) => {
      if (err) {
        console.log('[isDir()]: пути не существует', err);
        return;
      }

      resolve(stats.isDirectory());
    });
  });
}

/**
 * получить файлы в папке
 *
 * @param {string} pathToDir - путь к папке
 */
async function getFileListToCopy(pathToDir) {
  const files = await readdir(pathToDir);
  // const files = await readdir(pathToDir, { withFileTypes: true });
  console.log(files);
  return files;
}

/**
 * Копирование списка файлов из {srcPathDir} папки в папку {copyPathDir}
 *
 * @param {Array} fileList - массив строк - имена файлов в папке для копирования
 * @param {*} srcPathDir
 * @param {*} copyPathDir
 * @returns
 */
async function copyFiles(fileList, srcPathDir, copyPathDir) {
  const f = await Promise.all(
    fileList.map((file) => {
      const src = path.resolve(srcPathDir, file);
      const target = path.resolve(copyPathDir, file);
      copyFile(src, target);
      return target;
    }),
  );

  console.log('function copyFiles: done');
  console.log(f);
  return f;
}

/**
 * Удаление папки
 * @param {string} pathRm путь к папке
 * @returns {Promise}
 */
async function removeDir(pathRm) {
  return new Promise((resolve) => {
    const pathToDir = path.join(pathRm, path.sep);

    console.log('[function removeDir: pathRm]', pathToDir);

    fs.rm(pathToDir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.log('[Ошибка. function removeDir]');
        console.log(err);
      }
      console.log('function removeDir: done', pathRm);
      resolve();
    });
  });
}

async function isPathExist(pathS) {
  return new Promise((resolve) => {
    fs.access(pathS, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(
            '[function isPathExist]: указанного каталога или файла нет',
          );
          resolve(false);
          return;
        }

        console.log('[Ошибка. function isPathExist]');
        console.log(err);
      }
      resolve(true);
    });
  });
}
