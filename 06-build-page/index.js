const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const evEmitter = require('events');
//

const bEmit = new evEmitter();

// сформировать файл index.html из шаблонов папки components
bEmit.on('createFolderBundleDone', createIndex);
// События:
// bEmit.emit('createFolderBundleDone', folderPath);

//
//
void (async function main() {
  // создать папку для бандла project-dist
  const bundleFolderPath = await createFolderBundle();

  // сформировать файл index.html из шаблонов папки components
  // bEmit.on('createFolderBundleDone', createIndex);
})();

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
  console.log('search:');
  const blocks = [];
  for (const el of search) {
    blocks.push(el[1]);
  }
  console.log('Имена блоков шаблона получены.');
  console.log(blocks);
  return blocks;
}

/**
 * Прочитать папку с блоками для формирования страницы
 *
 * @param {String} pathToDir путь до папки
 * @return {Array} массив имен файлов шаблонов .html
 */
async function getFilesTemplates(pathToDir) {
  let files = [];
  try {
    files = await readdir(pathToDir, { withFileTypes: true });
  } catch (err) {
    console.error('Ошибка чтения списка файлов:', err);
  }

  const fileTemlates = files.filter((el) => {
    if (el.isFile() && path.extname(el.path) === '.html') {
      return true;
    }
    return false;
  });

  // добавить в объекты имен файлов строчное имя файла
  fileTemlates.map((curr) => {
    const extName = path.extname(curr.path);
    const baseName = path.basename(curr.path, extName);
    curr.baseName = baseName;
    curr.extName = extName;
  });

  return fileTemlates;
}

/**
 * создать папку для бандла project-dist
 */
async function createFolderBundle() {
  const folderPath = path.resolve(__dirname, 'project-dist');
  // проверить существование папки
  // если есть -удалить
  const isCopyDirExist = await isPathExist(folderPath);
  if (isCopyDirExist) {
    await removeDir(folderPath);
    console.log(`Папка ${folderPath} удалена`);
  }

  return new Promise((resolve) => {
    fs.mkdir(folderPath, (err) => {
      if (err) {
        console.log('Ошибка в function createFolderBundle fs.mkdir');
        return err;
      }
      console.log('Папка project-dist создана.');

      // создать файл индекса в project-dist/index.html.
      // Компилирует стили из styles папки в один файл и помещает его в project-dist/style.css.
      // Копирует assetsпапку в project-dist/assets.
      bEmit.emit('createFolderBundleDone', folderPath);
      resolve(folderPath);
    });
  });
}

/**
 *
 * @param {string} bundleFolderPath - путь к папке бандла
 * @returns файл индекс.html
 */
async function createIndex(bundleFolderPath) {
  console.log('[function createIndex]: start');
  console.log(bundleFolderPath);

  //   прочитать файл шаблона для index.html
  const templateFile = await getFileContent();

  // Получить имена блоков шаблона страницы
  const blockNames = getNameBlocks(templateFile);

  // Прочитать папку с блоками для формирования страницы
  const pathToDirTemplates = path.resolve(__dirname, 'components');
  const filesNameTemplates = await getFilesTemplates(pathToDirTemplates);
  console.log('filesNameTemplates');
  console.log(filesNameTemplates);

  // сопоставить массив блоков и массив файлов
  // чтобы выявить только одникаовые вхождения
  const compareFiles = compareBlocksToFiles(blockNames, filesNameTemplates);
  console.log('compareFiles');
  console.log(compareFiles);

  // записать содержимое файлов шаблонов из папки components в index.html
  await writeFileIndex(compareFiles);

  return 'bundleFolderPath.Index.html';
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
          console.log('[function isPathExist]: каталога нет');
          resolve(false);
          return;
        }
        console.log('[Ошибка. function isPathExist]');
        console.log(err);
      }

      console.log('[function isPathExist]: каталог есть');
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

/**
 * Сравнить массив имен которые есть в двух массивах
 * @param {Array} blocks массив имен блоков
 * @param {Array} files массив имен файлов
 * @returns массив имен которые есть в двух массивах
 */
function compareBlocksToFiles(blocks, files) {
  const res = files.filter((el) => {
    if (blocks.includes(el.baseName)) {
      return true;
    }
    return false;
  });

  return res;
}

/**
 * Записать из файлов в файл
 * @param {Array} files
 */
async function writeFileIndex(files) {
  console.log('[writeFileIndex]: Запись index.html старт.');

  // Создать файл бандла
  const bundle = fs.createWriteStream(
    path.resolve(__dirname, 'project-dist', 'index.html'),
  );

  bundle.on('close', (err) => {
    if (err) {
      console.log('Ошибка в function writeFileIndex bundle.emit');
      console.log(err);
    }

    // console.log('bundle.writableEnded');
    // console.log(bundle.writableEnded);
    console.log('[writeFileIndex]: Запись index.html окончена');
  });

  for await (const el of files) {
    const readFile = fs.createReadStream(el.path);
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
