const cacheManager = require('../cache'),
    { Questionnaire, Question, Option } = require('../models/questionnaire'),
    crs = require('crypto-random-string');

class QuestionnaireController  {
    static async get ({ id }) {
        try {
            const cachedData = await cacheManager.get({ space: 'questionnaire', key: `${id}` });
            if (cachedData) return cachedData;

            let where = {};
            if (id) where.id = id;

            let questionnaire = await Questionnaire.findOne({ where, plain: true });
            if (questionnaire) await cacheManager.set({space: 'questionnaire', key: `${id}`}, questionnaire);
            return questionnaire;
        } catch (error) {
            console.error(error);
        }
    }

    static async getFull ({ id }) {
        try {
            const cachedData = await cacheManager.get({ space: 'questionnaire', key: `full-${id}` });
            if (cachedData) return cachedData;

            let where = {};
            if (id) where.id = id;

            let questionnaire = await Questionnaire.findOne({ where });
            if (questionnaire) questionnaire = questionnaire.get({ plain: true });
            if (!questionnaire.id) throw new Error('There are no records in questionnaires for this query');
            const questions = await Question.findAll({ where: { questionnaireId: questionnaire.id } });
            const questionsAndOptions = [];
            for (let question of questions) {
                question = question.get({ plain: true });
                let options = await Option.findAll({ where: { questionId: question.id } });
                options = options.map(opt => opt.get({ plain: true }));
                questionsAndOptions.push({ ...question, options });
            }
            questionnaire.questions = questionsAndOptions;
            await cacheManager.set({ space: 'questionnaire', key: `full-${id}` });
            return questionnaire;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (data) {
        try {
            data.id = crs({ type: 'url-safe', length: 10 });
            const questionnaire = await Questionnaire.create(data);
            await cacheManager.del({space: 'questionnaire', key: '*'});
            return this.get({ id: questionnaire.id });
        } catch (error) {
            console.error(error);
        }
    }

    static async spread (data) {
        try {
            const questionnaire = await this.create(data);
            if (data.questions) if (data.questions.length > 0) {
                for (let question of data.questions) {
                    await QuestionController.spread({
                        questionnaireId: questionnaire.id,
                        ...question
                    });
                }
            }
            return questionnaire;
        } catch (error) {
            console.error(error);
        }
    }
}

class QuestionController {
    static async get ({ id }) {
        try {
            const cachedData = await cacheManager.get({ space: 'question', key: `${id}` });
            if (cachedData) return cachedData;

            let where = {};
            if (id) where.id = id;

            let question = await Question.findOne({ where, plain: true });
            if (question) await cacheManager.set({space: 'question', key: `${id}`}, question);
            return question;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (data) {
        try {
            data.id = crs({ type: 'url-safe', length: 10 });
            const question = await Question.create(data);
            await cacheManager.del({ space: 'question', key: 'id' });
            return question;
        } catch (error) {
            console.error(error);
        }
    }

    static async spread (data) {
        try {
            const question = await this.create(data);
            if (data.options) if (data.options.length) {
                for (const option of data.options) {
                    await OptionController.create({ questionId: question.id, ...option });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

class OptionController {
    static async get ({ id }) {
        try {
            const cachedData = await cacheManager.get({ space: 'option', key: `${id}` });
            if (cachedData) return cachedData;

            let where = {};
            if (id) where.id = id;

            let option = await Option.findOne({ where, plain: true });
            if (option) await cacheManager.set({space: 'option', key: `${id}`}, option);
            return option;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (data) {
        try {
            data.id = crs({ type: 'url-safe', length: 10 });
            const option = await Option.create(data);
            await cacheManager.del({ space: 'option', key: '*' });
            return option;
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = {
    QuestionnaireController,
    QuestionController,
    OptionController
};