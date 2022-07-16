const express = require('express');
const router = express.Router();
const feedController = require('../controller/feed');

// get at feed/posts

router.get('/posts', feedController.getPosts);

module.exports = router;