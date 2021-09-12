const { AuthController } = require('../../core/controllers/auth');
module.exports = {
    Query: {
        async refresh (_, { refreshToken }) {
            return await AuthController.refresh(refreshToken);
        },
        async initialize (_, { token }) {
            if (!token) throw new Error('No token specified');
            return await AuthController.initialize(token);
        }
    },
    Mutation: {
        async login (_, { email, password }) {
            if (!email) throw new Error('No email specified');
            if (!password) throw new Error('No password specified');
            return await AuthController.login(email, password);
        },
        async signUp (_, { data }) {
            try {
                return await AuthController.signUp(data);
            } catch (error) {
                return { error }
            }
        },
    }
};