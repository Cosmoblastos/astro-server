const JWT = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const express = require('express');

const TokenExpireTimeDict = {
    'auth': '7d',
    'refresh': '7d',
    '': 0,
};

class Token {
    constructor (userId, type) {
        this.userId = userId;
        this.type = type;
    }

    /**
     * @param {express.Request} req
     * @return {Token | null | undefined}
     * */
    static validate (req) {
        const tokenHeader = String(req.headers['authorization']);
        // if authorization token doesn't exists, don't authorize the request
        if (!tokenHeader) return null;
        // getting token from string
        const token = tokenHeader.split(' ')[1];
        // if authorization token doesn't exists, don't authorize the request
        if (!token) return null;

        return JWT.verify(token, jwtConfig.secret);
    }

    /**
    * This method generates a token with the ID of the authenticated user.
    * @param {String} userId - the system generated ID to identify this token.
    * @param {String} type - tipo de contenido.
    * @returns {Promise<String>} the generated json web token.
    */
    static async create (userId, type) {
        return await new Promise((resolve, reject) => {
            JWT.sign(
                { userId, type },
                jwtConfig.secret,
                {expiresIn: TokenExpireTimeDict[type]},
                (err, encoded) => {
                    if (err) reject(err);
                    resolve(encoded);
                }
            )
        })
    }

    static async refresh (refreshToken) {
        const data = JWT.verify(refreshToken, jwtConfig.secret);
        if (data?.type !== 'refresh') throw {
            status: 401,
            error: 'the refresh token is invalid'
        }
        const token = await this.create(data?.userId, 'auth');
        return { token, data };
    }

    static validateSession (token) {
        if (token)
            if (token.userId) return true;
        throw new Error('No session');
    }
}

module.exports = Token;