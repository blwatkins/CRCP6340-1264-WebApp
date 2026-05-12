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

export class StringUtility {
    /**
     * @type {RegExp}
     */
    static #hexColorPattern = /^#[A-Fa-f0-9]{6}$/;

    // TODO - test cases - 'something           else'
    /**
     * @type {RegExp}
     */
    static #singleLineTrimmedPattern = /^(?!\s)(?!.*\s$)[^\t\r\n]+$/;

    /**
     * @throws {Error} - StringUtility is a static class and cannot be instantiated.
     */
    constructor() {
        throw new Error('StringUtility is a static class and cannot be instantiated.');
    }

    /**
     * @returns {RegExp}
     */
    static get hexColorPattern() {
        return StringUtility.#hexColorPattern;
    }

    /**
     * @returns {RegExp}
     */
    static get singleLineTrimmedPattern() {
        return StringUtility.#singleLineTrimmedPattern;
    }

    /**
     * @param {unknown} input
     * @returns {boolean}
     */
    static isHexColorString(input) {
        return (typeof input === 'string') && StringUtility.hexColorPattern.test(input);
    }

    static isNonEmptyString(input) {
        return (typeof input === 'string') && (input.trim().length > 0);
    }

    static trimString(input) {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string.');
        }

        return input.trim();
    }

    /**
     * @param {unknown} input
     * @returns {boolean}
     */
    static isSingleLineTrimmedString(input) {
        return (typeof input === 'string') && StringUtility.singleLineTrimmedPattern.test(input);
    }
}
