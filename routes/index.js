const { Router } = require('express');
const { validationResult } = require('express-validator');
const { getUserStatus, checkAuthentication } = require('../controllers/user');
const validation = require('../controllers/validation');
const Play = require('../models/play');
const { sortByLikes, sortByDate } = require('../controllers/play');
const router = Router();

// GET requests
// Get Home
router.get('/', getUserStatus, async (req, res) => {
    const guestPlays = await sortByLikes();
    const loggedInPlays = await sortByDate();

    res.render('home', {
        isLoggedIn: req.isLoggedIn,
        guestPlays,
        loggedInPlays
    });
})

// Get create theater form
router.get('/theater/create', checkAuthentication, getUserStatus, async (req, res) => {
    res.render('create-theater', {
        isLoggedIn: req.isLoggedIn,
    });
});

// Get play details
router.get('/theater/details/:id', checkAuthentication, getUserStatus, (req, res) => {
    Play
        .findById(req.params.id)
        .lean()
        .then((play) => {
            const isCreator = play.creator.toString() === req.user._id.toString();
            const isLiked = play.usersLiked.filter(x => x.toString() === req.user._id.toString());
            res.render('theater-details', {
                isLoggedIn: req.isLoggedIn,
                isLiked,
                isCreator,
                ...play
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        })
});

// Like a play
router.get('/play/like/:id', checkAuthentication, (req, res) => {

    const playId = req.params.id;
    const { _id } = req.user;

    Play
        .findByIdAndUpdate(playId, {
            $addToSet: {
                usersLiked: [_id],
            }
        })
        .then((play) => {
            res.redirect(`/theater/details/${playId}`);
        })
        .catch((err) => { console.log(err) });


})

// Delete a play
router.get('/play/delete/:id', checkAuthentication, (req, res) => {
    Play
        .deleteOne({ _id: req.params.id })
        .then((play) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err)
        });
})

// Render "Edit a play" page
router.get('/play/edit/:id', checkAuthentication, (req, res) => {
    Play
        .findOne({ _id: req.params.id })
        .then((play) => {
            res.render('edit-theater', play);
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/theater/details/:id');
        })
})

// POST requests
// Create theater request
router.post('/theater/create', checkAuthentication, validation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('create-theater', {
            message: errors.array()[0].msg,
        })
    }
    const { title, description, imageUrl, isPublic } = req.body;
    const { _id } = req.user;
    const createdAt = new Date().toLocaleDateString();
    const play = new Play({
        title,
        description,
        imageUrl,
        isPublic: isPublic == 'on' ? true : false,
        createdAt,
        creator: _id,
    });
    play
        .save()
        .then((play) => {
            console.log
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        })


})

// Edit a play page request
router.post('/play/edit/:id', checkAuthentication, (req, res) => {
    const { title, description, imageUrl, isPublic } = req.body;
    Play.updateOne(
        { _id: req.params.id },
        {
            $set: { 
                title,
                description,
                imageUrl,
                isPublic: isPublic == 'on' ? true : false
         } }
    )
        .then((updatedPlay) => {
            console.log(updatedPlay);
            res.redirect('/');
        })
})


module.exports = router;