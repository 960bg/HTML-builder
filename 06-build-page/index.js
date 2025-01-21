const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
//
//
//
void (async function main() {
  const page = await getTemlates();

  const blocks = getBlocks(page);
})();

/**
 * прочитать файл
 * @returns содержимое файла
 */
async function getTemlates() {
  const templateStream = fs.createReadStream(
    path.resolve(__dirname, 'template.html'),
  );

  console.log('start');

  let dataTemlate = '';
  await new Promise((resolve) => {
    templateStream.on('data', (chunk) => {
      dataTemlate += chunk;
      console.log('templateStream.on(data: dataTemlate += chunk');
    });

    templateStream.on('close', () => {
      console.log('templateStream.on(close: ');

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
function getBlocks(str) {
  const regexp = /\{\{{1}(\w+)\}\}{1}/gim;
  const search = str.matchAll(regexp);
  console.log('search:');
  const blocks = [];
  for (const el of search) {
    blocks.push(el[1]);
  }

  console.log('blocks');
  console.log(blocks);
  return blocks;
}
