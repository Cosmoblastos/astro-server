const Redis = require('ioredis');

class CacheManager {
    constructor () {
        this.manager = new Redis();
    }

    parseKeyStructure (key) {
        return `${key.space}-${key.key}`;
    }

    async get (key) {
        const cachedData = String(await this.manager.get(this.parseKeyStructure(key)));
        if (!cachedData) return null;
        return JSON.parse(cachedData);
    }

    async set (key, value) {
        return await this.manager.set(this.parseKeyStructure(key), JSON.stringify(value));
    }

    async del (key) {
        const parsedKey = this.parseKeyStructure(key);
        const matchKeys = await this.manager.keys(parsedKey);
        const dataPipeline = this.manager.pipeline();
        matchKeys.forEach((key) => {
            dataPipeline.del(key);
        });
        await dataPipeline.exec();
        return true;
    }
}

const manager = new CacheManager();

module.exports = manager;