const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const filePath = path.resolve(__dirname, 'text.txt');

void (async function main() {
  console.log(`\n05-merge-styles: Начать сборку бандла.\n`);

  // получить список стилей
  const styles = await getFilesStyles(path.resolve(__dirname, 'styles'));
  // console.log('получить список стилей');
  // console.log(styles);

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
    // console.log('el.isFile()');
    // console.log(el.isFile());
    // console.log('path.extname(el.path)');
    // console.log(path.extname(el.path));
    // console.log('path.extname(el.path).trim() === .css');
    // console.log(path.extname(el.path).trim() === '.css');

    if (
      el.isFile() &&
      path.extname(path.resolve(el.parentPath, el.name)).trim() === '.css'
    ) {
      return true;
    }
    return false;
  });

  // console.log('stylesssssss');
  // console.log(styles);
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

  bundle.on('close', (err) => {
    if (err) {
      console.log('Ошибка в function writeStyle bundle.emit');
      console.log(err);
    }

    // console.log('bundle.writableEnded');
    // console.log(bundle.writableEnded);
    console.log('Запись окончена');
  });

  for await (const el of files) {
    const readFile = fs.createReadStream(path.resolve(el.parentPath, el.name));
    await new Promise((resolve) => {
      // readFile.pipe(bundle);
      readFile.on('data', (chunk) => {
        bundle.write(chunk, (err) => {
          if (err) {
            console.log(
              'Ошибка: function writeStyle  bundle.write(chunk,(err)',
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
