const readline = require('readline');
const fs = require('fs');
const os = require('os');
 
const fReadName = './econfig.txt';
const fWriteName = '../src/i18n/index.js';
const fRead = fs.createReadStream(fReadName);
const fWrite = fs.createWriteStream(fWriteName);
 
const objReadline = readline.createInterface({
    input: fRead,
});
fWrite.write(`// 可在econfig-front/i18nBase下执行node index.js,生成国际化文件${os.EOL}${os.EOL}`);
fWrite.write(`import { defineMessages } from 'react-intl';${os.EOL}${os.EOL}`);
fWrite.write(`const i18nMessages = defineMessages({${os.EOL}`);
 
objReadline.on('line', (line) => {
    const id = line.substring(0, line.indexOf('='));
    const defaultMessage = line.substring(line.indexOf('=') + 1, line.length);
    const tmp = `    ${id}:{id: '${id}', defaultMessage: '${defaultMessage}'},`;
    console.info(`${id}:${defaultMessage}`);
    fWrite.write(tmp + os.EOL); 
});
 
objReadline.on('close', () => {
    fWrite.write(`});${os.EOL}${os.EOL}`);
    fWrite.write(`export { ${os.EOL}    i18nMessages${os.EOL}};`);
    console.info('readline close...');
});