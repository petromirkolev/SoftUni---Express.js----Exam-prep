const { Router } = require('express');
const { validationResult } = require('express-validator');
const { getUserStatus, checkAuthentication } = require('../controllers/user');
const itemValidation = require('../controllers/itemValidation');
const Item = require('../models/item');
const { sortByLikes, sortByDate } = require('../controllers/item');
const router = Router();

// GET requests
// Get Home
router.get('/', getUserStatus, async (req, res) => {
    const guestItems = await sortByLikes();
    const loggedInItems = await sortByDate();

    res.render('home', {
        isLoggedIn: req.isLoggedIn,
        guestItems,
        loggedInItems
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
    Item
        .findById(req.params.id)
        .lean()
        .then((item) => {
            const isCreator = item.creator.toString() === req.user._id.toString();
            const isLiked = item.usersLiked.filter(x => x.toString() === req.user._id.toString());
            res.render('theater-details', {
                isLoggedIn: req.isLoggedIn,
                isLiked,
                isCreator,
                ...item
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        })
});

// Like a play
router.get('/play/like/:id', checkAuthentication, (req, res) => {

    const itemId = req.params.id;
    const { _id } = req.user;

    Play
        .findByIdAndUpdate(itemId, {
            $addToSet: {
                usersLiked: [_id],
            }
        })
        .then((item) => {
            res.redirect(`/theater/details/${itemId}`);
        })
        .catch((err) => { console.log(err) });


})

// Delete a play
router.get('/play/delete/:id', checkAuthentication, (req, res) => {
    Item
        .deleteOne({ _id: req.params.id })
        .then((item) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err)
        });
})

// Render "Edit a play" page
router.get('/play/edit/:id', checkAuthentication, (req, res) => {
    Item
        .findOne({ _id: req.params.id })
        .then((item) => {
            res.render('edit-theater', item);
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/theater/details/:id');
        })
})

// POST requests
// Create theater request
router.post('/theater/create', checkAuthentication, itemValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('create-theater', {
            message: errors.array()[0].msg,
        })
    }
    const { title, description, imageUrl, isPublic } = req.body;
    const { _id } = req.user;
    const createdAt = new Date().toLocaleDateString();
    const item = new Item({
        title,
        description,
        imageUrl,
        isPublic: isPublic == 'on' ? true : false,
        createdAt,
        creator: _id,
    });
    item
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
    Item.updateOne(
        { _id: req.params.id },
        {
            $set: { 
                title,
                description,
                imageUrl,
                isPublic: isPublic == 'on' ? true : false
         } }
    )
        .then((updatedItem) => {
            console.log(updatedItem);
            res.redirect('/');
        })
})


module.exports = router;