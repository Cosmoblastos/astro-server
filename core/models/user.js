const db = require('../db'),
    Sequelize = require('sequelize'),
    crs = require('crypto-random-string');

class User extends Sequelize.Model {}

User.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    },
    firstName: {
        type: Sequelize.STRING(40),
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING(40),
        allowNull: false,
    },
    fullName: {
        type: Sequelize.VIRTUAL,
        get () {
            return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`;
        }
    },
    phoneNumber: {
        type: Sequelize.STRING(15),
        allowNull: true
    }
}, {
    sequelize: db,
    timestamps: true,
    paranoid: true,
});

exports.User = User;

exports.sync = async (opt = { alter: true }) => {
    await User.sync(opt);
    console.log('User synced');
};