import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi } from '../../assets/abis/coc_evidence_digitalABI';
import { contractAddress_DE_deploy } from '../../assets/constants';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../../main';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FcFinePrint, FcFolder,  FcManager,  FcReuse } from 'react-icons/fc';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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

function Analysis() {


  const [tokenAuth, setTokenAuth] = useState('');//authentication token 
  const { isConnected } = useAccount(); //conect to wallet
  const {writeContractAsync: writeTx2} = useWriteContract(); //hub wagmi write in contract
  const [showBlockchainTable, setShowBlockchainTable] = useState(false);
  const [showEvidenceDataTable, setShowEvidenceDataTable] = useState(true);
  const [showFirstForm, setShowFirstForm] = useState(false);  //show first form
  const [showLeftSection, setShowLeftSection] = useState(true);
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
  const [blockchainEvidence, setBlockchainEvidence] = useState<any>(null);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [nextPhaseConfirmOpen, setNextPhaseConfirmOpen] = useState(false);
//----------------------------------------
  const [formData2, setFormData] = useState({
    userId: '',
    names: '',
    lastNames: '',
    userType: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
//----------------------------------------
const clearForm = () => { // clear box data form to default
  setFormData(prevState => ({
    ...prevState,
    userId: '',
    names: '',
    lastNames: '',
    userType: "",
  }));
};
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
      const data = result.data;
      
      let blockchainHash = "";
      if (Array.isArray(data) && data.length > 0) {
        const firstRecord = data[0];
        if (firstRecord && firstRecord.hashEvidence) {
          blockchainHash = firstRecord.hashEvidence;
        }
      }    
      const record = evidenceData.find(e => e._id === selectedEvidenceId);
      if (record) {
        if (record.hashEvidence !== blockchainHash) {
          toast.error("The evidence is not registered in the blockchain", { autoClose: 2000 });
          setBlockchainEvidence(null);
          return false;
        }
      }
      setBlockchainEvidence(data);
      return true;
    } catch (error) {
      console.error("Error fetching blockchain evidence:", error);
      toast.error("Error fetching blockchain evidence", { autoClose: 2000 });
      return false;
    }
  };
  //----------------------------------------
  const handleShowEvidence = async () => {
    if (selectedEvidenceId === null) {
      toast.error("Please select an evidence record.", { autoClose: 2000 });
      return;
    }
    const isValid = await getEvidenceBlockchain();
    if (isValid) {
      setShowBlockchainTable(true);
      setShowEvidenceDataTable(false);
    } else {
      setShowBlockchainTable(false);
    }
  };
  //----------------------------------------
  const downloadEvidence = async () => {
    const record = evidenceData.find(e => e._id === selectedEvidenceId);
    if (record && record.filePath) {// validate filePath exists
      const token = localStorage.getItem('authToken');
      const filename = record.filePath.split('/').pop();

      const fileUrl = `${API}/download/${filename}`;
      const encodedUrl = encodeURI(fileUrl);
      console.log("Download URL:", encodedUrl);
      console.log("file:", encodedUrl);
      try {
        const response = await fetch(encodedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Download failed:: ", response.status, errorText);
          throw new Error('Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        // Extrae el nombre del archivo
        const filename = record.filePath.split('/').pop() || 'download';
        console.log("file2:", filename);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast.error("Error downloading file", { autoClose: 2000 });
        console.error(error);
      }
    } else {
      toast.error("No file found for selected evidence", { autoClose: 2000 });
    }
  };
  //----------------------------------------
  const handleDownloadButton = () => {
    setDownloadConfirmOpen(true);
  };
  const confirmDownload = async () => {
    setDownloadConfirmOpen(false);
    await downloadEvidence();
  };
  //----------------------------------------
  const nextPhase = async () => {
    const newPhase = "Presentation"; 
    const newState = "Judicial Validation";
    const newStateUpdateDate = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Bogota'
    });
    const getMilliseconds = new Date();
    const milliseconds = String(getMilliseconds.getMilliseconds()).padStart(3, '0');
    const selectDate = `${newStateUpdateDate}.${milliseconds}`;

    if (selectedEvidenceId === null) {
      toast.error("No evidence selected", { autoClose: 1500 });
      return;
    }

    try {
      /* 
      const currentTxHash = await writeTx2({
        address: contractAddress_DE_deploy,
        abi,
        functionName: "updatePhase",
        args: [selectedEvidenceId, newPhase, newState, selectDate],
      });

      if (!currentTxHash || !currentTxHash.startsWith("0x")) {
        console.error("Invalid transaction hash:", currentTxHash);
        toast.error("Invalid transaction hash");
        return;
      }

      const receiptCurrentTx = await waitForTransactionReceipt(config, {
        confirmations: 1,
        hash: currentTxHash,
      });
 
      toast.success("Phase updated successfully", { autoClose: 2000 });
       */
     const currentTxHash ="0x0";
     console.log("Data form: ", formData2, selectDate);
     handleUpdateDB(selectedEvidenceId, newPhase, newState, selectDate, currentTxHash);
     await getEvidenceData(); //update table 1
     clearForm();// clear box data form  
    } catch (error) {
      console.error("Error updating phase:", error);
      toast.error("Error updating phase", { autoClose: 2000 });
    }
  };
  //----------------------------------------
  const handleUpdateDB = async (_selectedEvidenceId: number,
    _newPhase: string, _newState: string, _selectDate: string, _blockchainTxHash: string) => { 
    
    const nameUser = localStorage.getItem("user"); 
    try{  
      const response = await fetch(`${API}/updateEvidence/${_selectedEvidenceId}`, { //submit data to server
          method: 'PUT',
          headers: {
            "Authorization": `Bearer ${tokenAuth}`,
            'Content-Type':'application/json'
            },
          body: JSON.stringify({            
            id: _selectedEvidenceId,
            phase: _newPhase,
            state: _newState,
            stateUpdateDate: _selectDate,
            userId: parseInt(formData2.userId),
            names: formData2.names,
            lastNames: formData2.lastNames,
            userType: formData2.userType,
            nameUser: nameUser,
            blockchainTxHash: _blockchainTxHash //hash of the transaction registered evidence in blockchain         
          })
        });

        const data = await response.json();
        
        if(!response.ok){
            throw new Error(`HTTP error! Status Register Evidence BD: ${response.status}`);
        }
        console.log("Success report data registered",data);
      
    }catch(error){
        console.error('Error:',error);
    }
  };
  //----------------------------------------
  const handleNextPhaseButton = (e) => {
    e.preventDefault();
    if( !formData2.userId || !formData2.names || !formData2.lastNames || !formData2.userType){
      toast.error('Please, fill all the fields', { autoClose: 1000 });
      return;  
    }
    setFormData(prevState => ({
      ...prevState,        
      userId: formData2.userId,
      names: formData2.names,
      lastNames: formData2.lastNames,
      userType: formData2.userType
    }));
    setNextPhaseConfirmOpen(true);
  };
  //----------------------------------------
  const confirmNextPhase = async (e) => {
    e.preventDefault();
    setNextPhaseConfirmOpen(false);
    await nextPhase(); // Call update data blockchain

    setShowEvidenceDataTable(true);
    setShowBlockchainTable(false);
    setShowFirstForm(false);

  };
  const handlePhaseForm = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet", { autoClose: 2000 });
      return;
    }
    setShowEvidenceDataTable(false);
    setShowBlockchainTable(false);
    setShowFirstForm(true);
  }
  //----------------------------------------
  const handleBack = () => { 
    setShowBlockchainTable(false);
    setShowEvidenceDataTable(true);
    setShowFirstForm(false);
  };
  //----------------------------------------
  const handleBack2 = () => { 
    setShowBlockchainTable(true);
    setShowEvidenceDataTable(false);
    setShowFirstForm(false);
    clearForm();
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
              Phase 4. Analysis</h2><br/>
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
    
    {showEvidenceDataTable && ( 
      <div className="w-full max-w-[90%] mx-auto mt-4">
        <h1 className='text-xl text-white font-bold text-center flex-col'>
        List of registered evidences  </h1>    
        <div className="flex justify-left">
          <button
            onClick={handleShowEvidence}
            type="button"
            className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Show evidence
          </button>
        </div>
      </div>
    )}
    {showEvidenceDataTable && ( 
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
    )}

  {/*----------------------------------------*/}    
      {showBlockchainTable && (
        <>
          {Array.isArray(blockchainEvidence) &&
            blockchainEvidence.length > 0 ? (

            <div className="w-full max-w-[80%]  mx-auto mt-6">
              <h2 className="text-xl font-bold text-white text-center mb-4">
              ID {"["+selectedEvidenceId+"]"} : Evidence status recorded in blockchain 
              </h2>
              <div className="flex justify-end mt-4 gap-4">
                <button
                  onClick={handleBack}
                  type="button" 
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  To Back
                </button>
                <button 
                  onClick={handleDownloadButton}
                  type="button" 
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Download Evidence
                </button>
                <button 
                    onClick={handlePhaseForm}
                    type="button" 
                    className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !(
                        blockchainEvidence &&
                        Array.isArray(blockchainEvidence) &&
                        blockchainEvidence.length >= 3 &&
                        blockchainEvidence[2] &&
                        blockchainEvidence[2].phase === "preservation"
                      )
                    }
                  >
                  Analysis Phase
                </button>
              </div>
              <div className="inline-block min-w-full py-2">
                <div className="overflow-hidden border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-800">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 z-10 border-b bg-[#455a64] text-white">
                    <tr>
                      <th className="px-3 py-3 text-start text-base font-medium uppercase">
                        Description
                      </th>
                      <th className="px-3 py-3 text-start text-base font-medium uppercase">
                        Evidence data recorded on the blockchain
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                      {blockchainEvidence.map((item, index) => (
                        <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50">
                          <td className="px-3 py-4 text-base text-gray-800">
                            Information {index + 1}
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
              </div>

              {(() => {
                const record = evidenceData.find(e => e._id === selectedEvidenceId);
                if (record && record.transactions && record.transactions.length > 0) {
                  return (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-white text-center mb-2">
                        Report on transactions made on the Blockchain
                      </h3>
                      <div className="inline-block min-w-full py-2">
                        <div className="overflow-hidden border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-800">
                          <table className="w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10 border-b bg-[#455a64] text-white">
                              <tr>
                                <th className="px-3 py-3 text-start text-base font-medium uppercase">
                                Transaction
                                </th>
                                <th className="px-3 py-3 text-start text-base font-medium uppercase">
                                Description Data
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {record.transactions.map((tx, i) => (
                                <tr key={i} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50">
                                  <td className="px-3 py-4 text-base text-gray-800">
                                    Transaction {i}
                                  </td>
                                  <td className="px-3 py-4 text-base text-gray-800">
                                    {Object.entries(tx).map(([key, value]) => (
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
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
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

      {/*----------------------------------------*/}
      {showFirstForm && (

      <form className="w-[60%] bg-gray-50 rounded-7 px-8 p-6 pb-3 mt-10" id="form2">
          <div className="form-group border-b border-gray-300 pb-7 pt-7">
              <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
                Information responsible for the phase change</h2>      
            </div>

              <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="userId" className="text-base/7 font-semibold text-gray-900 ">
                  Identification:
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                  <FcManager className="size-9" />
                  <input     
                    id="userId"
                    name="userId"
                    type="number"
                    value={formData2.userId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/^0+/, ''); // Elimina ceros a la izquierda
                      if (/^\d*$/.test(value)) { // Solo permite números
                        handleChange({ target: { name: "userId", value } });
                      }
                    }}
                    autoComplete="userId"
                    className="block w-[40%] rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                    placeholder="Enter your ID"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6 form-group border-b border-gray-300 pb-4">
                <div className="sm:col-span-3">
                  <label htmlFor="names" className="text-base/7 font-semibold text-gray-900 ">
                    Names:
                  </label>
                  <div className="mt-2 max-w-[95%]">
                    <input
                      id="names"
                      name="names"
                      value={formData2.names}
                      onChange={handleChange}
                      type="text"
                      autoComplete="names"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                      placeholder="Enter your names"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastNames" className="text-base/7 font-semibold text-gray-900 ">
                    Last names:
                  </label>
                  <div className="mt-2 max-w-[95%]">
                    <input
                      id="lastNames"
                      name="lastNames"
                      type="text"
                      value={formData2.lastNames}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                      placeholder="Enter your lastNames"
                      autoFocus
                      required
                    />
                  </div>
                </div>
              </div> 

              <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="userType" className="text-base/7 font-semibold text-gray-900 ">
                  User type:
                </label>
                <div className="relative max-w-[46%] mt-2">
                  <select
                    id="userType"
                    name="userType"
                    value={formData2.userType}
                    onChange={handleChange}
                    autoComplete="userType"
                    className="w-full appearance-none rounded-md bg-white py-1.5 
      pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 
      focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 
      sm:text-1xl"
                    autoFocus
                    required 
                  >
                    <option value="" disabled >Select a user type</option>
                    <option value="Forensic Expert">Forensic Expert</option>
                    <option value="Forensic Investigator">Forensic Investigator</option>
                    <option value="Police Officer">Police Officer</option>                  
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className=" absolute right-2 top-1/2 transform -translate-y-1/2 size-5 text-gray-500"
                  />
                </div>
              </div>
          <div className="mt-6 flex items-center justify-center gap-x-6">
            <button 
              type="button" 
              onClick={handleBack2}
              className="rounded-md bg-red-500 px-4 py-2 text-sm-md font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Back
            </button>  
            <button
              type="submit"
              className="bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-indigo-600
              rounded-md px-3 py-2 text-sm-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={handleNextPhaseButton}
              
            >
              Next Phase   
            </button>
          </div>
      </form>
      )}
    </div>
    </> 
  ) : (
    <h2 className="text-3xl text-white font-bold text-center flex-col">
      Login to Custody Block</h2>
  )}
{/* --- Download Evidence Modal */}
<Dialog
      open={downloadConfirmOpen}
      onClose={() => setDownloadConfirmOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <InformationCircleIcon aria-hidden="true" className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                    Download Evidence
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-lg text-gray-500">
                    Are you sure you want to download the digital evidence?
                      <br />
                      Click on confirm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:space-x-4 sm:space-x-reverse sm:px-6 justify-center items-center">
              <button
                type="button"
                onClick={confirmDownload}
                className="bg-primary-600 text-white hover:bg-primary-700 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDownloadConfirmOpen(false)}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

  {/* --- Next Phase Modal */}
    <Dialog
      open={nextPhaseConfirmOpen}
      onClose={() => setNextPhaseConfirmOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <InformationCircleIcon aria-hidden="true" className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                    Next Phase
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-lg text-gray-500">
                    Do you want to shift digital evidence to the Analysis Phase?
                      <br />
                      Click on confirm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:space-x-4 sm:space-x-reverse sm:px-6 justify-center items-center">
              <button
                type="button"
                onClick={confirmNextPhase}
                className="bg-primary-600 text-white hover:bg-primary-700 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setNextPhaseConfirmOpen(false)}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </div>
  ); 
};

export default Analysis