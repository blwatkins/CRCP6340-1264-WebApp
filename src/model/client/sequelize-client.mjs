/*
 * Copyright (c) 2026 Brittni Watkins.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Sequelize } from 'sequelize';

import { ErrorUtility } from '../../../src-shared/error-utility.mjs';
import { NumberUtility } from '../../../src-shared/number-utility.mjs';
import { StringUtility } from '../../../src-shared/string-utility.mjs';

export class SequelizeClient {
    /**
     * @throws {Error} - SequelizeClient is a static class and cannot be instantiated.
     */
    constructor() {
        throw new Error('SequelizeClient is a static class and cannot be instantiated.');
    }

    /**
     * @returns {string}
     */
    static get appConfigErrorMessage() {
        return 'Invalid app configuration for SequelizeClient. '
            + 'Please ensure all required environment variables are present and valid.';
    }

    /**
     * @returns {string}
     */
    static get sequelizeNotDefinedErrorMessage() {
        return 'SequelizeClient sequelize is not defined.';
    }

    /**
     * @returns {Promise<void>}
     * @throws {Error} If sequelize authentication fails.
     */
    static async init() {
        if (!SequelizeClient.sequelize) {
            console.error(SequelizeClient.sequelizeNotDefinedErrorMessage);
            return;
        }

        try {
            await sequelize.authenticate();
        } catch (error) {
            console.error(ErrorUtility.buildErrorMessage('SequelizeClient Initialization Error', error));
        }
    }

    /**
     * @return {Sequelize}
     */
    static get sequelize() {
        return sequelize;
    }

    /**
     * @returns {boolean}
     */
    static hasValidConfiguration() {
        const stringVars = [
            process.env.MYSQL_HOST,
            process.env.MYSQL_USERNAME,
            process.env.MYSQL_DATABASE,
            process.env.MYSQL_PASSWORD
        ];

        const intVars = [
            Number.parseInt(process.env.MYSQL_PORT, 10)
        ];

        let isValid = true;

        for (const stringVar of stringVars) {
            if (!StringUtility.isNonEmptyString(stringVar)) {
                isValid = false;
                break;
            }
        }

        for (const intVar of intVars) {
            if (!NumberUtility.isPositiveInteger(intVar)) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    static buildSequelizeConfig() {
        try {
            return {
                dialect: 'mysql',
                logging: console.debug,
                host: process.env.MYSQL_HOST,
                port: Number.parseInt(process.env.MYSQL_PORT, 10),
                username: process.env.MYSQL_USERNAME,
                database: process.env.MYSQL_DATABASE,
                password: process.env.MYSQL_PASSWORD
            };
        } catch {
            return undefined;
        }
    }
}

/**
 * @type {Sequelize}
 */
let sequelize;

if (SequelizeClient.hasValidConfiguration()) {
    const sequelizeConfig = SequelizeClient.buildSequelizeConfig();

    if (sequelizeConfig) {
        sequelize = new Sequelize(sequelizeConfig);
    }
}

if (!sequelize) {
    console.error(SequelizeClient.appConfigErrorMessage);
}
