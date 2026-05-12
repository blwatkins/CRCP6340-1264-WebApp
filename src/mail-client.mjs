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

import nodemailer from 'nodemailer';

import { ErrorUtility } from '../src-shared/error-utility.mjs';
import { StringUtility } from '../src-shared/string-utility.mjs';

export class MailClient {
    /**
     * @throws {Error} - MailClient is a static class and cannot be instantiated.
     */
    constructor() {
        throw new Error('MailClient is a static class and cannot be instantiated.');
    }

    /**
     * @returns {number}
     */
    static get maxSubjectLength() {
        return 256;
    }

    /**
     * @returns {number}
     */
    static get maxTextLength() {
        return 1024;
    }

    static get appConfigErrorMessage() {
        return 'Invalid app configuration for MailClient. '
            + 'Please ensure all required environment variables are present and valid.';
    }

    static get transportNotDefinedErrorMessage() {
        return 'MailClient transport is not defined.';
    }

    /**
     * @returns {boolean}
     */
    static hasValidConfiguration() {
        const stringVars = [
            process.env.MAIL_SENDER_EMAIL,
            process.env.MAIL_SENDER_PASSWORD,
            process.env.MAIL_SENDER_SERVICE,
            process.env.MAIL_RECIPIENT_EMAIL
        ];

        let isValid = true;

        for (const stringVar of stringVars) {
            if (!StringUtility.isNonEmptyString(stringVar)) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    /**
     * @returns {Promise<void>}
     */
    static async init() {
        if (!transport) {
            console.error(MailClient.transportNotDefinedErrorMessage);
            return;
        }

        try {
            await transport.verify();
            console.debug('MailClient initialized and validated.');
        } catch (error) {
            console.error(ErrorUtility.buildErrorMessage('MailClient Initialization Error', error));
        }
    }

    /**
     * @returns {{pool: boolean, service: string, auth: {user: string, pass: string}}|undefined}
     */
    static buildTransportConfig() {
        try {
            return {
                pool: true,
                service: StringUtility.trimString(process.env.MAIL_SENDER_SERVICE),
                auth: {
                    user: StringUtility.trimString(process.env.MAIL_SENDER_EMAIL),
                    pass: StringUtility.trimString(process.env.MAIL_SENDER_PASSWORD)
                }
            };
        } catch {
            return undefined;
        }
    }

    /**
     * @param {string} subject
     * @param {string} text
     * @return {Promise<{status: number, message: string}>}
     * @throws {Error} If MailClient transport is not properly initialized.
     */
    static async sendMail(subject, text) {
        if (!transport) {
            throw new Error(`Unable to send mail. ${MailClient.transportNotDefinedErrorMessage}`);
        }

        const messageSubject = MailClient.#sanitizeSubject(subject);
        const messageText = MailClient.#sanitizeText(text);

        if (!messageSubject || !messageText) {
            return {
                status: 400,
                message: 'Bad Request: Message subject or text is missing or not properly formatted.'
            };
        }

        try {
            const message = {
                from: StringUtility.trimString(process.env.MAIL_SENDER_EMAIL),
                to: StringUtility.trimString(process.env.MAIL_RECIPIENT_EMAIL),
                subject: messageSubject,
                text: messageText
            };

            await transport.sendMail(message);
        } catch (error) {
            console.error(ErrorUtility.buildErrorMessage('MailClient.sendMail Error', error));

            return {
                status: 500,
                message: 'Message failed to send. Please try again later.'
            };
        }

        return {
            status: 200,
            message: 'Message sent successfully!'
        };
    }

    /**
     * @param {unknown} input
     * @return {string|undefined}
     */
    static #sanitizeSubject(input) {
        if (!StringUtility.isNonEmptyString(input)) {
            return undefined;
        }

        const trimmedInput = input.trim();

        if (!StringUtility.isSingleLineTrimmedString(trimmedInput)) {
            return undefined;
        }

        if (trimmedInput.length > MailClient.maxSubjectLength) {
            return undefined;
        }

        return trimmedInput;
    }

    /**
     * @param {unknown} input
     * @return {string|undefined}
     */
    static #sanitizeText(input) {
        if (!StringUtility.isNonEmptyString(input)) {
            return undefined;
        }

        const trimmedInput = input.trim();

        if (trimmedInput.length > MailClient.maxTextLength) {
            return undefined;
        }

        return trimmedInput;
    }
}

let transport;

if (MailClient.hasValidConfiguration()) {
    const transportConfig = MailClient.buildTransportConfig();

    if (transportConfig) {
        transport = nodemailer.createTransport(transportConfig);
    }
}

if (!transport) {
    console.error(MailClient.appConfigErrorMessage);
}
