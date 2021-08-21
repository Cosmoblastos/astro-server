const { UserController } = require('../../core/controllers/user');

module.exports = {
    Query: {
        user: async (_, {id}) => await UserController.get({id}),
    }
}