const Item = require('../models/item');

const getAllItems = async (callback) => {
    const item = await Item.find().lean();
    return item;
}

const sortByLikes = async () => {
    const items = await getAllItems();
    return items
        .filter(x => x.isPublic === true)
        .sort((a, b) => a.usersLiked.length - b.usersLiked.length);
}

const sortByDate = async () => {
    const items = await getAllItems();
    return items
        .filter(x => x.isPublic === true)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


module.exports = {
    getAllItems,
    sortByLikes,
    sortByDate
}