const Sequelize = require('sequelize'),
    { dbConfig } = require('../config');

const db = new Sequelize(dbConfig);

exports.db = db;
module.exports = db;