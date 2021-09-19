const db = require('../db'),
    Sequelize = require('sequelize'),
    crs = require('crypto-random-string'),
    user = require('./user');

class Auth extends Sequelize.Model {}

Auth.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
}, {
    sequelize: db,
    timestamps: true,
    paranoid: true,
    defaultScope: {
        include: [
            {
                model: user.User,
                as: 'user'
            }
        ]
    }
});

Auth.belongsTo(user.User, {
    as: 'user',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userId',
        allowNull: false,
    }
});

exports.Auth = Auth;

class AuthEmailPassword extends Sequelize.Model {}

AuthEmailPassword.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    },
    password: {
        type: Sequelize.STRING(256),
        allowNull: false
    }
}, {
    sequelize: db,
    timestamps: true,
    paranoid: true
});

AuthEmailPassword.belongsTo(Auth, {
    as: 'auth',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'authId',
        allowNull: false,
    }
});

exports.AuthEmailPassword = AuthEmailPassword;

exports.sync = async (opt = { alter: true }) => {
    await Auth.sync(opt);
    console.log('Auth synced');
    await AuthEmailPassword.sync(opt);
    console.log('AuthEmailPassword synced');
};