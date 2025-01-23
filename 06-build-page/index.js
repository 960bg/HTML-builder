const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const { copyFile } = require('node:fs/promises');
const evEmitter = require('events');
//

// События:
// bEmit.emit('createFolderBundleDone', folderPath);
const bEmit = new evEmitter();

// сформировать файл index.html из шаблонов папки components
// bEmit.on('createFolderBundleDone', createIndex);
bEmit.on('createFolderBundleDone', writeFileIndex);

// Компилирует стили из styles папки в один файл
//  и помещает его в project-dist/style.css.
bEmit.on('createFolderBundleDone', createStyles);

// Копирует assets папку в project-dist/assets.
bEmit.on('createFolderBundleDone', copyAssets);

//
//
//
//
//
void (async function main() {
  // создать папку для бандла project-dist
  const bundleFolderPath = await createFolderBundle();

  // сформировать файл index.html из шаблонов папки components
  // bEmit.on('createFolderBundleDone', createIndex);
})();

/**
 * создать папку для бандла project-dist
 */
async function createFolderBundle() {
  return new Promise(async (resolve) => {
    const folderPath = await createDir(path.resolve(__dirname, 'project-dist'));
    console.log('[function createFolderBundle]: folderPath');
    console.log(folderPath);

    // создать файл индекса в project-dist/index.html.
    // Компилирует стили из styles папки в один файл и помещает его в project-dist/style.css.
    // Копирует assetsпапку в project-dist/assets.
    bEmit.emit('createFolderBundleDone', folderPath);
    resolve(folderPath);
  });
}

/**
 * Создать папку
 * @param {string} pathDir путь по которому создать папку
 * @param {string} nameDir Имя папки для создания
 * @return {false} - false если папка не создана
 * @return {String} -Путь к папке если папка создана
 */
async function createDir(pathDir) {
  const nameDir = path.basename(pathDir);
  console.log('pathDir', pathDir);

  console.log(
    `!!!!!!!!!!!!!!!![function createDir]: Создание папки ${nameDir}`,
  );

  console.log(`[function createDir]: Создание папки ${nameDir}`);

  // проверить существование папки
  // если есть -удалить
  const isCopyDirExist = await isPathExist(pathDir);
  if (isCopyDirExist) {
    await removeDir(pathDir);
    console.log(`[function createDir]: Старая папка ${nameDir} удалена`);
  }

  return new Promise((resolve) => {
    fs.mkdir(pathDir, (err) => {
      if (err) {
        console.log(
          `Ошибка [function createDir] fs.mkdir путь ${nameDir} не создан`,
          err,
        );
        resolve(false);
        return err;
      }

      console.log(`[function createDir]: Папка ${nameDir} создана.`);
      resolve(pathDir);
    });
  });
}

/**
 * прочитать файл
 * @returns содержимое файла
 */
async function getFileContent() {
  const templateStream = fs.createReadStream(
    path.resolve(__dirname, 'template.html'),
  );

  console.log('start');

  let dataTemlate = '';
  await new Promise((resolve) => {
    templateStream.on('data', (chunk) => {
      dataTemlate += chunk;
      console.log('Чтение файла template.html');
    });

    templateStream.on('close', () => {
      console.log('Файл template.html прочитан ');

      resolve();
    });
  });

  console.log('end');
  // console.log('dataTemlate', dataTemlate);

  return dataTemlate;
}

/**
 * Получить имена блоков шаблона страницы
 * @param {string} str - строка с шаблонами типа {{footer}}
 * @returns имена блоков шаблона страницы
 */
function getNameBlocks(str) {
  const regexp = /\{\{{1}(\w+)\}\}{1}/gim;
  const search = str.matchAll(regexp);
  console.log('[function getNameBlocks]: поиск имен блоков шаблонов');
  const blocks = [];
  for (const el of search) {
    // console.log(el);

    blocks.push(el);
  }
  console.log('[function getNameBlocks]: Имена блоков шаблона получены.');
  // console.log(blocks);
  return blocks;
}

/**
 * Прочитать папку с блоками для формирования страницы
 *
 * @param {String} pathToDir путь до папки
 * @param {string} [extname='.html'] - разрешения файлов
 * @return {Array} массив имен файлов с разрешением [extname]
 */
async function getFilesTemplates(pathToDir, extname = '.html') {
  let files = [];
  try {
    files = await readdir(pathToDir, { withFileTypes: true });
  } catch (err) {
    console.error('Ошибка чтения списка файлов:', err);
  }

  const fileTemlates = files.filter((el) => {
    if (el.isFile() && path.extname(el.name) === extname) {
      return true;
    }
    return false;
  });

  // добавить в объекты имен файлов строчное имя файла
  fileTemlates.map((curr) => {
    console.log('path.extname(curr.name)');
    console.log(path.extname(curr.name));
    console.log('baseName');

    console.log(curr.name);
    console.log('curr');
    console.log(curr);

    const extName = path.extname(curr.name);
    const baseName = path.basename(curr.name, extName);
    curr.baseName = baseName;
    curr.extName = extName;
    curr[baseName] = curr.path;
  });

  return fileTemlates;
}

