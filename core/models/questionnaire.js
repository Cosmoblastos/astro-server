const db = require('../db'),
    Sequelize = require('sequelize'),
    crs = require('crypto-random-string'),
    user = require('./user');

class Questionnaire extends Sequelize.Model {}

Questionnaire.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    },
    name: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
    //Puntuación para estatus de salud malo
    bad: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    recommendationBad: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    //Puntuación para estatus de salud medio
    medium: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    recommendationMedium: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    //Puntuación para estatus de salud bueno
    good: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    recommendationGood: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    //Cada cuanto se debe hacer este cuestionario? (en días) (0 para no periodicidad)
    periodicity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
}, {
    sequelize: db,
    paranoid: true,
    timestamps: true,
});

exports.Questionnaire = Questionnaire;

class Question extends Sequelize.Model {}

Question.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    },
    name: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
    auxInfo: {
        type: Sequelize.STRING(256),
        allowNull: true,
        defaultValue: ''
    },
    order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: db,
    paranoid: true,
    timestamps: true,
});

Question.belongsTo(Questionnaire, {
    as: 'questionnaire',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionnaireId',
        allowNull: false
    }
});

exports.Question = Question;

class Option extends Sequelize.Model {}

Option.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    },
    name: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
    punctuationType: {
        type: Sequelize.ENUM('bad', 'medium', 'good'),
        allowNull: false,
    },
    punctuation: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: db,
    paranoid: true,
    timestamps: true,
});

Option.belongsTo(Question, {
    as: 'question',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionId',
        allowNull: false
    }
});

exports.Option = Option;

class UserQuestionnaire extends Sequelize.Model {}

UserQuestionnaire.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    },
    punctuation: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    result: {
        type: Sequelize.ENUM('bad', 'medium', 'good'),
        allowNull: true
    }
}, {
    sequelize: db,
    timestamps: true,
});

UserQuestionnaire.belongsTo(user.User, {
    as: 'user',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});

UserQuestionnaire.belongsTo(Questionnaire, {
    as: 'questionnaire',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionnaireId',
        allowNull: false
    }
});

exports.UserQuestionnaire = UserQuestionnaire;

class UserQuestion extends Sequelize.Model {}

UserQuestion.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: crs({ type: 'url-safe', length: 10 })
    }
}, {
    sequelize: db,
    timestamps: true,
});

UserQuestion.belongsTo(UserQuestionnaire, {
    as: 'userQuestionnaire',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userQuestionnaireId',
        allowNull: false
    }
})

UserQuestion.belongsTo(Question, {
    as: 'question',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionId',
        allowNull: false
    }
})

UserQuestion.belongsTo(Option, {
    as: 'answer',
    foreignKey: {
        name: 'answerId',
        allowNull: false
    }
})

exports.UserQuestion = UserQuestion;

exports.sync = async (opt = { alter: true }) => {
    await Questionnaire.sync(opt);
    console.log('Questionnaire synced');
    await Question.sync(opt);
    console.log('Question synced');
    await Option.sync(opt);
    console.log('Option synced');
    await UserQuestionnaire.sync(opt);
    console.log('UserQuestionnaire synced');
    await UserQuestion.sync(opt);
    console.log('UserQuestion synced');
};