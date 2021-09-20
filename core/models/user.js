const db = require('../db'),
    Sequelize = require('sequelize');

class User extends Sequelize.Model {}

User.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(254),
        allowNull: false,   
    },
    phoneNumber: {
        type: Sequelize.STRING(15),
        allowNull: true
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