const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function getUrlInfo(url) {
  try {
    const response = await fetch(url);
    const htmlContent = await response.text();
    const $ = cheerio.load(htmlContent);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const previewImage = $('meta[property="og:image"]').attr('content');

    return { title, description, previewImage };
  } catch (error) {
    console.error(error);
  }
}
function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
module.exports = { getUrlInfo, isValidUrl };
