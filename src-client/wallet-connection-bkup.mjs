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

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { watchAccount, watchChainId, watchConnections } from '@wagmi/core';
import { http } from 'viem';

let appKitInstance;
let hasInitializedWatchers = false;

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
                count: connections.length
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

    if (enabledEvmNetworks.length === 0) {
        console.error('[wallet] No EVM networks configured; AppKit initialization was skipped.');
        return undefined;
    }

    appKitInstance =

    setupWalletStateLogging(wagmiAdapter);

    return appKitInstance;
}

export function hi() {
    return initializeWalletConnection();
}
