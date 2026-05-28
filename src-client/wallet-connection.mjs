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
import { formatEther, http } from 'viem';
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

    static #rpcUrlConfig;

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

            if (WalletConnectionHandler.#wagmiAdapter && !WalletConnectionHandler.#appKit) {
                WalletConnectionHandler.#appKit = WalletConnectionHandler.#buildAppKit();
            }

            if (WalletConnectionHandler.#wagmiAdapter && WalletConnectionHandler.#appKit) {
                WalletConnectionHandler.#decorateWagmiAdapter();
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

        return WalletConnectionHandler.#getRequiredEnvVar(
            'VITE_REOWN_PROJECT_ID',
            'Missing Reown AppKit Project ID configuration.'
        );
    }

    static #buildWagmiAdapter() {
        if (WalletConnectionHandler.#wagmiAdapter) {
            return WalletConnectionHandler.#wagmiAdapter;
        }

        console.log('WalletConnectionHandler - Building WAGMI adapter.');

        const customRpcUrls = WalletConnectionHandler.#buildRpcUrls();
        const transports = WalletConnectionHandler.#buildTransports();

        if (!customRpcUrls || !transports) {
            return undefined;
        }

        return new WagmiAdapter({
            networks: WalletConnectionHandler.#getNetworks(),
            projectId: WalletConnectionHandler.#projectId,
            transports: transports,
            customRpcUrls: customRpcUrls
        });
    }

    static #buildAppKit() {
        if (WalletConnectionHandler.#appKit) {
            return WalletConnectionHandler.#appKit;
        }

        console.log('WalletConnectionHandler - Building app kit.');

        const networks = WalletConnectionHandler.#getNetworks();
        const metadataUrl = WalletConnectionHandler.#getMetadataUrl();
        const customRpcUrls = WalletConnectionHandler.#buildRpcUrls();

        if (!metadataUrl || !customRpcUrls) {
            return undefined;
        }

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
                url: metadataUrl,
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
            customRpcUrls: customRpcUrls,
            allWallets: 'SHOW',
            allowUnsupportedChain: false
        });
    }

    /**
     * @param {string} envVarName
     * @param {string} errorMessage
     * @returns {string|undefined}
     */
    static #getRequiredEnvVar(envVarName, errorMessage) {
        const value = import.meta.env[envVarName];

        if (typeof value !== 'string' || value.trim().length === 0) {
            console.error(`WalletConnectionHandler Error: ${errorMessage}`);
            return undefined;
        }

        return value.trim();
    }

    static #getRpcUrlConfig() {
        if (WalletConnectionHandler.#rpcUrlConfig) {
            return WalletConnectionHandler.#rpcUrlConfig;
        }

        const baseMainnetRpcUrl = WalletConnectionHandler.#getRequiredEnvVar(
            'VITE_BASE_MAINNET_RPC_URL',
            'Missing VITE_BASE_MAINNET_RPC_URL configuration.'
        );
        const baseSepoliaRpcUrl = WalletConnectionHandler.#getRequiredEnvVar(
            'VITE_BASE_SEPOLIA_RPC_URL',
            'Missing VITE_BASE_SEPOLIA_RPC_URL configuration.'
        );

        if (!baseMainnetRpcUrl || !baseSepoliaRpcUrl) {
            return undefined;
        }

        WalletConnectionHandler.#rpcUrlConfig = {
            baseMainnetRpcUrl: baseMainnetRpcUrl,
            baseSepoliaRpcUrl: baseSepoliaRpcUrl
        };

        return WalletConnectionHandler.#rpcUrlConfig;
    }

    static #getMetadataUrl() {
        const appUrl = WalletConnectionHandler.#getRequiredEnvVar(
            'VITE_APP_URL',
            'Missing VITE_APP_URL configuration. Use your exact localhost origin, for example: http://localhost:3000.'
        );

        if (!appUrl) {
            return undefined;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(appUrl);
        } catch {
            console.error('WalletConnectionHandler Error: VITE_APP_URL must be a valid URL origin like http://localhost:3000.');
            return undefined;
        }

        if (parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
            console.error('WalletConnectionHandler Error: VITE_APP_URL must only include protocol, host, and port (no path, query, or hash).');
            return undefined;
        }

        const normalizedOrigin = parsedUrl.origin;

        if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== normalizedOrigin) {
            console.warn(`WalletConnectionHandler Warning: VITE_APP_URL (${normalizedOrigin}) does not match current origin (${window.location.origin}). Ensure this exact origin is allowed in your Reown AppKit dashboard.`);
        }

        return normalizedOrigin;
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

    static #buildRpcUrls() {
        console.log('WalletConnectionHandler - Building RPC URLs.');

        const rpcUrlConfig = WalletConnectionHandler.#getRpcUrlConfig();
        if (!rpcUrlConfig) {
            return undefined;
        }

        return {
            [`eip155:${base.id}`]: [{ url: rpcUrlConfig.baseMainnetRpcUrl }],
            [`eip155:${baseSepolia.id}`]: [{ url: rpcUrlConfig.baseSepoliaRpcUrl }]
        };
    }

    static #buildTransports() {
        const rpcUrlConfig = WalletConnectionHandler.#getRpcUrlConfig();
        if (!rpcUrlConfig) {
            return undefined;
        }

        return {
            [base.id]: http(rpcUrlConfig.baseMainnetRpcUrl),
            [baseSepolia.id]: http(rpcUrlConfig.baseSepoliaRpcUrl)
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
                        chainId: account.chainId,
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
