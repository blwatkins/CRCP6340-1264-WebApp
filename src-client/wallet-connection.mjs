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

import { StringUtility } from '../src-shared/string-utility.mjs';

function getRpcUrl(envVar, defaultUrl) {
    const url = import.meta.env[envVar];

    if (!StringUtility.isSingleLineTrimmedString(url)) {
        console.warn(`WalletConnectionHandler Warning: Missing RPC URL configuration. Using default: ${defaultUrl}.`);
        return defaultUrl;
    }

    return url;
}

const rpcUrlConfig = {
    baseMainnet: getRpcUrl('VITE_BASE_MAINNET_RPC_URL', base.rpcUrls.default.http[0]),
    baseSepolia: getRpcUrl('VITE_BASE_SEPOLIA_RPC_URL', baseSepolia.rpcUrls.default.http[0])
};

function buildTransports() {
    return {
        [base.id]: http(rpcUrlConfig.baseMainnet),
        [baseSepolia.id]: http(rpcUrlConfig.baseSepolia)
    }
}

function buildCustomRpcUrls() {
    return {
        [`eip155:${base.id}`]: [{ url: rpcUrlConfig.baseMainnet }],
        [`eip155:${baseSepolia.id}`]: [{ url: rpcUrlConfig.baseSepolia }]
    };
}

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
const networks = [base, baseSepolia];
const transports = buildTransports();
const customRpcUrls = buildCustomRpcUrls();

let wagmiAdapter;
let appKit;
let isAdapterDecorated = false;

function buildWagmiAdapter() {
    if (wagmiAdapter) {
        console.debug('Wallet Connection - WagmiAdapter Connected.');
        return wagmiAdapter;
    }

    console.debug('Wallet Connection - Building WagmiAdapter.');
    return new WagmiAdapter({
        networks: networks,
        projectId: projectId,
        transports: transports,
        customRpcUrls: customRpcUrls
    });
}

function buildAppKit() {
    if (appKit) {
        console.debug('Wallet Connection - AppKit Connected.');
        return appKit;
    }

    if (!wagmiAdapter) {
        console.error('Wallet Connection - Missing WagmiAdapter.');
        return undefined;
    }

    console.debug('Wallet Connection - Building AppKit.');
    return createAppKit({
        adapters: [wagmiAdapter],
        networks: networks,
        projectId: projectId,
        customRpcUrls: customRpcUrls
    });
}

function decorateWagmiAdapter() {
    if (!wagmiAdapter) {
        console.error('Wallet Connection - Missing WagmiAdapter.');
        return;
    }

    if (!appKit) {
        console.error('Wallet Connection - Missing AppKit.');
        return;
    }

    if (isAdapterDecorated) {
        console.debug('Wallet Connection - WagmiAdapter is decorated.');
        return;
    }

    console.debug('Wallet Connection - Decorating WagmiAdapter.');

    watchAccount(wagmiAdapter.wagmiConfig, {
        onChange: async (account) => {
            console.debug('Wallet Connection - Account Update.', {
                address: account.address ?? null,
                isConnected: account.isConnected,
                connector: account.connector?.name ?? null,
                chainId: account.chainId ?? null,
            });
        }
    });

    watchChainId(wagmiAdapter.wagmiConfig, {
        onChange: (chainId) => {
            console.debug('Wallet Connection - Chain Update.', { chainId });
        }
    });

    watchConnections(wagmiAdapter.wagmiConfig, {
        onChange: (connections) => {
            console.debug('Wallet Connection - Connections Update.', {
                totalConnections: connections.length
            });
        }
    });

    isAdapterDecorated = true;
}

export function initAppKit() {
    try {
        if (!StringUtility.isSingleLineTrimmedString(projectId)) {
            console.error('Wallet Connection Error - Missing Reown AppKit Project ID configuration.');
            return;
        }

        console.debug('Wallet Connection - Project ID loaded successfully.');
        console.debug('Wallet Connection - RPC URL Configuration', rpcUrlConfig);

        if (!wagmiAdapter) {
            wagmiAdapter = buildWagmiAdapter();
        }

        if (wagmiAdapter) {
            appKit = buildAppKit();
        }

        if (appKit) {
            decorateWagmiAdapter();
            return appKit;
        }
    } catch {
        console.error('Wallet Connection Initialization Error');
    }

    return undefined;
}
