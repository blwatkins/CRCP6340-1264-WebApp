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

import { describe, test, assert, expect } from 'vitest';

import { ErrorUtility } from '../../src-shared/error-utility.mjs';

describe('ErrorUtility', () => {
    /**
     * @type {string}
     */
    const errorObjectMessage = 'Error from Error object'

    /**
     * @type {string}
     */
    const stringMessage = 'Error from string'

    /**
     * @type {string}
     */
    const messagePrefix = 'Error message prefix'

    /**
     * @param {unknown} input
     */
    function throwMe(input) {
        throw input;
    }

    describe('new ErrorUtility()', () => {
        test('Constructor should throw an error', () => {
            expect(() => new ErrorUtility()).toThrow(
                new Error('ErrorUtility is a static class and cannot be instantiated.')
            );
        });
    });

    describe('buildErrorMessage', () => {
        test.each([
            { message: null, toThrow: null, expected: 'Error.'},
            { message: undefined, toThrow: undefined, expected: 'Error.'},
            { message: 0, toThrow: 0, expected: 'Error.'},
            { message: 5, toThrow: 5, expected: 'Error.'},
            { message: () => true, toThrow: () => true, expected: 'Error.'},
            { message: {}, toThrow: {}, expected: 'Error.'},
            { message: '', toThrow: '', expected: 'Error.'},

            { message: null, toThrow: stringMessage, expected: stringMessage},
            { message: undefined, toThrow: stringMessage, expected: stringMessage},
            { message: 5, toThrow: stringMessage, expected: stringMessage},
            { message: () => true, toThrow: stringMessage, expected: stringMessage},
            { message: {}, toThrow: stringMessage, expected: stringMessage},
            { message: '', toThrow: stringMessage, expected: stringMessage},

            { message: null, toThrow: new Error(errorObjectMessage), expected: errorObjectMessage},
            { message: undefined, toThrow: new Error(errorObjectMessage), expected: errorObjectMessage},
            { message: 5, toThrow: new Error(errorObjectMessage), expected: errorObjectMessage},
            { message: () => true, toThrow: new Error(errorObjectMessage), expected: errorObjectMessage},
            { message: {}, toThrow: new Error(errorObjectMessage), expected: errorObjectMessage},
            { message: '', toThrow: new Error(errorObjectMessage), expected: errorObjectMessage},

            { message: messagePrefix, toThrow: null, expected: messagePrefix},
            { message: messagePrefix, toThrow: undefined, expected: messagePrefix},
            { message: messagePrefix, toThrow: 5, expected: messagePrefix},
            { message: messagePrefix, toThrow: () => true, expected: messagePrefix},
            { message: messagePrefix, toThrow: {}, expected: messagePrefix},
            { message: messagePrefix, toThrow: '', expected: messagePrefix},

            { message: messagePrefix, toThrow: stringMessage, expected: `${messagePrefix}: ${stringMessage}`},
            { message: messagePrefix, toThrow: new Error(errorObjectMessage), expected: `${messagePrefix}: ${errorObjectMessage}`},
            { message: messagePrefix, toThrow: new Error(''), expected: messagePrefix },

            { message: null, toThrow: new Error(''), expected: 'Error.'},
            { message: undefined, toThrow: new Error(''), expected: 'Error.'},
            { message: '', toThrow: new Error(''), expected: 'Error.'},
        ])('buildErrorMessage { message: $message, toThrow: $toThrow, expected: $expected }', ({ message, toThrow, expected }) => {
            try {
                throwMe(toThrow);
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                expect(ErrorUtility.buildErrorMessage(message, error)).toBe(expected);
            }
        });
    });
});
