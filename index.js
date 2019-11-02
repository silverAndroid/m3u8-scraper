const program = require('commander');

const { transcodeM3u8File } = require('./transcode');

function videoList(urls) {
    return urls.split(',');
}

program
    .requiredOption('--urls <urls>', 'urls separated by comma', videoList);


async function main() {
    program.parse(process.argv);
    if (program.urls && program.urls.length > 0) {
        console.log(`Encoding ${program.urls.join(', ')}`);
        await Promise.all(program.urls.map(transcodeM3u8File));
    } else {
        console.log('No files to encode');
    }
}

main().catch(console.error);