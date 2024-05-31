const express = require('express');
const urlRouter = express.Router();
const urlController = require('../controller/URLController');

urlRouter.post('/', urlController.createShortUrl);
urlRouter.get('/:shortUrl', urlController.redirectShortUrl);
urlRouter.get('/', urlController.getUserUrls);
urlRouter.delete('/:shortUrl', urlController.deleteShortUrl);
urlRouter.put('/:shortUrl', urlController.updateShortUrl);
urlRouter.patch('/:shortUrl', urlController.patchShortUrl);

module.exports = urlRouter;
