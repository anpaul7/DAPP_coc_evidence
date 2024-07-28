import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { arbitrum, arbitrumSepolia, hardhat, localhost, sepolia } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'Chain-of-Custody Digital Evidence',
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains: [localhost, hardhat, arbitrumSepolia,  arbitrum, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

//--instant conect
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    
  </React.StrictMode>,
)
