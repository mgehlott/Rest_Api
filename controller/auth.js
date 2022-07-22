const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.signUp = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt.hash(password, 12)
        .then(hashedPass => {
            const user = new User({
                email: email,
                password: password,
                name: name
            });
            return user.save();
        })
        .then(result => {
            return res.status(201).json({ message: 'user is created', userId: result._id })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}