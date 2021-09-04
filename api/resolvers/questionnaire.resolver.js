const { QuestionnaireController } = require('../../core/controllers/questionnaire');
module.exports = {
    Query: {
        questionnaire: async (_, { id }) => {
            try {
                if (!id) return;
                return await QuestionnaireController.get({ id });
            } catch (error) {
                return { error };
            }
        },
        fullQuestionnaire: async (_, { id }) => {
            try {
                if (!id) return;
                return await QuestionnaireController.getFull({ id });
            } catch (error) {
                return { error };
            }
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