/**
 * Создание бандла index.html
 *
 * @param {string} bundleFolderPath - путь к папке бандла
 * @returns файл индекс.html
 */
async function createIndex(bundleFolderPath) {
  console.log('[function createIndex]: Создание бандла index.html');
  console.log(bundleFolderPath);

  //   прочитать файл шаблона для index.html
  const templateFile = await getFileContent();
  console.log('=====================templateFile');
  console.log(templateFile);

  // Получить имена блоков шаблона страницы
  const blockNames = getNameBlocks(templateFile);

  // Прочитать папку с блоками для формирования страницы
  const pathToDirTemplates = path.resolve(__dirname, 'components');
  const filesNameTemplates = await getFilesTemplates(
    pathToDirTemplates,
    '.html',
  );
  console.log('filesNameTemplates');
  console.log(filesNameTemplates);

  // сопоставить массив блоков и массив файлов
  // чтобы выявить только однинаковые вхождения
  const compareFiles = compareBlocksToFiles(blockNames, filesNameTemplates);
  console.log('compareFiles');
  console.log(compareFiles);

  // записать содержимое файлов шаблонов из папки components в index.html
  await writeFile(compareFiles, 'index.html');
  console.log('[function createIndex]: Бандл index.html создан');
  return 'bundleFolderPath.Index.html';
}

/**
 * записать файл по чанкам используя шаблонный файл
 * и файлы блоков указанных  в шаблоне
 * */
async function writeFileIndex(params) {
  console.log(`[writeFileIndex]:  старт.`);

  //   прочитать файл шаблона для index.html
  const templateStream = fs.createReadStream(
    path.resolve(__dirname, 'template.html'),
    { encoding: 'utf-8' },
  );

  // Прочитать папку с блоками для формирования страницы
  const pathToDirTemplates = path.resolve(__dirname, 'components');
  console.log('const filesNameTemplates = await getFilesTemplates(');

  const filesNameTemplates = await getFilesTemplates(
    pathToDirTemplates,
    '.html',
  );

  const nameEndFile = 'index.html';
  // Создать файл index.html
  const bundle = fs.createWriteStream(
    path.resolve(__dirname, 'project-dist', nameEndFile),
  );

  bundle.on('close', (err) => {
    if (err) {
      console.log(
        '[Ошибка][function writeFileIndex]: Ошибка в bundle.on(close)',
      );
      console.log(err);
    }

    // console.log('bundle.writableEnded');
    // console.log(bundle.writableEnded);
    console.log(`[writeFileIndex]: Запись ${nameEndFile} окончена`);
  });

  let dataTemlate = '';
  await new Promise((resolve) => {
    templateStream.on('data', async (indexChunk) => {
      // поиск шаблонов в чанке файла
      // и вставка соответсвующего контента
      // из файла с именем найденного шаблона
      console.log('indexChunk');
      console.log(indexChunk);

      // Получить имена блоков шаблона страницы
      const blockNames = getNameBlocks(indexChunk);

      // сопоставить имена блоков шаблона страницы с файлами для формирования страницы
      for await (const elBlName of blockNames) {
        for await (const elFileName of filesNameTemplates) {
          if (elBlName[1] === elFileName.baseName) {
            const readFile = fs.createReadStream(
              path.resolve(elFileName.parentPath, elFileName.name),
              {
                encoding: 'utf-8',
              },
            );
            await new Promise((resolve) => {
              // readFile.pipe(bundle);
              readFile.on('data', (tempChunk) => {
                const regexp = new RegExp(
                  '{{{1}' + elFileName.baseName + '}}{1}',
                  'gim',
                );
                console.log('indexChunk ДО', indexChunk);

                indexChunk = indexChunk.replace(regexp, tempChunk);
                console.log('indexChunk ПОСЛЕ', indexChunk);
              });

              readFile.on('close', () => {
                resolve();
              });
            });

            // console.log('elFileName');
            // console.log(elFileName);
            // console.log('elBlName');
            // console.log(elBlName);
          }
        }
      }

      // для каждого найденного шаблона выполнить поиск файла с этим именем

      // вставить замененный контент в index.html
      console.log('[writeFileIndex]: Запись в index.html контент');

      await new Promise((resolve) => {
        bundle.write(indexChunk, (err) => {
          if (err) {
            console.log(`[Ошибка][writeFileIndex]: Ошибка  bundle.write `);
          }
          console.log('[writeFileIndex]: Запись index.html окончена');

          resolve();
        });
      });

      console.log('Чтение файла template.html');
    });

    templateStream.on('close', () => {
      console.log('Файл template.html прочитан ');

      resolve();
    });
  });

  console.log('end');
  // завершить запись закрыть файл index.html
  bundle.emit('close');
  return dataTemlate;
}

