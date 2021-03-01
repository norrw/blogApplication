const express = require('express')
const router = express.Router()
const User = require('../models/users')
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    const {username, email, password} = req.body
    const user = new User({email, username})
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
        if (err) {
            return next(err)
        }
    })
    req.flash('success', 'Successfully created new user')
    res.redirect('/articles')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), (req, res) => {
    const redirectUrl = req.session.returnTo || '/articles'
    delete req.session.returnTo
    req.flash('success', 'Welcome back')
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'Successfully logged out')
    res.redirect('/articles')
})

module.exports = router