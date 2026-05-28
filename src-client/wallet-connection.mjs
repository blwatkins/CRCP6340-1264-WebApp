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

import { base, baseSepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'viem';
import { ErrorUtility } from '../src-shared/error-utility.mjs';
import { createAppKit } from '@reown/appkit';

export class WalletConnectionHandler {
    /**
     * @type {string}
     */
    static #connectWalletButtonId = 'connect-wallet-button';

    /**
     * @type {string|undefined}
     */
    static #projectId;

    /**
     * @type {boolean}
     */
    static #isActive = false;

    static #wagmiAdapter;

    static #appKit;

    /**
     * The primary element ID for this handler.
     * If this element is present, the handler can initialize and manage wallet connection.
     *
     * @returns {string}
     */
    static get primaryElementId() {
        return WalletConnectionHandler.#connectWalletButtonId;
    }

    /**
     * @returns {void}
     */
    static init() {
        try {
            if (!WalletConnectionHandler.#projectId) {
                console.log('WalletConnectionHandler - Setting project ID.');
                WalletConnectionHandler.#projectId = WalletConnectionHandler.#getProjectId();
            }

            if (WalletConnectionHandler.#projectId && !WalletConnectionHandler.#wagmiAdapter) {
                console.log('WalletConnectionHandler - Building WAGMI adapter.');
                WalletConnectionHandler.#wagmiAdapter = WalletConnectionHandler.#buildWagmiAdapter();
            }

            if (WalletConnectionHandler.#wagmiAdapter && !WalletConnectionHandler.#appKit) {
                console.log('WalletConnectionHandler - Building app kit.');
                WalletConnectionHandler.#appKit = WalletConnectionHandler.#buildAppKit();
            }
        } catch (error) {
            console.error(ErrorUtility.buildErrorMessage('WalletConnectionHandler Initialization Error', error));
        }
    }

    // TODO - check for non-empty string
    /**
     * @returns {string}
     */
    static #getProjectId() {
        if (WalletConnectionHandler.#projectId) {
            return WalletConnectionHandler.#projectId;
        }

        const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

        if (!projectId) {
            console.error('WalletConnectionHandler Error: Missing Reown AppKit Project ID configuration.');
            return undefined;
        }

        return projectId.trim();
    }

    static #buildWagmiAdapter() {
        if (WalletConnectionHandler.#wagmiAdapter) {
            return WalletConnectionHandler.#wagmiAdapter;
        }

        return new WagmiAdapter({
            networks: WalletConnectionHandler.#getNetworks(),
            projectId: WalletConnectionHandler.#projectId,
            transports: WalletConnectionHandler.#buildWagmiAdapterTransports()
        });
    }

    static #buildAppKit() {
        if (WalletConnectionHandler.#appKit) {
            return WalletConnectionHandler.#appKit;
        }

        const networks = WalletConnectionHandler.#getNetworks();

        return createAppKit({
            adapters: [WalletConnectionHandler.#wagmiAdapter],
            networks: networks,
            defaultNetwork: networks[0],
            projectId: WalletConnectionHandler.#projectId,
            metadata: {
                name: 'CRCP6340 WebApp',
                description: 'Wallet connection for the CRCP6340 NFT web application.',
                url: WalletConnectionHandler.#getMetadataUrl(),
                icons: ['https://avatars.githubusercontent.com/u/179229932']
            },
            features: {
                email: false,
                socials: [],
                emailShowWallets: false
            },
            allWallets: 'SHOW'
        });
    }

    // TODO - check for non-empty string
    /**
     * @param {string} envVarName
     * @param {string} defaultUrl
     * @return {string}
     */
    static #getRpcUrl(envVarName, defaultUrl) {
        const url = import.meta.env[envVarName];

        if (!url) {
            console.warn(`WalletConnectionHandler Warning: Missing RPC URL configuration. Using default: ${defaultUrl}.`);
            return defaultUrl;
        }

        return url;
    }

    // TODO - check for non-empty string
    static #getMetadataUrl() {
        const url = import.meta.env.VITE_APP_URL;

        if (!url) {
            console.warn('WalletConnectionHandler Warning: Missing app URL configuration.');

            if (typeof window !== 'undefined' && window.location?.origin) {
                return window.location.origin;
            }

            return 'http://localhost:3000';
        }

        return url.trim();
    }

    static #getNetworks() {
        const evmNetworkGroups = {
            base: [base, baseSepolia],
            polygon: [],
            ethereum: [],
            arbitrum: []
        };

        return [...evmNetworkGroups.base];
    }

    static #buildWagmiAdapterTransports() {
        return {
            [base.id]: http(WalletConnectionHandler.#getRpcUrl('VITE_BASE_MAINNET_RPC_URL', base.rpcUrls.default.http[0])),
            [baseSepolia.id]: http(WalletConnectionHandler.#getRpcUrl('VITE_BASE_SEPOLIA_RPC_URL', baseSepolia.rpcUrls.default.http[0]))
        };
    }
}