//
//
//
//
//
//
//
//

/**
 * Записать из файлов в файл
 * @param {Array} files - массив файлов для извлечения контента
 *  и записи в конечный файл
 * @param {string} nameEndFile - имя конечного файла
 */
async function writeFileForChunk(files, nameEndFile) {
  console.log(`[writeFile]: Запись ${nameEndFile} старт.`);

  // Создать файл бандла
  const bundle = fs.createWriteStream(
    path.resolve(__dirname, 'project-dist', nameEndFile),
  );

  bundle.on('close', (err) => {
    if (err) {
      console.log('Ошибка в function writeFileIndex bundle.emit');
      console.log(err);
    }

    // console.log('bundle.writableEnded');
    // console.log(bundle.writableEnded);
    console.log(`[writeFileIndex]: Запись ${nameEndFile} окончена`);
  });

  for await (const el of files) {
    const readFile = fs.createReadStream(path.resolve(el.parentPath, el.name));
    await new Promise((resolve) => {
      // readFile.pipe(bundle);
      readFile.on('data', (chunk) => {
        bundle.write(chunk, (err) => {
          if (err) {
            console.log(
              'Ошибка: function writeFileIndex  bundle.write(chunk,(err)',
              err,
            );
          }
        });
      });

      readFile.on('close', () => {
        resolve();
      });
    });
  }

  // console.log(`bundle.emit('close');`);

  bundle.emit('close');
}

/**
 * проверка существования папки
 *
 * @param {string} pathS - путь к папке
 * @returns {boolean} true\false
 */
async function isPathExist(pathS) {
  return new Promise((resolve) => {
    fs.access(pathS, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // console.log('[function isPathExist]: каталога нет', pathS);
          resolve(false);
          return;
        }
        console.log('[Ошибка. function isPathExist]', pathS);
        console.log(err);
      }

      // console.log('[function isPathExist]: каталог уже есть', pathS);
      resolve(true);
    });
  });
}

/**
 * Удаление папки
 * @param {string} pathRm путь к папке
 * @returns {Promise}
 */
async function removeDir(pathRm) {
  return new Promise((resolve) => {
    const pathToDir = path.join(pathRm, path.sep);

    console.log('[function removeDir]: удаление', pathToDir);

    fs.rm(pathToDir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.log('Ошибка. [function removeDir]');
        console.log(err);
      }
      console.log('[function removeDir]: удаление завершено', pathRm);
      resolve();
    });
  });
}

/**
 * Сравнить массив имен которые есть в двух массивах
 * @param {Array} blocks массив имен блоков
 * @param {Array} files массив имен файлов
 * @returns массив имен которые есть в двух массивах
 */
function compareBlocksToFiles(blocks, files) {
  const filesName = files.reduce((acc, curr) => {
    acc.push(curr.baseName);
    return acc;
  }, []);

  const compareNames = blocks.filter((el) => {
    if (filesName.includes(el)) {
      return true;
    }
    return false;
  });
  // console.log('===============================r');
  // console.log(compareNames);

  const result = [];
  for (let i = 0; i < compareNames.length; i++) {
    const el = compareNames[i];
    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      if (el === file.baseName) {
        result.push(file);
      }
    }
  }
  // console.log('+++++++++++++++++result');
  // console.log(result);

  return result;
}

/**
 * Записать из файлов в файл
 * @param {Array} files - массив файлов для извлечения контента
 *  и записи в конечный файл
 * @param {string} nameEndFile - имя конечного файла
 */
async function writeFile(files, nameEndFile) {
  console.log(`[writeFile]: Запись ${nameEndFile} старт.`);

  // Создать файл бандла
  const bundle = fs.createWriteStream(
    path.resolve(__dirname, 'project-dist', nameEndFile),
  );

  bundle.on('close', (err) => {
    if (err) {
      console.log('Ошибка в function writeFileIndex bundle.emit');
      console.log(err);
    }

    // console.log('bundle.writableEnded');
    // console.log(bundle.writableEnded);
    console.log(`[writeFileIndex]: Запись ${nameEndFile} окончена`);
  });

  for await (const el of files) {
    const readFile = fs.createReadStream(path.resolve(el.parentPath, el.name));
    await new Promise((resolve) => {
      // readFile.pipe(bundle);
      readFile.on('data', (chunk) => {
        bundle.write(chunk, (err) => {
          if (err) {
            console.log(
              'Ошибка: function writeFileIndex  bundle.write(chunk,(err)',
              err,
            );
          }
        });
      });

      readFile.on('close', () => {
        resolve();
      });
    });
  }

  // console.log(`bundle.emit('close');`);

  bundle.emit('close');
}

