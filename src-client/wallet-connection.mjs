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
import { http, formatEther } from 'viem';
import { ErrorUtility } from '../src-shared/error-utility.mjs';
import { createAppKit } from '@reown/appkit';
import { watchAccount, watchChainId, watchConnections, getBalance } from '@wagmi/core';

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

    static #isWagmiAdapterDecorated = false;

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
                WalletConnectionHandler.#projectId = WalletConnectionHandler.#getProjectId();
            }

            if (WalletConnectionHandler.#projectId && !WalletConnectionHandler.#wagmiAdapter) {
                WalletConnectionHandler.#wagmiAdapter = WalletConnectionHandler.#buildWagmiAdapter();
            }

            if (WalletConnectionHandler.#wagmiAdapter) {
                WalletConnectionHandler.#decorateWagmiAdapter();
            }

            if (WalletConnectionHandler.#wagmiAdapter && !WalletConnectionHandler.#appKit) {
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

        console.log('WalletConnectionHandler - Retrieving project ID.');

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

        console.log('WalletConnectionHandler - Building WAGMI adapter.');

        return new WagmiAdapter({
            networks: WalletConnectionHandler.#getNetworks(),
            projectId: WalletConnectionHandler.#projectId,
            customRpcUrls: WalletConnectionHandler.#buildRpcUrls()
        });
    }

    static #buildAppKit() {
        if (WalletConnectionHandler.#appKit) {
            return WalletConnectionHandler.#appKit;
        }

        console.log('WalletConnectionHandler - Building app kit.');

        const networks = WalletConnectionHandler.#getNetworks();

        return createAppKit({
            adapters: [WalletConnectionHandler.#wagmiAdapter],
            enableWallets: true,
            enableNetworkSwitch: true,
            enableReconnect: true,
            enableWalletGuide: true,
            debug: true,
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
                emailShowWallets: false,
                analytics: true,
                balance: 'show',
                swaps: false,
                send: false,
                onramp: false,
                connectMethodsOrder: ['wallet'],
                legalCheckbox: false
            },
            customRpcUrls: WalletConnectionHandler.#buildRpcUrls(),
            allWallets: 'SHOW',
            allowUnsupportedChain: false
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

    // TODO - only need to do once and store statically
    static #buildRpcUrls() {
        console.log('WalletConnectionHandler - Building RPC URLs.');

        return {
            [base.id]: [{url: WalletConnectionHandler.#getRpcUrl('VITE_BASE_MAINNET_RPC_URL', base.rpcUrls.default.http[0])}],
            [baseSepolia.id]: [{url: WalletConnectionHandler.#getRpcUrl('VITE_BASE_SEPOLIA_RPC_URL', baseSepolia.rpcUrls.default.http[0])}]
        };
    }

    static #decorateWagmiAdapter() {
        if (WalletConnectionHandler.#isWagmiAdapterDecorated || !WalletConnectionHandler.#wagmiAdapter) {
            return;
        }

        console.log('WalletConnectionHandler - Decorating WAGMI Adapter.');

        // TODO - store data statically so balance and account can be updated on chain AND account switch
        watchAccount(WalletConnectionHandler.#wagmiAdapter.wagmiConfig, {
            onChange: async (account) => {
                console.info('WalletConnectHandler: Account Update', {
                    address: account.address ?? null,
                    isConnected: account.isConnected,
                    connector: account.connector?.name ?? null
                });

                if (account && account.isConnected) {
                    const balance = await getBalance(WalletConnectionHandler.#wagmiAdapter.wagmiConfig, {
                        address: account.address,
                        chainId: base.id,
                        blockTag: 'latest'
                    });

                    console.info('WalletConnectHandler: Balance Log', {
                        balance: formatEther(balance.value)
                    });
                }
            }
        });

        watchChainId(WalletConnectionHandler.#wagmiAdapter.wagmiConfig, {
            onChange: (chainId) => {
                console.info('WalletConnectHandler: Chain Update', { chainId });
            }
        });

        watchConnections(WalletConnectionHandler.#wagmiAdapter.wagmiConfig, {
            onChange: (connections) => {
                console.info('WalletConnectHandler: Connector Sessions Update', {
                    count: connections.length
                });
            }
        });

        WalletConnectionHandler.#isWagmiAdapterDecorated = true;
    }
}
