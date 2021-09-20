const { MedicalProfileController, MetricController } = require('../../core/controllers/medical'),
    Token = require('../../core/token');

module.exports = {
    Query: {
        async medicalProfile (_, { id, userId }, { token }) {
            Token.validateSession(token);
            return await MedicalProfileController.get({ id, userId });
        },
        async metric (_, { id, userId, asc }, { token }) {
            Token.validateSession(token);
            return await MetricController.get({  id, userId, asc });
        },
        async metricStatistics (_, { type, startDate, endDate, userId, options }, { token }) {
            Token.validateSession(token);
            return await MetricController.statistics({ type, startDate, endDate, userId }, options);
        }
    },
    Mutation: {
        async upsertMedicalProfile (_, { data }, { token }) {
            Token.validateSession(token);
            return await MedicalProfileController.upsert(data);
        },
        async createMetric (_, { data }, { token }) {
            Token.validateSession(token);
            return await MetricController.create(data);
        }
    }
};