/**
 * Компилирует стили из styles папки в один файл
 *  и помещает его в project-dist/style.css.
 */
async function createStyles() {
  console.log('[function createStyles]: Создание бандла style.css');

  // Прочитать папку со стилями
  const pathToDirTemplates = path.resolve(__dirname, 'styles');
  const filesNameTemplates = await getFilesTemplates(
    pathToDirTemplates,
    '.css',
  );
  console.log('filesNameTemplates');
  console.log(filesNameTemplates);

  // сопоставить массив блоков и массив файлов
  // чтобы выявить только одникаовые вхождения

  // записать содержимое файлов шаблонов в папку project-dist файл style.css
  await writeFile(filesNameTemplates, 'style.css');
  console.log('[function createStyles]: Бандл style.css создан');
}

/**
 * Копирует assets папку в project-dist/assets.
 *
 * @param {*} params
 */
async function copyAssets() {
  console.log('[function copyAssets]: копирование папки assets');
  // проверить есть ли оригинальная папка Assets?
  const pathAssets = path.resolve(__dirname, 'assets');
  const isAssets = isPathExist(pathAssets);
  if (!isAssets) {
    console.log(
      '[function copyAssets]: Папка assets не найдена. Работа завершена',
    );
    return;
  }

  // создать папку копию Assets
  const pathCopyAssets = await copyDir(
    path.resolve(__dirname, 'assets'),
    path.resolve(__dirname, 'project-dist', 'assets'),
  );

  console.log('[function copyAssets]: pathCopyAssets', pathCopyAssets);
}

// ============================================

/**
 * Копирование папки
 *
 * @param {string} pathToDir  - путь до папки
 */
async function copyDir(pathToDir, pathCopyDir) {
  console.log('start function copyDir()');

  // проверка - явл ли путь папкой
  if (!(await isDir(pathToDir))) {
    console.log(
      `\n\n[Ошибка][Путь ${pathToDir} не является папкой. Проверьте путь.]\n\n`,
    );
  }

  // проверить есть уже папка для копирования если есть то удалить
  const isCopyDirExist = await isPathExist(path.resolve(pathCopyDir));
  if (isCopyDirExist) {
    await removeDir(pathCopyDir);
    console.log(`Папка ${pathCopyDir} удалена`);
  }

  // создать папку для копирования
  // имя папки копирования

  const pathDirToCopy = await createDir(pathCopyDir);
  console.log('pathDirToCopy', pathDirToCopy);

  // определить файлы для копирования
  const files = await getFileListToCopy(pathToDir);
  console.log('files files');
  console.log(files);

  const onlyFiles = [];
  const onlyDirs = [];

  for await (const el of files) {
    if (el.isDirectory()) {
      await copyDir(
        path.resolve(el.parentPath, el.name),
        path.resolve(pathDirToCopy, el.name),
      );
      onlyDirs.push(el);
    } else {
      onlyFiles.push(el);
    }
  }

  // const only2Files = await Promise.all(
  //   files.filter((el) => {
  //     return new Promise((resolve) => {
  //       //

  //       console.log(el.isDirectory());

  //       if (el.isDirectory()) {
  //         // await copyDir(
  //         //   el.path,
  //         //   path.resolve(pathDirToCopy, path.basename(el.path)),
  //         // );
  //         resolve(false);
  //         return false;
  //       } else {
  //         resolve(true);
  //         return true;
  //       }

  //       //
  //     });
  //     //
  //   }),
  // );
  // console.log('onlyFiles=======================');
  // console.log(onlyFiles);

  // скопировать файлы
  if (onlyFiles.length > 0) {
    const copyF = await copyFiles(onlyFiles, pathToDir, pathDirToCopy);
    console.log('// скопировать файлы const copyF = await  copyFiles');
    console.log(copyF);
  }

  return pathCopyDir;
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
  // const files = await readdir(pathToDir);
  const files = await readdir(pathToDir, { withFileTypes: true });
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
  console.log('fileList');
  console.log(fileList);

  const f = await Promise.all(
    fileList.map((file) => {
      const src = path.resolve(srcPathDir, file.name);
      const target = path.resolve(copyPathDir, file.name);
      copyFile(src, target);
      return target;
    }),
  );

  console.log('function copyFiles: done');
  console.log(f);
  return f;
}

// ============================================
