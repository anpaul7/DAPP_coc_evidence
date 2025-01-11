/*
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
*/

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useConnect, useReadContract,  useWriteContract } from 'wagmi';
import { contractAddress_DE_deploy } from './assets/constants';
import { abi } from './assets/abis/coc_evidence_digitalABI';
import { useEffect } from 'react';

function App() {
  const { address, isConnected } = useAccount(); //conect to wallet
  //const [count, setCount] = useState(0)
  console.log(address);

  const {data:dataContract, /* refetch*/} = useReadContract({ //hub to contract
    address: contractAddress_DE_deploy, //address of the contract deployed
    abi: abi,//abi of the contract
    functionName: "getNameContract", //function to call on the contract
    args: [], //args to pass to the function, args: [address],
  })

  const {data:dataGetName} = useReadContract({ //hub to contract
    address: contractAddress_DE_deploy, //address of the contract deployed
    abi: abi,//abi of the contract
    functionName: "getName", //function to call on the contract
    args: [0], //args to pass to the function, args: [address],
  })

  const {data:dataGetRecordsEvidence, isLoading: isLoadingContract,
    error: errorContract, isSuccess: isSuccessContract, 
    isRefetching: isRefetchingContract} = useReadContract({ //hub to contract
    address: contractAddress_DE_deploy, //address of the contract deployed
    abi: abi,//abi of the contract
    functionName: "recordsEvidence", //function to call on the contract
    args: [0], //args to pass to the function, args: [address],
  })

  //data result console 
  useEffect(() => {
    console.log("dataContract:", dataGetRecordsEvidence); //function result contract
    console.log("isLoadingContract:", isLoadingContract);
    console.log("contractError:", errorContract);
    console.log("isSuccessContract", isSuccessContract);
    console.log("isRefetchingGetName", isRefetchingContract);
    console.log("___________");
  }, [dataGetRecordsEvidence, isLoadingContract, errorContract,
     isSuccessContract, isRefetchingContract] );

  return (
  <main className='w-full flex justify-center items-center min-h-screen flex-col ' >
    <h1 className='text-4xl text-white font-bold text-center flex-col'>
      Chain-of-Custody Digital Evidence</h1>
    <div className='my-5 px-4 flex-col gap-5 border-2 border #77b353 text-center items-center'>
    <div className='text-2xl my-5 px-5 flex-col  text-center items-center' ><ConnectButton /></div>
      { isConnected ? (
        //<div>Connected with address: {address}</div> 
        //
        <div className='my-5 px-4 '><p>
            <span> Wallet Address: </span> 
            <p className='text-red-500' >{isLoadingContract ? (<span className='opacity-70 text-white'>Loading..."</span>) : address /*(dataContract?.toString())*/}</p>
            <p className='text-white' >{isLoadingContract ? (<span className='opacity-70'>Loading2..."</span>) : (dataContract?.toString())} </p>
        </p></div> 
      ):(
      <div className='text-1xl text-red-500 text-center flex-col'>Please connect your wallet to use the Chain-of-Custody Digital Evidence</div> )
      }
      
    </div>

    <div className='text-gray-400'>
      Data Records Evidence Contract: {dataGetRecordsEvidence?.toString()}
    </div>

    <div className='items-center'>
      <button className='bg-gray-600 text-white px-3 py-1 rounded-lg my-5 hover:bg-gray-800'>
        Register Evidence Digital
    </button>
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
