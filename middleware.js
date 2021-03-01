const joi = require('joi')
const Article = require('./models/articles')

module.exports.validateArticle = async (req, res, next) => {
    const articleSchema = joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        markdown: joi.string().required()
    }).required()
    const {error} = articleSchema.validate(req.body)
    if (error) {
        throw new Error("Inputs for new article are incorrect")
    }
    next()
}

module.exports.validateComment = async (req, res, next) => {
    const commentSchema = joi.object({
        comment: joi.string().required()
    }).required()
    const {error} = commentSchema.validate(req.body)
    if (error) {
        throw new Error("Input for new comment is incorrect")
    }
    next()
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in to access this')
        return res.redirect('/login')
    }
    next() 
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params
    const article = await Article.findById(id)
    if (!article.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this')
        res.redirect(`/articles/${id}`)
    }
    else {
        next()
    }
}
