const User = require('../controllers/user.controller');
const express = require('express');
const router = express.Router()

router.post('/signup', User.signUp);

router.post('/login', User.login);

router.get('/:id', User.getId);

module.exports = router;