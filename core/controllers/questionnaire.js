const { Op } = require('sequelize'),
    cacheManager = require('../cache'),
    {
        Questionnaire,
        Question,
        Option,
        UserQuestionnaire,
        UserQuestion
    } = require('../models/questionnaire'),
    crs = require('crypto-random-string');

class QuestionnaireController  {
    static async get ({ id }) {
        try {
            const cachedData = await cacheManager.get({ space: 'questionnaire', key: `${id}` });
            if (cachedData) return cachedData;

            let where = {};
            if (id) where.id = id;

            let questionnaire = await Questionnaire.findOne({ where });
            if (questionnaire) {
                questionnaire = questionnaire.get({ plain: true });
                await cacheManager.set({space: 'questionnaire', key: `${id}`}, questionnaire);
            }
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

    static async list () {
        const key = { space: 'questionnaire', key: 'list' };
        const cache = await cacheManager.get(key);
        if (cache) return cache;
        let data = await Questionnaire.findAll({ order: [['name', 'ASC']] });
        data = data.map(x => x.get({plain: true}));
        await cacheManager.set(key, data);
        return data;
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

class UserQuestionnaireController {
    static async get({ id, userId, questionnaireId }) {
        const key = { space: 'userQuestionnaire', key: `${id}+${userId}+${questionnaireId}` };
        const cache = await cacheManager.get(key);
        if (cache) return cache;

        let where = {};
        if (id) where.id = id;
        if (userId && questionnaireId) {
            where.userId = userId;
            where.questionnaireId = questionnaireId;
        }
        if (Object.keys(where).length === 0) throw new Error('No filter specified');

        let userQuestionnaire = await UserQuestionnaire.findOne({ where });
        if (userQuestionnaire) {
            userQuestionnaire = userQuestionnaire.get({ plain: true });
            await cacheManager.set(key, userQuestionnaire);
        }
        return userQuestionnaire;
    }

    static async getFull ({ id }) {
        const cachedData = await cacheManager.get({ space: 'userQuestionnaire', key: `full-${id}` });
        if (cachedData) return cachedData;

        let where = {};
        if (id) where.id = id;

        let userQuestionnaire = await UserQuestionnaire.findOne({ where });
        if (userQuestionnaire) userQuestionnaire = userQuestionnaire.get({ plain: true });
        if (!userQuestionnaire.id) throw new Error('There are no records in questionnaires for this query');
        let userQuestions = await UserQuestion.scope('answer').findAll({ where: { userQuestionnaireId: userQuestionnaire.id } });
        userQuestionnaire.userQuestions = userQuestions.map(q => q.get({ plain: true }));
        await cacheManager.set({ space: 'userQuestionnaire', key: `full-${id}` });
        return userQuestionnaire;
    }

    static async create (data) {
        data.id = crs({type: 'url-safe', length: 10});
        const exists = Boolean(await this.get({
            userId: data.userId,
            questionnaireId: data.questionnaireId
        }));
        if (exists) throw new Error('This user already have this questionnaire');
        await UserQuestionnaire.create(data);
        await cacheManager.del({ space: 'userQuestionnaire', key: '*' });
        return this.get({ id: data.id });
    }

    static async update (data) {
        const prev = await this.get({ id: data.id });
        if (!prev) throw new Error('Invalid id supplied to update method');
        await UserQuestionnaire.update(data, { where: { id: data.id } });
        await cacheManager.del({space: 'userQuestionnaire', key: '*' });
        return await this.get({ id: prev.id });
    }

    static async upsert (data) {
        const prev = await this.get({ userId: data.userId, questionnaireId: data.questionnaireId });
        if (prev) return await this.update(Object.assign({}, prev, data));
        return await this.create(data);
    }

    static isInRange (range, num) {
        return num >= range[0] && num <= range[1];
    }

    static async calculateProgress (questionnaireId, userQuestions) {
        const questionnaire = await QuestionnaireController.getFull({ id: questionnaireId });
        if (!questionnaire) throw new Error('Invalid questionnaire id');
        const result = { status: '', percentage: 0, punctuation: 0, result: '' };
        result.percentage = userQuestions.length * 100 / questionnaire.questions.length;
        result.status = result.percentage === 100 ? 'finished' : 'ongoing';
        result.punctuation = userQuestions.reduce((ac, c) => {
            return ac + parseInt(c.answer.punctuation)
        }, 0);
        result.result = this.isInRange(questionnaire.bad, result.punctuation)
                            ? 'bad'
                            : this.isInRange(questionnaire.medium, result.punctuation)
                                ? 'medium'
                                : 'good';
        return result;
    }

    static async spread (data) {
        const progress = await this.calculateProgress(data.questionnaireId, data.userQuestions);
        data = Object.assign(data, progress);
        const userQuestionnaire = await this.upsert(data);
        if (data.userQuestions) if (data.userQuestions.length > 0) {
            for (let userQuestion of data.userQuestions) {
                await UserQuestionController.upsert({
                    userQuestionnaireId: userQuestionnaire.id,
                    answerId: userQuestion.answer.optionId,
                    ...userQuestion
                });
            }
        }
        return userQuestionnaire;
    }
}

class UserQuestionController {
    static async get ({ id,  userQuestionnaireId, questionId }) {
        const key = { space: 'userQuestion', key: `${id}+${userQuestionnaireId}+${questionId}` };
        const cache = await cacheManager.get(key);
        if (cache) return cache;

        let where = {};
        if (id) where.id = id;
        if (userQuestionnaireId && questionId) {
            where.userQuestionnaireId = userQuestionnaireId;
            where.questionId = questionId;
        }

        let userQuestion = await UserQuestion.findOne({ where });
        if (userQuestion) {
            userQuestion = userQuestion.get({ plain: true });
            await cacheManager.set(key, userQuestion);
        }
        return userQuestion;
    }

    static async create (data) {
        data.id = crs({type: 'url-safe', length: 10});
        const result = await UserQuestion.create(data);
        await cacheManager.del({space: 'userQuestion', key: '*'});
        return result;
    }

    static async update (data) {
        const prev = await this.get({ id: data.id });
        if (!prev) throw new Error('Invalid id supplied to update method');
        const result = await UserQuestion.update(data, { where: { id: data.id } });
        await cacheManager.del({space: 'userQuestion', key: '*'});
        return result;
    }

    static async upsert (data) {
        const prev = await this.get({ userQuestionnaireId: data.userQuestionnaireId, questionId: data.questionId });
        if (prev) return await this.update(Object.assign({}, prev, data));
        return await this.create(data);
    }
}

module.exports = {
    QuestionnaireController,
    QuestionController,
    OptionController,
    UserQuestionnaireController,
    UserQuestionController
};