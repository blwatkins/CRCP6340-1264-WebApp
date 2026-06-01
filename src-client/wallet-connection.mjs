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
import { base, baseSepolia, polygon, polygonAmoy } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

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
    baseSepolia: getRpcUrl('VITE_BASE_SEPOLIA_RPC_URL', baseSepolia.rpcUrls.default.http[0]),
    polygonMainnet: getRpcUrl('VITE_POLYGON_MAINNET_RPC_URL', polygon.rpcUrls.default.http[0]),
    polygonAmoy: getRpcUrl('VITE_POLYGON_AMOY_RPC_URL', polygonAmoy.rpcUrls.default.http[0])
};

function buildCustomRpcUrls() {
    return {
        [`eip155:${base.id}`]: [{ url: rpcUrlConfig.baseMainnet }],
        [`eip155:${baseSepolia.id}`]: [{ url: rpcUrlConfig.baseSepolia }],
        [`eip155:${polygon.id}`]: [{ url: rpcUrlConfig.polygonMainnet }],
        [`eip155:${polygonAmoy.id}`]: [{ url: rpcUrlConfig.polygonAmoy }]
    };
}

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
const networks = [base, baseSepolia, polygon, polygonAmoy];
const customRpcUrls = buildCustomRpcUrls();

let ethersAdapter;
let appKit;
let isAppKitDecorated = false;

function buildEthersAdapter() {
    if (ethersAdapter) {
        console.debug('Wallet Connection - EthersAdapter Connected.');
        return ethersAdapter;
    }

    console.debug('Wallet Connection - Building EthersAdapter.');
    return new EthersAdapter();
}

function buildAppKit() {
    if (appKit) {
        console.debug('Wallet Connection - AppKit Connected.');
        return appKit;
    }

    if (!ethersAdapter) {
        console.error('Wallet Connection - Missing EthersAdapter.');
        return undefined;
    }

    console.debug('Wallet Connection - Building AppKit.');
    return createAppKit({
        adapters: [ethersAdapter],
        networks: networks,
        projectId: projectId,
        customRpcUrls: customRpcUrls
    });
}

function decorateAppKit() {
    if (!appKit) {
        console.error('Wallet Connection - Missing AppKit.');
        return;
    }

    if (isAppKitDecorated) {
        console.debug('Wallet Connection - AppKit is decorated.');
        return;
    }

    console.debug('Wallet Connection - Decorating AppKit.');

    appKit.subscribeAccount((account) => {
        console.debug('Wallet Connection - Account Update.', {
            address: account.address ?? null,
            isConnected: account.status === 'connected',
            connector: appKit.getWalletProviderType() ?? null,
            chainId: appKit.getChainId() ?? null,
            chainName: appKit.getCaipNetwork()?.name ?? null
        });
    });

    appKit.subscribeNetwork((network) => {
        console.debug('Wallet Connection - Chain Update.', {
            chainId: network.chainId ?? null,
            chainName: network.caipNetwork?.name ?? null
        });
    });

    isAppKitDecorated = true;
}

export function initAppKit() {
    try {
        if (!StringUtility.isSingleLineTrimmedString(projectId)) {
            console.error('Wallet Connection Error - Missing Reown AppKit Project ID configuration.');
            return;
        }

        console.debug('Wallet Connection - Project ID loaded successfully.');
        console.debug('Wallet Connection - RPC URL Configuration', rpcUrlConfig);

        if (!ethersAdapter) {
            ethersAdapter = buildEthersAdapter();
        }

        if (ethersAdapter) {
            appKit = buildAppKit();
        }

        if (appKit) {
            decorateAppKit();
            return appKit;
        }
    } catch {
        console.error('Wallet Connection Initialization Error');
    }

    return undefined;
}
