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

import { createAppKit } from '@reown/appkit';
import { base, baseSepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { watchAccount, watchChainId, watchConnections } from '@wagmi/core';
import { http } from 'viem';

/**
 * @type {{
 *     base: {
 *         mainnet: import('@reown/appkit').AppKitNetwork;
 *         testnet: import('@reown/appkit').AppKitNetwork;
 *     };
 *     polygon: object;
 *     ethereum: object;
 *     arbitrum: object;
 * }}
 */
const evmNetworkGroups = {
    base: {
        mainnet: base,
        testnet: baseSepolia
    },
    polygon: {},
    ethereum: {},
    arbitrum: {}
};

const enabledEvmNetworks = Object.values(evmNetworkGroups.base);

let appKitInstance;
let hasInitializedWatchers = false;

/**
 * @returns {string}
 */
function resolveMetadataUrl() {
    const configuredAppUrl = (import.meta.env.VITE_APP_URL ?? '').trim();

    if (configuredAppUrl !== '') {
        return configuredAppUrl;
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }

    return 'http://localhost:3000';
}

/**
 * @returns {string | null}
 */
function resolveProjectId() {
    const projectId = (import.meta.env.VITE_REOWN_PROJECT_ID ?? '').trim();

    if (projectId === '') {
        console.error(
            '[wallet] VITE_REOWN_PROJECT_ID is required; AppKit initialization was skipped.'
        );
        return null;
    }

    return projectId;
}

/**
 * @param {string} envVarName
 * @param {string} fallbackUrl
 * @returns {string}
 */
function resolveRpcUrl(envVarName, fallbackUrl) {
    const configuredRpcUrl = (import.meta.env[envVarName] ?? '').trim();

    if (configuredRpcUrl !== '') {
        return configuredRpcUrl;
    }

    return fallbackUrl;
}

/**
 * @param {WagmiAdapter} wagmiAdapter
 */
function setupWalletStateLogging(wagmiAdapter) {
    if (hasInitializedWatchers) {
        return;
    }

    hasInitializedWatchers = true;

    watchAccount(wagmiAdapter.wagmiConfig, {
        onChange: (account) => {
            console.info('[wallet] account update', {
                address: account.address ?? null,
                isConnected: account.isConnected,
                connector: account.connector?.name ?? null
            });
        }
    });

    watchChainId(wagmiAdapter.wagmiConfig, {
        onChange: (chainId) => {
            console.info('[wallet] chain update', { chainId });
        }
    });

    watchConnections(wagmiAdapter.wagmiConfig, {
        onChange: (connections) => {
            console.info('[wallet] connector sessions', {
                count: connections.size
            });
        }
    });
}

/**
 * @returns {import('@reown/appkit').AppKit | undefined}
 */
function initializeWalletConnection() {
    if (appKitInstance) {
        return appKitInstance;
    }

    const projectId = resolveProjectId();

    if (!projectId) {
        return undefined;
    }

    const wagmiAdapter = new WagmiAdapter({
        networks: enabledEvmNetworks,
        projectId,
        transports: {
            [base.id]: http(
                resolveRpcUrl(
                    'VITE_BASE_MAINNET_RPC_URL',
                    base.rpcUrls.default.http[0]
                )
            ),
            [baseSepolia.id]: http(
                resolveRpcUrl(
                    'VITE_BASE_SEPOLIA_RPC_URL',
                    baseSepolia.rpcUrls.default.http[0]
                )
            )
        }
    });

    appKitInstance = createAppKit({
        adapters: [wagmiAdapter],
        networks: enabledEvmNetworks,
        defaultNetwork: evmNetworkGroups.base.mainnet,
        projectId,
        metadata: {
            name: 'CRCP6340 WebApp',
            description: 'Wallet connection for the CRCP6340 NFT web application.',
            url: resolveMetadataUrl(),
            icons: ['https://avatars.githubusercontent.com/u/179229932']
        },
        features: {
            email: false,
            socials: [],
            emailShowWallets: false
        },
        allWallets: 'SHOW'
    });

    setupWalletStateLogging(wagmiAdapter);

    return appKitInstance;
}

export function hi() {
    return initializeWalletConnection();
}
