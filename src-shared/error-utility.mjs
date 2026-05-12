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

import { StringUtility } from './string-utility.mjs';

export class ErrorUtility {
    /**
     * @throws {Error} - ErrorUtility is a static class and cannot be instantiated.
     */
    constructor() {
        throw new Error('ErrorUtility is a static class and cannot be instantiated.');
    }

    /**
     * Builds a comprehensive error message by combining a custom message with details from an error object or string.
     * @param {string|null|undefined} message
     * @param {Error|string|null|undefined} error
     * @return {string}
     */
    static buildErrorMessage(message, error) {
        const parts = [];

        if (StringUtility.isNonEmptyString(message)) {
            parts.push(message);
        }

        if (error instanceof Error && StringUtility.isNonEmptyString(error.message)) {
            parts.push(error.message);
        } else if (StringUtility.isNonEmptyString(error)) {
            parts.push(error);
        }

        if (parts.length > 0) {
            return parts.join(': ');
        }

        return 'Error.';
    }
}
