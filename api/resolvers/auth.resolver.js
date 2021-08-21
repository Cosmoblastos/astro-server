const { AuthController } = require('../../core/controllers/auth');
module.exports = {
    Mutation: {
        login: async (_, { email, password }) => {
            try {
                if (!email) throw new Error('No email specified');
                if (!password) throw new Error('No password specified');
                return await AuthController.login(email, password);
            } catch (error) {
                return { error };
            }
        },
        signUp: async (_, { data }) => {
            try {
                return await AuthController.signUp(data);
            } catch (error) {
                return { error }
            }
        },
    }
};