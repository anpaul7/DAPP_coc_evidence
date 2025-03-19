import { useAccount, useConnect, useReadContract } from 'wagmi';
import { abi } from '../../assets/abis/coc_evidence_digitalABI';
import { contractAddress_DE_deploy } from '../../assets/constants';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {  FcDocument,  FcFinePrint, FcFolder,  FcReuse } from 'react-icons/fc';
import { TransactionSerialized } from 'viem';

const API = import.meta.env.VITE_API_SERVER_FLASK;//URL server backend

interface Transaction {
  txId: number;
  blockchainTxHash: string;
  phase: string;
  state: string;
  txDate: string;
}
interface EvidenceData {
  _id: number;
  caseNumber: number;
  location: string;
  device: string;
  evidenceType: string;
  hashEvidence: string;
  filePath: string;
  methodAdquisition: string;
  noteEvidence: string;
  userId: number;
  names: string;
  lastNames: string;
  userType: string;
  transactions: Transaction[];
}


function Preservation() {

  const [tokenAuth, setTokenAuth] = useState('');//authentication token 
  const [showTableEvidenceBC, setShowTableEvidenceBC] = useState(true);  //show first form
  const [showLeftSection, setShowLeftSection] = useState(true);
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
  const [blockchainEvidence, setBlockchainEvidence] = useState<any>(null);
//----------------------------------------
//----------------------------------------
//----------------------------------------
  const getEvidenceData = async () => {
    try {
      const response = await fetch(`${API}/getEvidenceData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        }
      });
      if (!response.ok) {
        throw new Error('Error fetching evidence data');
      }
      const data = await response.json();
      setEvidenceData(data);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast.error("Error fetching evidences", { autoClose: 2000 });
    }
  };
//----------------------------------------
const {
  data: blockchainData,
  refetch: refetchBlockchain, //get data blockchain
} = useReadContract({
  address: contractAddress_DE_deploy,
  abi: abi,
  functionName: "recordsEvidence",
  args: selectedEvidenceId !== null ? [selectedEvidenceId] : []
});
//--------------------------- get evidence data blockchain
  const getEvidenceBlockchain = async () => {
    if (selectedEvidenceId === null) {
      toast.error("Please select an evidence record.", { autoClose: 2000 });
      return;
    }
    try {
      const result = await refetchBlockchain();
      setBlockchainEvidence(result.data);
      console.log("blockchainData:", blockchainData);
    } catch (error) {
      console.error("Error fetching blockchain evidence:", error);
      toast.error("Error fetching blockchain evidence", { autoClose: 2000 });
    }
  };

  //-------------------------------------
  useEffect(() => { //get token authentication
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setTokenAuth(storedToken);
    }
  }, []);
  //-------------------------------------
  useEffect(() => {
    if (tokenAuth) {
      getEvidenceData();
    }
  }, [tokenAuth]);
  //----------------------------------------

//---------------------------------------- 
return (

  <div className='w-full flex  min-h-screen bg-[#010f1f]'>
  
  {tokenAuth ? (
    <>
     {/* Section left   */}
     {showLeftSection && (
        <div className="w-[20%] flex flex-col items-center justify-center bg-neutral-900 text-white ">
          <div className="mb-4 mt-[-20px]">
            <h2 className="text-2xl font-semibold text-white text-center">
              Phase 3. Analysis</h2><br/>
              <h3 className='text-center text-gray-400 text-lg '>
              Identification, classification and collection of digital evidence for forensic investigation.</h3>
          </div>
          <div className="mb-4">     
          </div>

          <div className="flex justify-center gap-1 mt-2">
            <FcReuse className="size-20"/>
            <FcFinePrint className="size-10" />
            <FcFolder className="size-10" />
          </div>
        </div>
      )}
    {/*----------------------------*/}
      
    {/* Section line */}
    <div className="w-[3px] bg-gray-800 shadow-2xl shadow-black/50 "></div>
    {/* Section right   */}


    <div className="w-[80%] flex flex-col justify-start items-center bg-[#010f1f] text-white p-1 mt-3">
       
      <h1 className='text-xl text-white font-bold text-center flex-col'>
      Chain-of-Custody Digital Evidence</h1>
      <table className="w-[90%] divide-y divide-gray-200">
        <tbody>
          <tr>
            <td className="px-1 py-4 text-center" colSpan={16}>
              <div className="flex justify-left gap-4">
                <button 
                  onClick={getEvidenceBlockchain}
                  type="button" 
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Show evidence
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="w-full max-w-[90%] overflow-x-auto mx-auto mt-2">    
      
        <div className="inline-block min-w-full py-1 ">
          
          <div className="overflow-x-auto overflow-y-auto max-h-[320px] border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-[1400px] divide-y divide-gray-200">
              <thead className="sticky top-0 z-10 border-b bg-[#455a64] font-medium text-white dark:border-neutral-500 dark:bg-neutral-900">
                <tr>
                <th className="sticky left-0 z-20 w-16 px-1 py-3 text-start text-base font-medium text-white uppercase">
                  Select ID
                </th>
                {["Evidence Id", "Case Number", "Phase", "State", "Tx Date", "Evidence Type",
                  "File Path", "Hash Evidence", "Method Adquisition", "Note Evidence", 
                  "Location", "Device", "User Id", "User Name", "User Type","Action"
                  ].map((header, index) => (
                    <th
                      key={index}
                      className={`px-3 py-3 text-start text-base font-medium text-white uppercase ${
                        index === 0
                          ? "sticky left-16 z-20 " : ""
                      }`}
                      >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evidenceData.length > 0 ? (
                  evidenceData.map((dataE, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50">
                    <td className="px-2 py-4 whitespace-nowrap text-base">
                      <div className="flex items-center h-5">
                        <input
                          id={`hs-table-checkbox-${index}`}
                          type="checkbox"
                          checked={selectedRow === index}
                          onChange={() => {
                            setSelectedRow(index);
                            setSelectedEvidenceId(dataE._id);
                          }}
                          className="accent-blue-600 border-gray-200 rounded-sm focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-base font-medium text-gray-800">
                      {dataE._id}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-base text-gray-800">
                      {dataE.caseNumber}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-base text-gray-800">
                      {dataE.transactions && dataE.transactions.length > 0
                        ? dataE.transactions[dataE.transactions.length - 1].phase
                        : ""}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-base text-gray-800">
                      {dataE.transactions && dataE.transactions.length > 0
                          ? dataE.transactions[dataE.transactions.length - 1].state
                          : ""}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.transactions && dataE.transactions.length > 0
                            ? dataE.transactions[dataE.transactions.length - 1].txDate
                            : ""}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.evidenceType}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.filePath}
                    </td>
                    <td className="px-3 py-4  whitespace-pre-wrap break-words text-sm text-gray-800">
                      {dataE.hashEvidence}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.methodAdquisition}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.noteEvidence}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-base text-gray-800">
                      {dataE.location}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.device}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.userId}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.names+" "+dataE.lastNames}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                      {dataE.userType}
                    </td>
                    {[...Array(1)].map((_, i) => (
                      <td key={i} className="px-3 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button
                          type="button"
                          className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Verify
                        </button>
                      </td>
                    ))}
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-6 py-4 text-center text-sm text-gray-500">
                      No evidence found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div> 
        </div>
      </div>
  {/*----------------------------------------*/}    
      {showTableEvidenceBC && (
        <>
          {Array.isArray(blockchainEvidence) &&
            blockchainEvidence.length > 0 ? (

            <div className="w-full max-w-[80%]  mx-auto mt-6">
              <h2 className="text-xl font-bold text-white text-center mb-4">
                Description status of evidence recorded in the blockchain
              </h2>
              <div className="inline-block min-w-full py-2">
                <div className="overflow-hidden border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-800">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 z-10 border-b bg-[#455a64] text-white">
                    <tr>
                      <th className="px-3 py-3 text-start text-base font-medium uppercase">
                        Description
                      </th>
                      <th className="px-3 py-3 text-start text-base font-medium uppercase">
                        Data Evidence
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                      {blockchainEvidence.map((item, index) => (
                        <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50">
                          <td className="px-3 py-4 text-base text-gray-800">
                            Registro {index + 1}
                          </td>
                          <td className="px-3 py-4 text-base text-gray-800">
                            {Object.entries(item).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                </div>
                <table className="w-[90%] divide-y divide-gray-200 justify-right ">
                <tbody>
                  <tr>
                    <td className="px-1 py-4 text-center" colSpan={16}>
                      <div className="flex justify-right gap-4">
                        <button 
                          onClick={getEvidenceBlockchain}
                          type="button" 
                          className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                          To Back
                        </button>
                        <button 
                          onClick={getEvidenceBlockchain}
                          type="button" 
                          className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                          Get Evidence
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
              
            </div>
          ) : (
            <div className="w-full max-w-[90%] mx-auto mt-6">
              <div className="bg-gray-700 p-4 text-white text-center">
                Record not found in blockchain
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </> 
  ) : (
    <h2 className="text-3xl text-white font-bold text-center flex-col">
      Por favor, inicie sesión</h2>
  )}
  </div>
  );
};

export default Preservation