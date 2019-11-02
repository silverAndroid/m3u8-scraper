require('dotenv').config();
const { spawn } = require('child_process');

function getOutputFilePath(url) {
    const urlRe = /AnimePahe_(.+)\/(.+).m3u8/;
    const fileNameRe = /^.+\.(.+)$/;

    let fileName = url.match(urlRe)[1];
    const match = fileName.match(fileNameRe);
    if (match) {
        const fileExtension = match[1];
        if (fileExtension !== 'mp4') fileName = fileName.replace(new RegExp(`${fileExtension}$`), 'mp4');
        else if (!fileExtension) fileName += '.mp4';
    }
    return `${process.env.OUTPUT_FOLDER}/${fileName}`;
}

function transcodeM3u8File(m3u8Url) {
    return new Promise((resolve, reject) => {
        const filePath = getOutputFilePath(m3u8Url);
        // TODO: Set as info logging
        console.log(`Spawning ffmpeg for input: ${m3u8Url} output: ${filePath}`);

        const child = spawn(process.env.FFMPEG_PATH, ['-i', m3u8Url, '-c:a', 'aac', '-c:v', 'copy', '-bsf:a', 'aac_adtstoasc', filePath]);
        // TODO: Set as verbose logging
        child.stderr.on('data', err => console.error(err.toString()));

        // TODO: Set as info logging
        child.on('error', (err) => console.error(err));

        child.on('exit', (code, signal) => {
            if (code === 0) {
                // TODO: Set as info logging
                console.log(`Successfully downloaded and transcoded to ${filePath}`);
                resolve();
            } else {
                reject(`Code: ${code}, signal: ${signal}`);
            }
        });
    });
}

module.exports = { transcodeM3u8File };