const { Sequelize, Op } = require('sequelize');
const cacheManager = require('../cache'),
    { MedicalProfile, Metric } = require('../models/medical'),
    crs = require('crypto-random-string');

class MedicalProfileController {
    static async get ({ id, userId }) {
        const key = { space: 'medicalProfile', key: `${id}+${userId}` };
        const cache = await cacheManager.get(key);
        if (cache) return cache;

        let where = {};
        if (id) where.id = id;
        else if (userId) where.userId = userId;

        let medicalProfile = await MedicalProfile.findOne({ where });
        if (medicalProfile) {
            medicalProfile = medicalProfile.get({ plain: true });
            await cacheManager.set(key);
        }
        return medicalProfile;
    }

    static async upsert (data) {
        if (!data.id) throw new Error('No id specified');
        const exists = Boolean(await this.get({ id: data.id }));
        if (!exists) throw new Error('The specified MedicalProfile doesnt exists');
        if (data.user) data.userId = data.user.id;
        await MedicalProfile.upsert(data);
        await cacheManager.del({ space: 'medicalProfile', key: '*' });
        return await this.get({ id: data.id })
    }

    static async create (data) {
        if (!data.userId) throw new Error('No user specified');
        data.id = crs({ type: 'url-safe', length: 10 });
        const medicalProfileExists = await this.get({ userId: data.userId });
        if (medicalProfileExists) throw new Error('There are already a medical profile for this user');
        await MedicalProfile.create(data);
        await cacheManager.del({ space: 'medicalProfile', key: '*' });
        return await this.get({ id: data.id });
    }

    static async update (data) {
        if (!data.id) throw new Error('No id specified');
        const exists = Boolean(await this.get({ id: data.id }));
        if (!exists) throw new Error('The specified MedicalProfile doesnt exists');
        if (data.user) data.userId = data.user.id;
        await MedicalProfile.update(data, { where: { id: data.id } });
        await cacheManager.del({ space: 'medicalProfile', key: '*' });
        return await this.get({ id: data.id });
    }
}

class MetricController {
    /**
     * 
     * @param {Object} param0
     * @param {String} param0.id
     * @param {String} param0.userId
     * @param {String} param0.timeType - latest / further
     * @returns {}
     */
    static async get ({ id, userId, asc= false }) {
        const key = { space: 'metric', key: `${id}+${userId}+${asc}` },
            cache = await cacheManager.get(key);
        if (cache) return cache;
        
        let where = {}, order = [];
        if (id) where.id = id;
        if (userId || asc) {
            if (!userId) throw new Error('No user specified');
            where.userId = userId;
            order.push(['measurementDate', asc ? 'ASC' : 'DESC']);
        }

        let metric = await Metric.findOne({ where, order });
        if (metric) {
            metric = metric.get({ plain: true });
            await cacheManager.set(key, metric);
        }
        return metric;
    }

    static async create (data) {
        data.id = crs({ type: 'url-safe', length: 16 });
        await Metric.create(data);
        await cacheManager.del({ space: 'metric', key: '*' });
        return await this.get({ id: data.id });
    }

    static async statistics ({ type, startDate, endDate, userId }, options) {
        let results = await Metric.findAll({ where: {
            type, userId, measurementDate: {[Op.between]: [startDate, endDate]}
        }, order: [['measurementDate', options.asc ? 'DESC' : 'ASC']]});
        results = results.map(r => r.get({ plain: true }));
        return results;
    }
}

module.exports = { MedicalProfileController, MetricController };