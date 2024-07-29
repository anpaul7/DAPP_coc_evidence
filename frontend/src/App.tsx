/*
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
*/

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract } from 'wagmi';
import { DAPP_contractAddress_deploy } from './assets/constants';
import { abi } from './assets/abis/DAPP_coc_evidenceABI';
function App() {
  const { address, isConnected } = useAccount(); //conect to wallet
  //const [count, setCount] = useState(0)
  console.log(address);

  const {data, isLoading, refetch} = useReadContract({ //hub to contract
    address: DAPP_contractAddress_deploy, //address of the contract
    abi: abi,//abi of the contract
    functionName: "getName", //function to call on the contract
    args: [0], //args to pass to the function
  })

  return (
  <main className='w-full flex justify-center items-center min-h-screen flex-col' >
    <h1 className='text-4xl text-red-800 font-bold text-center flex-col'>
      Chain-of-Custody Digital Evidence</h1>
    <div>
      { isConnected ? (
        //<div>Connected with address: {address}</div> 
        //
        <div><p>
          <span> Wallet Address: </span> 
          {isLoading ? (<span className='opacity-70'>Loading..."</span>) : address /*(data?.toString())*/}
        </p></div> 
      ):(
      <div>Please connect your wallet to use the Chain-of-Custody Digital Evidence</div> )
      }
      <ConnectButton />
    </div>
    
  </main>

  );
/*



  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  ) */
}

export default App
