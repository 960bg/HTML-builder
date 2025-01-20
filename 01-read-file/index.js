const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'text.txt');

// создать поток чтения из файла по пути filePath
const readableStream = fs.createReadStream(filePath, 'utf8');

// читать из потока
async function readChunk(readStream) {
  for await (const element of readStream) {
    process.stdout.write(element);
  }
}

readChunk(readableStream);
