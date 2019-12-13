const program = require('commander');

const { transcodeM3u8File } = require('./transcode');
const { getVideos } = require('./scraper');

program
    .option('--url <url>', 'url of animepahe page')
    .option('-n, --nickname <nickname>', 'nickname for URL which can be reused instead of passing the URL all the time')
    .option('-s, --start <start>', 'episode to start scraping from', 1)
    .option('--end <episode>', 'episode to stop scraping at')
    .option('-e, --episodes <number>', 'number of episodes to scrape', 1);


async function main() {
    program.parse(process.argv);

    let { nickname, url, start, end, episodes } = program;

    if (!nickname && !url) throw new Error('url and nickname cannot both be undefined');

    if (nickname) {
        if (url) {
            await saveNickname(nickname, url);
        } else {
            url = await getUrl(nickname);
        }
        console.log(`Scraping ${url}`);
    }

    console.log(url);
    let urls;
    if (end) {
        urls = await getVideos(url, start, end);
    } else {
        urls = await getVideos(url, start, start + episodes - 1);
    }

    await Promise.all(urls.map(transcodeM3u8File));
}

async function saveNickname(nickname, url) {
    const db = getDB();

    await db.put(nickname, url);
    await db.close();
}

async function getUrl(nickname) {
    const db = getDB();

    const url = await db.get(nickname);
    await db.close();

    return url;
}

function getDB() {
    return require('level')('./db');
}

main().catch(console.error);
