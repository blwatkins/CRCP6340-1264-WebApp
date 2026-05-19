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

const loremIpsumPlaceholder = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin convallis gravida nibh. Sed tincidunt sapien sit amet id.';

export class ProjectHandler {
    /**
     * @type {{id: number, title: string, description: string, bgColor: string}[]}
     */
    static #projects = [
        {
            id: 1,
            title: 'Project 1',
            description: loremIpsumPlaceholder,
            bgColor: '#65AA17'
        },
        {
            id: 2,
            title: 'Project 2',
            description: loremIpsumPlaceholder,
            bgColor: '#72C5AB'
        },
        {
            id: 4,
            title: 'Project 4',
            description: loremIpsumPlaceholder,
            bgColor: '#DA9DCF'
        }
    ];

    /**
     * @returns {{id: number, title: string, description: string, bgColor: string}[]}
     */
    static getProjects() {
        return ProjectHandler.#projects.filter(project => ProjectHandler.isValidProject(project));
    }

    /**
     * @return {number[]}
     */
    static getProjectIds(sort = false) {
        const ids = ProjectHandler.getProjects().map(project => project.id);

        if (sort) {
            ids.sort((a, b) => a - b);
        }

        return ids;
    }

    /**
     * @param {number} id
     * @returns {{id: number, title: string, description: string, bgColor: string}|undefined}
     */
    static getProject(id) {
        if (!NumberUtility.isPositiveInteger(id)) {
            return undefined;
        }

        return ProjectHandler.getProjects().find(project => project.id === id);
    }

    /**
     * @param {unknown} project
     * @return {boolean}
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

        if (!StringUtility.isNonEmptyString(project.description)) {
            return false;
        }

        return StringUtility.isHexColorString(project.bgColor);
    }
}
