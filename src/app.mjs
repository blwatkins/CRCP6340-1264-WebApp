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

// TODO - error handling routes
// TODO - route logging

import express from 'express';

import { rateLimit } from 'express-rate-limit';

import { StringUtility } from '../src-shared/string-utility.mjs';
import { ErrorUtility } from '../src-shared/error-utility.mjs';

import { Constants } from './constants.mjs';
import { MailClient } from './mail-client.mjs';

const limiter = rateLimit({
    windowMs: Constants.millisPerSecond * Constants.secondsPerMinute,
    limit: Constants.requestsLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});

export const app = express();

app.disable('x-powered-by');

app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.static(Constants.publicDir));

try {
    await MailClient.init();
} catch (error) {
    console.error(ErrorUtility.buildErrorMessage('Initialization Error', error));
}

app.post('/api/favoriteColor', async (request, response) => {
    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
        response.status(400).send({ message: 'Bad Request: Request body is missing or not properly formatted.' });
        return;
    }

    const requestName = request.body.name;
    const requestColor = request.body.color;

    if (!StringUtility.isSingleLineTrimmedString(requestName) || !StringUtility.isHexColorString(requestColor)) {
        response.status(400).json({ message: 'Bad Request: Required parameters are missing or not properly formatted.' });
        return;
    }

    try {
        const subject = `\u{2757} \u{1F310} ${requestName} has sent you their favorite color! \u{1F3A8}`;
        const text = `Name: ${requestName}\nFavorite Color: ${requestColor}`;
        const result = await MailClient.sendMail(subject, text);

        if (typeof result.status === 'number' && result.status >= 100 && result.status < 600 && StringUtility.isSingleLineTrimmedString(result.message)) {
            response.status(result.status).json({ message: result.message });
        } else {
            response.status(500).json({ message: 'Internal Server Error.' });
        }
    } catch (error) {
        console.error(ErrorUtility.buildErrorMessage('Request Error', error));
        response.status(500).json({ message: 'Internal Server Error: Message failed to send.' });
    }
});
