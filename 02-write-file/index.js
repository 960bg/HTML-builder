const fs = require('fs');
const path = require('path');

console.log('Задание 02-write-file. ');
console.log('Ожидание ввода данных пользователем...');

void (async function () {
  // сформировать путь до файла
  const filePath = path.resolve(__dirname, 'text.txt');

  // список файлов в папке
  const filesInDir = await getInfoDir(__dirname);

  // если файл уже есть то удалить
  if (filesInDir.includes('text.txt')) {
    // console.log('Удаление...');
    await delFile(filePath);
    // console.log(`unlink ${filePath} is done.`);
  }

  // создать поток для записи
  const writeStream = fs.createWriteStream(filePath);

  process.stdin.on('data', (data) => {
    const dataString = data.toString('utf-8');

    if (dataString.trim() === 'exit') {
      process.exit(0);
    }
    writeStream.write(dataString);
    console.log(`Ввели ${dataString} и записали в файл`);
    console.log();

    console.log('Ожидание ввода данных пользователем...');
  });

  // действия при выходе
  process.on('exit', (code) => {
    if (code === 0) {
      // закрыть файл
      writeStream.end();
      process.stdout.write('Удачи в изучении Node.js!');
    } else {
      process.stderr.write(
        `Ошибка. Что-то пошло не так. Программа завершилась с кодом ${code}`,
      );
    }
  });

  process.on('SIGINT', function () {
    process.stdout.write('Завершение программы Node.js!');
    process.exit(0);
  });

  // /действия при выходе

  async function getInfoDir(dirname) {
    // let dirInfo = [];
    const dirInfo = await new Promise((resolve) => {
      fs.readdir(path.join(dirname, '/'), (err, files) => {
        // console.log(files);
        resolve(files);
      });
    });

    // console.log('dirInfo');
    // console.log(dirInfo);

    return dirInfo;
  }

  async function delFile(filePath) {
    return new Promise((resolve) => {
      fs.unlink(path.join(filePath), (err) => {
        if (err) {
          console.log(`unlink ${filePath} ERROR!!!!`);
          return;
        }
        // console.log(`unlink ${filePath} DONE!!!!`);

        resolve();
      });
    });
  }

  async function createFile(filePath) {
    return new Promise((resolve) => {});
  }
})();

// 02-write-file
