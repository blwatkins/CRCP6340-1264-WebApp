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

import path from 'path';

import { fileURLToPath } from 'url';

export class Constants {
    /**
     * @type {string}
     */
    static #publicDir;

    /**
     * @type {boolean}
     */
    static #requestLoggingEnabled;

    static {
        Constants.#setPublicDir();
        Constants.#setRequestLoggingEnabled();
    }

    /**
     * @returns {number}
     */
    static get millisPerSecond() {
        return 1_000;
    }

    /**
     * @returns {number}
     */
    static get secondsPerMinute() {
        return 60;
    }

    /**
     * @returns {number}
     */
    static get port() {
        return 3000;
    }

    /**
     * @returns {string}
     */
    static get publicDir() {
        return Constants.#publicDir;
    }

    /**
     * @returns {boolean}
     */
    static get requestLoggingEnabled() {
        return Constants.#requestLoggingEnabled;
    }

    /**
     * @returns {number}
     */
    static get requestsLimit() {
        return 100;
    }

    /**
     * @returns {void}
     */
    static #setPublicDir() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        Constants.#publicDir = path.join(__dirname, '../../public');
    }

    /**
     * @returns {void}
     */
    static #setRequestLoggingEnabled() {
        Constants.#requestLoggingEnabled = process.env.REQUEST_LOGGING_ENABLED === 'true';
    }
}
