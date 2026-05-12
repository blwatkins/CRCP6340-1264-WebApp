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
// TODO - mail endpoint route
// TODO - environment variable validation
// TODO - route logging

import express from 'express';

import { rateLimit } from 'express-rate-limit';
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

await MailClient.init();

app.post('/api/favoriteColor', (request, response) => {
    const requestName = request.body?.name;
    const requestColor = request.body?.color;

    console.log(request.body);

    if (requestName === 'fail-test') {
        response.status(500).json({ message: 'request error' });
    } else if (requestName && requestColor) {
        response.json({});
    } else {
        response.status(400).json({ message: 'Bad request' });
    }
});
