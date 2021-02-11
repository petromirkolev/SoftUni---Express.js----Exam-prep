const Play = require('../models/play');

const getAllPlays = async (callback) => {
    const play = await Play.find().lean();
    return play;
}

const sortByLikes = async () => {
    const plays = await getAllPlays();
    return plays
        .filter(x => x.isPublic === true)
        .sort((a, b) => a.usersLiked.length - b.usersLiked.length);
}

const sortByDate = async () => {
    const plays = await getAllPlays();
    return plays
        .filter(x => x.isPublic === true)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


module.exports = {
    getAllPlays,
    sortByLikes,
    sortByDate
}