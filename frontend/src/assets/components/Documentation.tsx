import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useConnect, useReadContract } from 'wagmi';
import { contractAddress_DE_deploy } from '../../assets/constants';
import { abi } from '../../assets/abis/coc_evidence_digitalABI';
import { useEffect } from 'react';

function Documentation() {
  
  return (
    <main className='w-full flex justify-center items-center min-h-screen flex-col ' >

    <h1 className='text-4xl text-white font-bold text-center flex-col'>
      Chain-of-Custody Digital Evidence</h1>
      <p>Operations for registration, storing and tracing digital evidence in computer forensic processes.</p>
    
    
  </main>

  );
 
};

export default Documentation