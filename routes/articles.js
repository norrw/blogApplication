const express = require('express')
const router = express.Router()
const {validateArticle, validateComment, isLoggedIn, isAuthor} = require('../middleware')
const Article = require('../models/articles')
const Comment = require('../models/comments')

router.get('', async (req, res, next) => {
    try {
        const articles = await Article.find({}).populate('author')
        res.render('index', {articles})
    } catch (err) {
        next(err)
    }
})

router.get('/new', isLoggedIn, async (req, res, next) => {
    try {
        res.render('new')
    } catch (err) {
        next(err)
    }
})

router.post('', isLoggedIn, validateArticle, async (req, res, next) => {
    try {
        const article = new Article(req.body)
        article.author = req.user._id
        await article.save()
        req.flash('success', 'Successfully created new article!')
        res.redirect('/articles')
    } catch (err) {
        next(err)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const {id} = req.params
        const article = await Article.findById(id).populate({path: 'comments', populate: {path: 'author'}}).populate('author')
        res.render('show', {article})
    } catch (err) {
        req.flash("error", "Couldn't find article")
        return res.redirect('/articles')
        next()
    }
})

router.get('/:id/edit', isLoggedIn, isAuthor, async (req, res, next) => {
    try {
        const {id} = req.params
        const article = await Article.findById(id)
        res.render('edit', {article})
    } catch (err) {
        req.flash("error", "Couldn't find article")
        return res.redirect('/articles')
        next()
    }
})

router.post('/:id', isLoggedIn, isAuthor, validateArticle, async (req, res, next) => {
    try {
        const {id} = req.params
        const article = await Article.findByIdAndUpdate(id, req.body)
        req.flash('success', 'Successfully edited article!')
        res.redirect(`/articles/${id}`)
    } catch (err) {
        next(err)
    }
})

router.delete('/:id', isLoggedIn, isAuthor, async (req, res, next) => {
    try {
        const {id} = req.params
        const article = await Article.findByIdAndDelete(id)
        req.flash('success', 'Successfully deleted article!')
        res.redirect('/articles')
    } catch (err) {
        next(err)
    }
})

router.post('/:id/comments', isLoggedIn, validateComment, async (req, res, next) => {
    try {
        const {id} = req.params
        const comment = new Comment({comment: req.body.comment})
        comment.author = req.user._id
        const article = await Article.findById(id)
        article.comments.push(comment)
        await article.save()
        await comment.save()
        req.flash('success', 'Successfully posted new comment!')
        res.redirect(`/articles/${id}`)
    } catch (err) {
        next(err)
    }
})

router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const {id, commentId} = req.params
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        const article = await Article.findByIdAndUpdate(id, {
            $pull: {
                comments: commentId
            }
        })
        await article.save()
        req.flash('success', 'Comment deleted')
        res.redirect(`/articles/${id}`)
    } catch (err) {
        next(err)
    }
})

module.exports = router