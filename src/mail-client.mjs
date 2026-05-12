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

    static async init() {
        try {
            await transporter.verify();
            console.debug('MailClient initialized and validated.');
        } catch {
            console.error('MailClient initialization failed. Please check your app configuration and ensure the mail server is reachable.');
        }
    }

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
}

let transporter;

if (MailClient.hasValidConfiguration()) {
    transporter = nodemailer.createTransport(MailClient.buildTransportConfig());
} else {
    console.warn('Invalid app configuration for MailClient. Please ensure all required environment variables are set and non-empty.');
}
