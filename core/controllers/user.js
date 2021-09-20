const cacheManager = require('../cache'),
    { User } = require('../models/user'),
    crs = require('crypto-random-string');

class UserController {
    static async get({ id }) {
        const cachedData = await cacheManager.get({ space: 'user', key: `${id}` });
        if (cachedData) return cachedData;

        let where = {};
        if (id) where.id = id;

        let user = await User.findOne({where});
        if (user) {
            user = user.get({ plain: true });
            await cacheManager.set({space: 'user', key: `${id}`}, user);
        }
        return user;
    }

    static async create (data) {
        data.id = crs({ type: 'url-safe', length: 10 });
        const user = await User.create(data);
        await cacheManager.del({ space: 'user', key: '*' });
        return await this.get({ id: user.id });
    }
}

exports.UserController = UserController;