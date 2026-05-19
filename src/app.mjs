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

import express from 'express';

import { rateLimit } from 'express-rate-limit';

import { StringUtility } from '../src-shared/string-utility.mjs';
import { ErrorUtility } from '../src-shared/error-utility.mjs';

import { ProjectHandler } from './controller/project-handler.mjs';
import { MailClient } from './mail/mail-client.mjs';
import { Constants } from './utils/constants.mjs';
import { getNavBarLinks } from './utils/utils.mjs';

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
app.set('view engine', 'ejs');

MailClient.init()
    .catch((error) => {
        console.error(ErrorUtility.buildErrorMessage('Initialization Error', error));
    });

if (Constants.requestLoggingEnabled) {
    app.use((request, response, next) => {
        response.on('finish', () => {
            const requestPath = (request.baseUrl || '') + (request.path || '');
            const message = `Request completed: ${request.method} ${requestPath} [status ${response.statusCode}]`;
            console.debug(message);
        });
        next();
    });
}

app.get('/', (request, response) => {
    const navBarLinks = getNavBarLinks('home');
    const projectIds = ProjectHandler.getProjectIds();
    let id = 0;

    if (projectIds.length > 0) {
        const index = Math.floor(Math.random() * projectIds.length);
        id = projectIds[index];
    }

    const project = ProjectHandler.getProject(id);

    response.render('index.ejs', {
        pageData: {
            title: "Brittni's Summer 2026 NFTs",
            description: "Brittni's NFTs for CRCP 6340; SMU Summer 2026 term.",
            navBarLinks
        },
        project
    });
});

app.get('/projects', (request, response) => {
    const navBarLinks = getNavBarLinks('projects');

    response.render('projects.ejs', {
        pageData: {
            title: "Brittni's Summer 2026 NFT Projects",
            description: "Brittni's NFT Projects for CRCP 6340; SMU Summer 2026 term.",
            navBarLinks
        }
    });
});

app.post('/api/favoriteColor', async (request, response) => {
    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
        response.status(400).json({ message: 'Bad Request: Request body is missing or not properly formatted.' });
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

const isApiRequest = request => request.path === '/api' || request.path.startsWith('/api/');

app.use((error, request, response, _next) => {
    console.error(ErrorUtility.buildErrorMessage('Internal Server Error', error));
    console.error(error);

    if (isApiRequest(request)) {
        response.status(500).json({ message: 'Internal Server Error.' });
        return;
    }

    const navBarLinks = getNavBarLinks();

    response.status(500).render('errors/500.ejs', {
        pageData: {
            title: "Brittni's Summer 2026 NFT Projects",
            description: "Brittni's NFT Projects for CRCP 6340; SMU Summer 2026 term.",
            navBarLinks
        }
    });
});

app.use((request, response) => {
    if (isApiRequest(request)) {
        response.status(404).json({ message: 'Not Found.' });
        return;
    }

    const navBarLinks = getNavBarLinks();

    response.status(404).render('errors/404.ejs', {
        pageData: {
            title: "Brittni's Summer 2026 NFT Projects",
            description: "Brittni's NFT Projects for CRCP 6340; SMU Summer 2026 term.",
            navBarLinks
        }
    });
});
