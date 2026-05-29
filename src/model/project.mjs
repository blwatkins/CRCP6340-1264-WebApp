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

import { DataTypes, Model } from 'sequelize';

import { NumberUtility } from '../../src-shared/number-utility.mjs';
import { StringUtility } from '../../src-shared/string-utility.mjs';

import { SequelizeClient } from './client/sequelize-client.mjs';

const sequelize = SequelizeClient.sequelize;

class ProjectModel extends Model {}

if (sequelize) {
    ProjectModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            priceEth: {
                type: DataTypes.DECIMAL(10, 6),
                allowNull: false
            },
            openDatetime: {
                type: DataTypes.DATE,
                allowNull: false
            },
            royaltyPercent: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        { sequelize, modelName: 'project', createdAt: false, updatedAt: false }
    );
}

export class Project extends SequelizeClient {
    /**
     * @returns {Promise<{id: number, title: string, description: (string|null|undefined), imageUrl: string, isActive: boolean}[]>}
     */
    static async getAllProjects() {
        if (!Project.sequelize) {
            console.error(`Unable to perform query. ${Project.sequelizeNotDefinedErrorMessage}`);
            return [];
        }

        try {
            const results = await ProjectModel.findAll();

            return results.map(result => Project.#queryResultToProject(result))
                .filter(project => project !== undefined);
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    /**
     * @return {Promise<number[]>}
     */
    static async getIds() {
        if (!Project.sequelize) {
            console.error(`Unable to perform query. ${Project.sequelizeNotDefinedErrorMessage}`);
            return [];
        }

        try {
            const results = await ProjectModel.findAll({
                attributes: ['id']
            });

            return results.map(result => result.id);
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<{id: number, title: string, description: string|null|undefined, imageUrl: string, isActive: boolean}|undefined>}
     */
    static async getProjectById(id) {
        if (!Project.sequelize) {
            console.error(`Unable to perform query. ${Project.sequelizeNotDefinedErrorMessage}`);
            return undefined;
        }

        if (!NumberUtility.isPositiveInteger(id)) {
            return undefined;
        }

        try {
            const result = await ProjectModel.findByPk(id);
            return Project.#queryResultToProject(result);
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    /**
     * @param queryResult
     * @returns {{id: number, title: string, description: string|null|undefined, imageUrl: string, isActive: boolean}|undefined}
     */
    static #queryResultToProject(queryResult) {
        if (!queryResult) {
            return undefined;
        }

        const project = {
            id: queryResult.id,
            title: queryResult.title,
            description: queryResult.description,
            imageUrl: queryResult.imageUrl,
            isActive: queryResult.isActive
        };

        if (Project.isValidProject(project)) {
            return project;
        }

        return undefined;
    }

    /**
     * @param {unknown} project
     * @returns {boolean}
     */
    static isValidProject(project) {
        if (!project) {
            return false;
        }

        if (typeof project !== 'object') {
            return false;
        }

        if (!NumberUtility.isPositiveInteger(project.id)) {
            return false;
        }

        if (!StringUtility.isSingleLineTrimmedString(project.title)) {
            return false;
        }

        if (!StringUtility.isSingleLineTrimmedString(project.imageUrl)) {
            return false;
        }

        if (project.description !== null
            && project.description !== undefined
            && project.description !== ''
            && !StringUtility.isNonEmptyString(project.description)) {
            return false;
        }

        return (typeof project.isActive === 'boolean');
    }
}
