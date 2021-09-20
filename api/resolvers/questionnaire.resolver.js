const {
    QuestionnaireController,
    UserQuestionnaireController,
} = require('../../core/controllers/questionnaire'),
    Token = require('../../core/token');

module.exports = {
    Query: {
        async questionnaire (_, { id }, { token }) {
            Token.validateSession(token);
            return await QuestionnaireController.get({ id });
        },
        async questionnaires (_, {}, { token }) {
            Token.validateSession(token);
            return await QuestionnaireController.list();
        },
        async fullQuestionnaire (_, { id }, { token }) {
            if (!id) return;
            Token.validateSession(token);
            return await QuestionnaireController.getFull({ id });
        },
        async userQuestionnaire (_, { id }, { token }) {
            Token.validateSession(token);
            return await UserQuestionnaireController.get({ id });
        },
        async fullUserQuestionnaire (_, { id }, { token }) {
            Token.validateSession(token);
            return await UserQuestionnaireController.getFull({ id });
        },
    },
    Mutation: {
        async spreadQuestionnaire (_, { data }, { token }) {
            Token.validateSession(token);
            return await QuestionnaireController.spread(data);
        },
        async spreadUserQuestionnaire (_, { data }, { token }) {
            Token.validateSession(token);
            return await UserQuestionnaireController.spread(data);
        }
    }
};