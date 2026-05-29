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

import { NumberUtility } from '../../src-shared/number-utility.mjs';
import { StringUtility } from '../../src-shared/string-utility.mjs';

import { Project } from '../model/project.mjs';

export class ProjectHandler {
    /**
     * @returns {{id: number, title: string, description: string|null|undefined, imageUrl: string, isActive: boolean}[]}
     */
    static async getProjects() {
        return await Project.getAllProjects();
    }

    /**
     * @returns {number[]}
     */
    static async getProjectIds(sort = false) {
        const ids = (await ProjectHandler.getProjects()).map(project => project.id);

        if (sort) {
            ids.sort((a, b) => a - b);
        }

        return ids;
    }

    /**
     * @param {number} id
     * @returns {{id: number, title: string, description: string|null|undefined, imageUrl: string, isActive: boolean}|undefined}
     */
    static async getProject(id) {
        if (!NumberUtility.isPositiveInteger(id)) {
            return undefined;
        }

        return (await ProjectHandler.getProjects()).find(project => project.id === id);
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

        if (project.description) {
            if (!StringUtility.isNonEmptyString(project.description)) {
                return false;
            }
        }

        return (typeof project.isActive === 'boolean');
    }
}
