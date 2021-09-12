const { QuestionnaireController } = require('../../core/controllers/questionnaire'),
    Token = require('../../core/token');

module.exports = {
    Query: {
        questionnaire: async (_, { id }, { token }) => {
            Token.validateSession(token);
            return await QuestionnaireController.get({ id });
        },
        fullQuestionnaire: async (_, { id }, { token }) => {
            if (!id) return;
            Token.validateSession(token);
            return await QuestionnaireController.getFull({ id });
        }
    },
    Mutation: {
        spreadQuestionnaire: async (_, { input }) => {
            try {
               return await QuestionnaireController.spread(input);
            } catch (error) {
                return { error };
            }
        },
    }
};