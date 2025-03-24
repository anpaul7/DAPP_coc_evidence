
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract } from 'wagmi';
import { contractAddress_DE_deploy } from '../../assets/constants';
import { abi } from '../../assets/abis/coc_evidence_digitalABI';
import homeImage from '../../assets/images/CustodyBlock.png';
import { useEffect } from 'react';
import LoginForm from "../../assets/components/LoginUser"; 
import { toast } from 'react-toastify';

const API = import.meta.env.VITE_API_SERVER_FLASK;//URL server backend
interface HomeProps {
  tokenAuth: string | null;
  setTokenAuth: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
}

function Home({ tokenAuth, setTokenAuth, setUser, setRole}: HomeProps) {

  const { address, isConnected } = useAccount(); //conect to wallet

//---- authentication user
  const handleAuthenticateUser= async (user: string, password: string, resetFieldsLogin:()=>void) => { 
    try{
      const response = await fetch(`${API}/login`, { //submit data to server
          method: 'POST',
          headers:{
              'Content-Type':'application/json'
          },
          body: JSON.stringify({ user, password
              
            /*
            "user":"pedro", "password":"e10adc3949ba59abbe56e057f20f883e",
            "id":123, "name":"Pedross", "lastNames":"Perez", 
            "user":"pedro", "password":"123456", "role":"administrator"

            "id":456, "name":"Juan", "lastNames":"Torres", 
            "user":"juan", "password":"456", "role":"administrator"
            */          
          })
        });

        if(!response.ok){ //set variable in local storage and update state
          toast.error('Incorrect credentials. Try again!!!', { autoClose: 2000 });
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          setTokenAuth(null);
          setUser(null);
          setRole(null);
          throw new Error(`HTTP error login and token! Status: ${response.status}`);     
        }

        const data = await response.json();

        if (!data.access_token || !data.role) {
          toast.error('The session token has expired. Sign in again.', { autoClose: 2000 });
          throw new Error("The API did not return an access_token and role");
        }

        localStorage.setItem("authToken", data.access_token);//save token in local storage
        localStorage.setItem("user", user);//save user in local storage
        localStorage.setItem("role", data.role);
        setTokenAuth(data.access_token); //Update the tokenAuth state
        setUser(user);
        setRole(data.role);

        resetFieldsLogin(); //clear fields form login user
    }catch(error){
        console.error('Error authenticating user:',error);
    }
  };

  const {data:dataContract, isLoading: isLoadingContract } = useReadContract({ //hub to contract
    address: contractAddress_DE_deploy, //address of the contract deployed
    abi: abi,//abi of the contract
    functionName: "getNameContract", //function to call on the contract
    args: [], //args to pass to the function, args: [address],
  })
//--------------------------------
  // authentication component initialization page
  useEffect(() => {  
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setTokenAuth(storedToken);
    }
  }, [setTokenAuth]); // executed only once
//-- get wallet address in local storage
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem("walletAddress", address);
      //console.log("Wallet address stored:", address);
    }
  }, [isConnected, address]);
//--------------------------------

return (
<>
  <main className='w-full flex  min-h-screen ' >  
  {/* ------- Secction left */}
  <div className="w-1/2 flex flex-col justify-start bg-[#010f1f] text-white p-8">
  <div className="pt-20">
    <img
      src={homeImage}
      alt="CustodyBlock"
      className="w-30 h-auto mx-auto rounded-lg shadow-lg"
    />
  </div>
</div>   
  {/* ------- Section right 111827 bg-gray-950*/}
  <div className="w-1/2 flex flex-col justify-start items-center bg-[#111827] text-white p-1 mt-20">
    {!tokenAuth ? (
      <LoginForm onLogin={handleAuthenticateUser} />
    ) : (
      <>
      {/* Connect button for Metamask wallet */}
      <div className="flex flex-col items-center justify-center min-h-[60%]">
        <div className="mt-8">
          <ConnectButton />
        </div>

        <div>
          {isConnected ? (
            <div className="my-5 px-4 items-center text-center">
              <span> Wallet Address: </span>
              <p className="text-red-500">
                {isLoadingContract ? (
                  <span className="opacity-70 text-white">Loading...</span>
                ) : (
                  address
                )}
              </p>
            </div>
          ) : (
            <div className="text-1xl text-red-500 text-center flex-col">
              Connect your Metamask Wallet
            </div>
          )}
        </div>
      </div>
      </>
    )}
  </div>
</main>
</>
);
 
};
export default Home
