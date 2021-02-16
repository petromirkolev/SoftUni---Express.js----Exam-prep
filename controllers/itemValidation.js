const { body } = require('express-validator');

module.exports = [
    body('title', 'The title should not be empty')
        .isLength({
            min: 1
        }),
    body('description', 'The description should not be empty')
        .isLength({
            min: 1
        }),
    body('imageUrl', 'The image URL should not be empty')
        .isLength({
            min: 1
        })
]