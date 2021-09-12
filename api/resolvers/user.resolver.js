const { UserController } = require('../../core/controllers/user'),
    Token = require('../../core/token');

module.exports = {
    Query: {
        user: async (_, {id}, { token }) => {
            Token.validateSession(token);
            return await UserController.get({id})
        },
    }
}