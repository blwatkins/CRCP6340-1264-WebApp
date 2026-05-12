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

import { StringUtility } from '../src-shared/string-utility.mjs';

export class MailClient {
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
        try {
            await transport.verify();
            console.debug('MailClient initialized and validated.');
        } catch {
            console.error('MailClient initialization failed. Please check your app configuration and ensure the mail server is reachable.');
        }
    }

    /**
     * @returns {{pool: boolean, service: string, auth: {user: string, pass: string}}}
     */
    static buildTransportConfig() {
        return {
            pool: true,
            service: StringUtility.trimString(process.env.MAIL_SENDER_SERVICE),
            auth: {
                user: StringUtility.trimString(process.env.MAIL_SENDER_EMAIL),
                pass: StringUtility.trimString(process.env.MAIL_SENDER_PASSWORD)
            }
        };
    }

    /**
     * @param {string} subject
     * @param {string} text
     * @return {Promise<{status: number, message: string}>}
     */
    static async sendMail(subject, text) {
        if (!transport) {
            throw new Error('Unable to send mail. Missing required transport.');
        }

        const messageSubject = MailClient.#sanitizeSubject(subject);
        const messageText = MailClient.#sanitizeText(text);

        if (!messageSubject || !messageText) {
            return {
                status: 400,
                message: 'Bad Request: Message subject or text is missing or not properly formatted.'
            }
        }

        const message = {
            from: process.env.MAIL_SENDER_EMAIL,
            to: process.env.MAIL_RECIPIENT_EMAIL,
            subject: 'TODO',
            text: 'TODO'
        }

        await transport.sendMail(message);

        return {
            status: 200,
            message: 'Message sent successfully!'
        }
    }

    /**
     * @param {unknown} input
     * @return {string|undefined}
     */
    static #sanitizeSubject(input) {
        if (!StringUtility.isNonEmptyString(input)) {
            return undefined;
        }

        if (!StringUtility.isSingleLineTrimmedString(input.trim())) {
            return undefined;
        }

        if (input.trim().length > MailClient.maxSubjectLength) {
            return undefined;
        }

        return input.trim();
    }

    /**
     * @param {unknown} input
     * @return {string|undefined}
     */
    static #sanitizeText(input) {
        if (!StringUtility.isNonEmptyString(input)) {
            return undefined;
        }

        if (input.trim().length > MailClient.maxTextLength) {
            return undefined;
        }

        return input.trim();
    }
}

let transport;

if (MailClient.hasValidConfiguration()) {
    transport = nodemailer.createTransport(MailClient.buildTransportConfig());
} else {
    console.error('Invalid app configuration for MailClient. Please ensure all required environment variables are set and non-empty.');
}
