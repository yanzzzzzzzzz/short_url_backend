const express = require('express');
const UrlRouter = express.Router();
const urlController = require('../controller/URLController');

UrlRouter.post('/', urlController.createShortUrl);
UrlRouter.get('/:shortUrl', urlController.redirectShortUrl);
UrlRouter.get('/', urlController.getUserUrls);
UrlRouter.delete('/:shortUrl', urlController.deleteShortUrl);
UrlRouter.put('/:shortUrl', urlController.updateShortUrl);
UrlRouter.patch('/:shortUrl', urlController.patchShortUrl);

module.exports = UrlRouter;
