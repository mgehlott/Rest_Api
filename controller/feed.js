const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');

exports.getPosts = (req, res, next) => {
    console.log('get all posts');
    let totalItems;
    const perPageItem = 2;
    const currentPage = req.query.page || 1;

    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPageItem)
                .limit(perPageItem);
        })
        .then(posts => {
            res.status(200).json({ message: "all posts feched !!", posts: posts, totalItems: totalItems });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.createPost = (req, res, next) => {
    console.log('inside create post backend');
    console.log(req.body.title, req.body.content);
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed !!!');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No Image Prvoided');
        error.statusCode = 422;
        throw error;
    }
    console.log(req.file);
    const title = req.body.title;
    const content = req.body.content;
    const imgUrl = req.file.path;
    console.log(imgUrl);

    const post = new Post({
        title: title,
        content: content,
        imgUrl: imgUrl,
        creator: {
            name: 'mahendra'
        }
    });

    post.save()
        .then(result => {
            return res.status(201).json({
                message: 'Post created Succesfull',
                post: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getPost = (req, res, next) => {
    console.log('get single post backend');
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error('Could not find post!!!');
                err.statusCode = 404;
                throw err;
            }
            res.status(200).json({ post: post });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);

        });

}

exports.updatePost = (req, res, next) => {

    const postId = req.params.postId;
    const errors = validationResult(req);
    //console.log(errors.array());
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed !!!');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imgUrl = req.body.image;
    if (req.file) {
        imgUrl = req.file.path;
    }
    if (!imgUrl) {
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error('Could not find post!!!');
                err.statusCode = 404;
                throw err;
            }

            post.title = title;
            post.content = content;
            post.imgUrl = imgUrl;
            if (imgUrl !== post.imgUrl) {
                clearImage(post.imgUrl);
            }
            return post.save();
        })
        .then(result => {
            res.status(200).json({ message: 'post updated', post: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}


module.exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error('Could not find post!!!');
                err.statusCode = 404;
                throw err;
            }
            //check for user auth
            clearImage(post.imgUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            res.status(200).json({ message: 'deleted post' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

const clearImage = (filepath) => {
    filepath = path.joint(__dirname, '..', filepath);
    fs.unlink(filepath, err => console.log(err));
}