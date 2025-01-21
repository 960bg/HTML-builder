const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const filePath = path.resolve(__dirname, 'text.txt');

void (async function main() {
  // получить список стилей
  const styles = await getFilesStyles(path.resolve(__dirname, 'styles'));
  console.log('получить список стилей');
  console.log(styles);

  await writeStyle(styles);

  console.log('Бандл создан');
})();

/**
 * Прочитать файлы Стилей из папки
 *
 * @param {string} dirPath путь к папке со стилями
 * @returns {Array} массив файлов стилей
 */
async function getFilesStyles(dirPath) {
  // считать файлы из папки styles
  let files = [];
  try {
    files = await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.log('Ошибка в function getFilesStyles readdir');
  }

  // получить только файлы стилей
  const styles = files.filter((el) => {
    console.log('el.isFile()');
    console.log(el.isFile());
    console.log('path.extname(el.path)');
    console.log(path.extname(el.path));
    console.log('path.extname(el.path).trim() === .css');
    console.log(path.extname(el.path).trim() === '.css');

    if (el.isFile() && path.extname(el.path).trim() === '.css') {
      return true;
    }
    return false;
  });

  console.log('stylesssssss');
  console.log(styles);
  return styles;
  //
}

/**
 * Записать из файлов в файл
 * @param {Array} files
 */
async function writeStyle(files) {
  // Создать файл бандла
  const bundle = fs.createWriteStream(
    path.resolve(__dirname, 'project-dist', 'bundle.css'),
  );

  files.forEach(async (el) => {
    const readFile = fs.createReadStream(el.path);
    readFile.pipe(bundle);
  });
}

/**
 * Создать файл бандла
 * @param {string} pathFile путь к файлу
 */
async function createFile(pathFile) {
  return new Promise((resolve, reject) => {});
}

// создать поток чтения из файла по пути filePath
const readableStream = fs.createReadStream(filePath, 'utf8');

// читать из потока
async function readChunk(readStream) {
  for await (const element of readStream) {
    process.stdout.write(element);
  }
}

readChunk(readableStream);

readableStream.on('end', () => {
  console.log('Чтение конец');
});
