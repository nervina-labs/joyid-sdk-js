import { http, WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { sepolia, polygonAmoy } from 'wagmi/chains';
import {
    connectorsForWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { createJoyIdWallet } from '@joyid/rainbowkit'
import { injectedWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

const joyidWallet = createJoyIdWallet({
    name: 'JoyID RainbowKit demo',
    logo: 'https://fav.farm/🆔',
    joyidAppURL: 'https://testnet.joyid.dev',
})

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            joyidWallet,
            injectedWallet,
            coinbaseWallet,
        ],
    },
], {
    appName: 'JoyID RainbowKit demo',
    projectId: 'YOUR_PROJECT_ID',
});

const config = createConfig({
    chains: [sepolia, polygonAmoy],
    transports: {
        [sepolia.id]: http(),
        [polygonAmoy.id]: http(),
    },
    connectors,
});

export const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const queryClient = new QueryClient()
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
