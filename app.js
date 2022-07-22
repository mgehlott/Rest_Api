const express = require('express');
const feedRouter = require('./routes/feed');
const authRouter = require('./routes/auth');
const bodyParse = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Math.random() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const app = express();
dotenv.config({ path: './config.env' });

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
//console.log(PORT, MONGO_URI);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Authorization');
    next();
});

app.use(bodyParse.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static('images'));


app.use('/feed', feedRouter);
app.use('/auth', authRouter);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const msg = error.message;
    const data = error.data
    res.status(status).json({ message: msg, data: data });
})

mongoose.connect(MONGO_URI)
    .then(result => {
        app.listen(PORT, () => {
            console.log('server is listning at 8080');
        })
    })
    .catch(err => {
        console.log(err);
    })

