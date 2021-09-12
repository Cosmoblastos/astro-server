const cacheManager = require('../cache'),
    { Auth, AuthEmailPassword } = require('../models/auth'),
    Token = require('../token'),
    { UserController } = require('./user'),
    bcrypt = require('bcrypt');

class AuthEmailPasswordController {
    static async get ({ id, authId }) {
        try {
            const cachedData = await cacheManager.get({ space: 'auth', key: `${id}+${authId}` });
            if (cachedData) return cachedData;

            let where = {};
            if (id) where.id = id;
            else if (authId) where.authId = authId;

            let authEmailPassword = await AuthEmailPassword.findOne({where});
            if (authEmailPassword) {
                authEmailPassword = authEmailPassword.get({ plain: true });
                await cacheManager.set({space: 'auth', key: `${id}+${authId}`}, authEmailPassword);
            }
            return authEmailPassword;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (data) {
        try {
            if (!data.password) throw new Error('No password specified');
            if (data.auth) data.authId = data.auth.id;
            data.password = bcrypt.hashSync(data.password, 10);
            await AuthEmailPassword.create(data);
        } catch (error) {
            console.log(error);
        }
    }
}

class AuthController {
    static async get({ id, email }) {
        const cachedData = await cacheManager.get({ space: 'auth', key: `${id}+${email}` });
        if (cachedData) return cachedData;

        let where = {};
        if (id) where.id = id;
        else if (email) where.email = email;

        let auth = await Auth.findOne({where});
        if (auth) {
            auth.get({ plain: true });
            await cacheManager.set({space: 'auth', key: `${id}+${email}`}, auth);
        }
        return auth;
    }

    static async create (data) {
        if (!data.email) throw new Error('No email specified');
        if (data.user) data.userId = data.user.id;
        const emailExists = await this.get({email: data.email});
        if (emailExists) throw new Error('The specified email already exists');
        const auth = await Auth.create(data);
        await cacheManager.del({space: 'auth', key: '*'});
        return this.get({ id: auth.id });
    }

    static async createTokens(userId) {
        let token = await Token.create(userId, 'auth');
        let refreshToken = await Token.create(userId, 'refresh');
        return { token, refreshToken };
    }

    static async signUp(data) {
        if (!data.email) throw new Error('No email specified');
        const userExists = Boolean(await this.get({ email: data.email }));
        if (userExists) throw new Error('A user with this email already exists');

        //TODO: implementar transacciones
        const user = await UserController.create(data);
        if (!user) throw new Error('Error while creating user object');

        const auth = await this.create({ user, email: data.email });
        if (!auth) throw new Error('Error while creating auth object');

        await AuthEmailPasswordController.create({ auth, password: data.password });
        const tokens = await this.createTokens(user.id);
        return { user, tokens };
    }

    static async login (email, password) {
        const auth = await this.get({ email });
        if (!auth) throw new Error('Invalid email or password');

        const authPassword = await AuthEmailPasswordController.get({ authId: auth.id });
        if (!authPassword) throw new Error('The user doesn\'t has a defined password');

        const isSamePassword = bcrypt.compareSync(password, authPassword.password);
        if (!isSamePassword) throw new Error('Invalid email or password');

        const tokens = await this.createTokens(auth.user.id);
        return { user: auth.user, tokens };
    }

    static async refresh(refreshToken) {
        const verifyResult = await Token.refresh(refreshToken);
        if (!verifyResult?.token) throw new Error('Invalid refresh token');
        const user = await UserController.get({ id: verifyResult.data.userId });
        if (!user) return;
        return { user, token: verifyResult.token };
    }

    static async initialize (token) {
        const verifyResult = await Token.refresh(token);
        if (!verifyResult?.token) throw new Error('Invalid token');
        const user = await UserController.get({ id: verifyResult.data.userId });
        if (!user) return;
        return { user };
    }
}

module.exports = { AuthController, AuthEmailPasswordController };