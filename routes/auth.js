const { Router } = require('express');
const { development } = require('../config/config');
const { saveUser, verifyUser, checkGuestAccess, getUserStatus } = require('../controllers/user');
const { validationResult } = require('express-validator');
const validationRegister = require('../controllers/validationRegister');
const validationLogin = require('../controllers/validationLogin');

const router = Router();

// GET requests
// Load login page
router.get('/user/login', checkGuestAccess, getUserStatus, (req, res) => {
    res.render('login', { isLoggedIn: req.isLoggedIn })
})

// Load registration page
router.get('/user/register', checkGuestAccess, getUserStatus, (req, res) => {
    res.render('register', { isLoggedIn: req.isLoggedIn });
})

//User logout
router.get('/user/logout', getUserStatus, (req, res) => {
    res.clearCookie(development.cookie).redirect('/');
})

// POST requests
// Register new user
router.post('/user/register', validationRegister, async (req, res) => {
     
    // Validate register details 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', {
            message: errors.array()[0].msg,
        })
    }
    try {
        await saveUser(req, res);
        res.redirect('/user/login');
    } catch (error) {
        console.log(error);
        res.redirect('/user/register');
    }
});

// User login 
router.post('/user/login', validationLogin, async (req, res) => {
    // Validate login details 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', {
            message: errors.array()[0].msg,
        })
    }
    const status = await verifyUser(req, res);
    console.log(status);
    if (status) {
        return res.redirect('/');
    }
    res.render('login', { message: 'Wrong username or password' })
});


module.exports = router;