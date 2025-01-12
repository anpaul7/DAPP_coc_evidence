import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useReadContract, useWriteContract } from 'wagmi';
import { contractAddress_DE_deploy } from '../../assets/constants';
import { abi } from '../../assets/abis/coc_evidence_digitalABI';
import { useEffect, useState } from 'react';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../../main';
import { toast } from 'react-toastify';


function Register () {

  //use in button on click
  const [isRegistering, setRegisterEvidence] = useState(false); //state transaction blockchain register evidence

  const {writeContractAsync} = useWriteContract(); //hub wagmi write in contract
    
    
  const registerEvidence = async () => {
    setRegisterEvidence(true);

    try {
      const txHash = await writeContractAsync({
        address: contractAddress_DE_deploy, //address of the contract deployed
        abi,
        functionName: "createEvidence", //function to call on the contract
        args: ["Funcionario","Cedula",123,"Pedro","Perez","13-01-2025"], //args to pass to the function, args: [address],
        //  "Nonce_init","-",0,"-","-","-"
      });
        
      await waitForTransactionReceipt(config, { //report if the transaction was correct
        confirmations: 1,
        hash: txHash, //hash of the transaction written
      })

      setRegisterEvidence(false);
      toast.success('Evidence registered successfully!'); //notification user register evidence
      //refetch();

    } catch (error) {
        console.error(error);
        toast.error('Error registering evidence'); //notification user register evidence
        setRegisterEvidence(false);
    }

  };
  
    return (
      <div className='items-center'>
      <button className='bg-gray-600 text-white px-3 py-1 rounded-lg my-5 hover:bg-gray-800 text-3xl'
        disabled={isRegistering} onClick={registerEvidence}>
        {isRegistering ? 'Registering...' : 'Register Evidence Digital'}
      </button>
    </div>
    );
  };

export default Register;