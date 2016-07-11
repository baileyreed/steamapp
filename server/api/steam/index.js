'use strict';

var express = require('express');
var controller = require('./steam.controller');

var router = express.Router();

import * as auth from '../../auth/auth.service';


router.get('/news', auth.isAuthenticated(), controller.news);
router.get('/getSteamId', auth.isAuthenticated(), controller.getSteamId);
router.get('/friends', auth.isAuthenticated(), controller.friends);
router.get('/profile', auth.isAuthenticated(), controller.profile);
router.get('/friendGames', auth.isAuthenticated(), controller.friendGames);
// router.get('/:id', controller.show);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
