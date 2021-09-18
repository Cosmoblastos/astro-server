const env = process.env.NODE_ENV || "development";

const jwtConfig = require('./jwt.json')[env],
    dbConfig = require('./db.json')[env],
    apiConfig = require('./api.json')[env],
    redisConfig = require('./redis.json')[env];

module.exports = { jwtConfig, dbConfig, apiConfig, redisConfig };