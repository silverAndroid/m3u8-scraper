const fetch = require('node-fetch');
const cheerio = require('cheerio');

const { beautify } = require('./beautify');

async function getVideos(animePage, start, end) {
  let res = await fetch(animePage);
  const html = await res.text();
  const $ = cheerio.load(html);

  const animeId = $('.anime-detail').attr('class').split(' ')
    .map((clazz) => clazz.match(/anime-([0-9]+)/))
    .filter((clazz) => !!clazz)[0][1];
  console.log(animeId);

  res = await fetch(`https://animepahe.com/api?m=release&id=${animeId}&l=30&sort=episode_desc&page=1`);
  const { data } = await res.json();
  const videoIds = data
    .filter(({ episode }) => Number(episode) >= start && (!end || Number(episode) <= end))
    .map(({ id }) => id);
  return Promise.all(videoIds.map(id => getVideo(id)));
}

async function getVideo(videoId) {
  let res = await fetch(`https://animepahe.com/api?m=embed&id=${videoId}&p=kwik`);
  const { data: { [videoId]: { '720p': video720, '1080p': video1080 } } } = await res.json();

  const { url: kwikUrl } = video1080 ? video1080 : video720;
  const kwikId = kwikUrl.split('/').pop();
  console.log(kwikUrl, kwikId);
  res = await fetch(`https://kwik.cx/f/${kwikId}`, { headers: { 'Referer': kwikUrl } });
  const html = await res.text();
  const $ = cheerio.load(html);

  const packedJs = $('script').get(13).children[0].data;
  const unpackedJs = beautify(packedJs);
  return unpackedJs.match(/const source\s?=\s?'(.+)';/)[1];
}

module.exports = { getVideos };
