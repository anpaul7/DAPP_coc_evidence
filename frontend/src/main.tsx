import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';

import App from './App.tsx'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia, localhost, sepolia } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';


export const config: ReturnType<typeof getDefaultConfig> = getDefaultConfig({
  appName: 'Chain-of-Custody Digital Evidence',
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains: [localhost, sepolia, arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

//--instant connect for 
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>

          <App />
          <ToastContainer />

        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    
  </React.StrictMode>,
)
