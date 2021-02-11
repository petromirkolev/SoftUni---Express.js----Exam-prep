module.exports = {
    development: {
        port: process.env.PORT || 3000,
        privateKey: 'schhhhwepps',
        cookie: 'x-auth-token',
        databaseUrl: 'mongodb://localhost:27017/theatersworkshop'
    },
    production: {}
};