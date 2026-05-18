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

import { describe, test, expect } from 'vitest';

import { StringUtility } from '../../src-shared/string-utility.mjs';

describe('StringUtility', () => {
    describe('new StringUtility()', () => {
        test('Constructor should throw an error', () => {
            expect(() => new StringUtility()).toThrow(
                new Error('StringUtility is a static class and cannot be instantiated.')
            );
        });
    });

    describe('hexColorPattern', () => {
        test('Should expose a RegExp', () => {
            expect(StringUtility.hexColorPattern).toBeInstanceOf(RegExp);
        });
    });

    describe('singleLineTrimmedPattern', () => {
        test('Should expose a RegExp', () => {
            expect(StringUtility.singleLineTrimmedPattern).toBeInstanceOf(RegExp);
        });
    });

    describe('isHexColorString', () => {
        test.each([
            { input: '#A1B2C3', expected: true },
            { input: '#a1b2c3', expected: true },
            { input: '#ABCDEF', expected: true },
            { input: '#abcdef', expected: true },
            { input: '#aBcDeF', expected: true },
            { input: '#123456', expected: true },

            { input: 'A1B2C3', expected: false },
            { input: '#ABC', expected: false },
            { input: '#A1B2C3D4', expected: false },
            { input: '#ZZZZZZ', expected: false },
            { input: '#12 456', expected: false },
            { input: '#12\n456', expected: false },
            { input: '', expected: false },

            { input: null, expected: false },
            { input: undefined, expected: false },
            { input: 0, expected: false },
            { input: 5, expected: false },
            { input: {}, expected: false },
            { input: [], expected: false },
            { input: () => true, expected: false }
        ])('isHexColorString($input) should return $expected', ({ input, expected }) => {
            expect(StringUtility.isHexColorString(input)).toBe(expected);
        });
    });

    describe('isNonEmptyString', () => {
        test.each([
            { input: 'a', expected: true },
            { input: ' hello ', expected: true },
            { input: '\tX', expected: true },
            { input: 'X\n', expected: true },

            { input: '', expected: false },
            { input: '   ', expected: false },
            { input: '\t', expected: false },
            { input: '\n', expected: false },

            { input: null, expected: false },
            { input: undefined, expected: false },
            { input: 0, expected: false },
            { input: {}, expected: false },
            { input: [], expected: false },
            { input: () => true, expected: false }
        ])('isNonEmptyString($input) should return $expected', ({ input, expected }) => {
            expect(StringUtility.isNonEmptyString(input)).toBe(expected);
        });
    });

    describe('trimString', () => {
        test.each([
            { input: '', expected: '' },
            { input: 'abc', expected: 'abc' },
            { input: ' abc', expected: 'abc' },
            { input: 'abc ', expected: 'abc' },
            { input: '  abc  ', expected: 'abc' },
            { input: '\tabc\t', expected: 'abc' },
            { input: '\nabc\n', expected: 'abc' },
            { input: ' something     else ', expected: 'something     else' }
        ])('trimString($input) should return $expected', ({ input, expected }) => {
            expect(StringUtility.trimString(input)).toBe(expected);
        });

        test.each([null, undefined, 0, 5, {}, [], () => true])(
            'trimString(%o) should throw when input is not a string',
            (input) => {
                expect(() => StringUtility.trimString(input)).toThrow(
                    new Error('Input must be a string.')
                );
            }
        );
    });

    describe('isSingleLineTrimmedString', () => {
        test.each([
            { input: 'a', expected: true },
            { input: 'hello world', expected: true },
            { input: 'something     else', expected: true },
            { input: '#A1B2C3', expected: true },

            { input: '', expected: false },
            { input: ' leading', expected: false },
            { input: 'trailing ', expected: false },
            { input: '\tleading-tab', expected: false },
            { input: 'trailing-tab\t', expected: false },
            { input: '\nleading-line', expected: false },
            { input: 'trailing-line\n', expected: false },
            { input: 'line1\nline2', expected: false },
            { input: 'line1\rline2', expected: false },
            { input: 'line1\tline2', expected: false },

            { input: null, expected: false },
            { input: undefined, expected: false },
            { input: 0, expected: false },
            { input: 5, expected: false },
            { input: {}, expected: false },
            { input: [], expected: false },
            { input: () => true, expected: false }
        ])('isSingleLineTrimmedString($input) should return $expected', ({ input, expected }) => {
            expect(StringUtility.isSingleLineTrimmedString(input)).toBe(expected);
        });
    });
});
