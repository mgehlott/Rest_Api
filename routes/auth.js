const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const { body } = require('express-validator');
const User = require('../models/user');

router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email is Already Exist');
                    }
                });

        }).normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authController.signUp);


module.exports = router;