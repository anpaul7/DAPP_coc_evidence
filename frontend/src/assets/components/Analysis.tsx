import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi } from '../../assets/abis/coc_evidence_digitalABI';
import { contractAddress_DE_deploy } from '../../assets/constants';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../../main';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FcDocument, FcFinePrint, FcFolder,  FcManager,  FcReuse } from 'react-icons/fc';
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
  const [file2, setFile2] = useState<File | null>(null); // state file
  const [file3, setFile3] = useState<File | null>(null); // state file
  const [fileName2, setFileName2] = useState('');
  const [fileName3, setFileName3] = useState('');
  const [showBlockchainTable, setShowBlockchainTable] = useState(false);
  const [showEvidenceDataTable, setShowEvidenceDataTable] = useState(true);
  const [showFirstForm, setShowFirstForm] = useState(false); 
  const [showUploadForm, setShowUploadForm] = useState(false); 
  const [showLeftSection, setShowLeftSection] = useState(true);
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
  const [blockchainEvidence, setBlockchainEvidence] = useState<any>(null);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [confirmDownloadTechnical, setDownloadTechnical] = useState(false);
  const [confirmDownloadExecutive, setDownloadExecutive] = useState(false);
  const [nextPhaseConfirmOpen, setNextPhaseConfirmOpen] = useState(false);
//----------------------------------------
  const [formData2, setFormData] = useState({
    userId: '',
    names: '',
    lastNames: '',
    userType: '',
    fileTechnicalReport: '',
    fileExecutiveReport: '',
  });
//----------------------------------------
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
const clearForm2 = () => { // clear box data form to default
  setFormData(prevState => ({
    ...prevState,
    fileTechnicalReport: '',
    fileExecutiveReport: '',
  }));
  setFile2(null);
  setFileName2('');
  setFile3(null);
  setFileName3('');
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
  data: blockchainData2,
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
        const filename = record.filePath.split('/').pop() || 'download';
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
  const downloadTechnical = async () => {
    const record = evidenceData.find(e => e._id === selectedEvidenceId);

    if (record && blockchainEvidence &&
      Array.isArray(blockchainEvidence) &&
      blockchainEvidence.length >= 3 &&
      blockchainEvidence[2]) {// validate technicalReport
      
      const token = localStorage.getItem('authToken');
      const fileTechnicalReport = blockchainEvidence[2].technicalReport;
      const technicalFilename = fileTechnicalReport.includes('/')
        ? fileTechnicalReport.split('/').pop()
        : fileTechnicalReport;
      
      console.log("Technical report filename:", technicalFilename);
      const fileUrl = `${API}/download2/${technicalFilename}`;
      const encodedUrl = encodeURI(fileUrl);
      console.log("Download URL:", encodedUrl);
      try {
        const response = await fetch(encodedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Download failed:", response.status, errorText);
          throw new Error('Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        console.log("Final filename to download:", technicalFilename);
        a.href = url;
        a.download = technicalFilename || 'download2';
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
const downloadExecutive = async () => {
    const record = evidenceData.find(e => e._id === selectedEvidenceId);

    if (record && blockchainEvidence &&
      Array.isArray(blockchainEvidence) &&
      blockchainEvidence.length >= 3 &&
      blockchainEvidence[2]) {// validate executiveReport
      
      const token = localStorage.getItem('authToken');
      const fileExecutiveReport = blockchainEvidence[2].executiveReport;
      const execFilename = fileExecutiveReport.includes('/')
        ? fileExecutiveReport.split('/').pop()
        : fileExecutiveReport;
      
      console.log("Executive report filename:", execFilename);
      const fileUrl = `${API}/download3/${execFilename}`;
      const encodedUrl = encodeURI(fileUrl);
      console.log("Download URL:", encodedUrl);
      try {
        const response = await fetch(encodedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Download failed:", response.status, errorText);
          throw new Error('Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        console.log("Final filename to download:", execFilename);
        a.href = url;
        a.download = execFilename || 'download3';
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
  const handleDownloadTechnical = () => {
    setDownloadTechnical(true);
  };
  const handleDownloadExecutive = () => {
    setDownloadExecutive(true);
  };
  //----------------------------------------
  const confirmDownload = async () => {
    setDownloadConfirmOpen(false);
    await downloadEvidence();
  };
  const confirmDownload2 = async () => {
    setDownloadTechnical(false);
    await downloadTechnical();
  };
  const confirmDownload3 = async () => {
    setDownloadExecutive(false);
    await downloadExecutive();
  };
  //----------------------------------------
  const handleFileChange2 = (e) => {
    const selectedFile = e.target.files[0];
    setFile2(selectedFile);
    if (selectedFile) {
      setFileName2(selectedFile.name);  // Update the fileName state
      console.log("Selected file:", selectedFile.name);
    }
  };
  //----------------------------------------
  const handleFileChange3 = (e) => {
    const selectedFile3 = e.target.files[0];
    setFile3(selectedFile3);
    if (selectedFile3) {
      setFileName3(selectedFile3.name);  // Update the fileName state
      console.log("Selected file:", selectedFile3.name);
    }
  };
  //----------------------------------------
  const uploadTechnicalReport= async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (!isConnected) {
      toast.error("Please connect your wallet", { autoClose: 2000 });
      return;
    }
    if (selectedEvidenceId === null) {
      toast.error("No evidence selected", { autoClose: 2000 });
      return;
    }
    if (!file2) {
      toast.error('No file selected', { autoClose: 2000 });
      return;
    }
    //validate file extension
    const nameParts = file2.name.split('.');
    const ext = nameParts.pop();
    if (!ext) {
      toast.error('The file does not have an extension', { autoClose: 2000 });
      return;
    }

    const fileExtension = `.${ext.toLowerCase()}`;
    if (fileExtension !== ".pdf" && fileExtension !== ".zip") {
      toast.error(`Incorrect file extension. Must be .pdf or .zip`, { autoClose: 2000 });
      return;
    }
    const formData = new FormData();
    formData.append('file', file2);
    
    const record = evidenceData.find(e => e._id === selectedEvidenceId);
    if (record) {
      // Add record data blockchain
      const originalFilename = record.filePath.split('/').pop();
      if (originalFilename) {
        // Replace "case_number" with "technical_report"
        const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        const technicalReportBaseName = baseName.replace("case_number", "technical_report");
        const technicalReportFilename = technicalReportBaseName + fileExtension;
        formData.append('technicalReportFilename', technicalReportFilename);
        console.log("filename:", technicalReportFilename);
      } else {
        toast.error("Error retrieving original filename", { autoClose: 2000 });
        return;
      }
    } else {
      toast.error("No record found for selected evidence", { autoClose: 2000 });
      return;
    }
    console.log("formData antes de enviar file:", formData);
    try {
      const response = await fetch(`${API}/uploadTechnicalReport`,{
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${tokenAuth}`
          },
        body: formData,
      });
      
      const data = await response.json();
      if(!response.ok){
        console.error('Error uploading file:', data.error);
        toast.error('Error uploading file', { autoClose: 2000 });
        return;
      }

      setFormData(prevState => ({// Update the filePath in the formData
        ...prevState,        
        fileTechnicalReport: data.file_path,
      }));

      console.log('Technical report successfully uploaded', data.file_path);
      toast.success('Technical report successfully uploaded', { autoClose: 2000 });
    } catch (error) {
      console.error('Error requesting technical report upload', error);
      toast.error('Error requesting technical report upload', { autoClose: 2000 });
    }
  };
  //----------------------------------------
  const uploadExecutiveReport = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    if (!isConnected) {
      toast.error("Please connect your wallet", { autoClose: 2000 });
      return;
    }
    if (selectedEvidenceId === null) {
      toast.error("No evidence selected", { autoClose: 2000 });
      return;
    }
    if (!file3) {
      toast.error('No file selected', { autoClose: 2000 });
      return;
    }
    // Validate file extension
    const nameParts = file3.name.split('.');
    const ext = nameParts.pop();
    if (!ext) {
      toast.error('The file does not have an extension', { autoClose: 2000 });
      return;
    }
  
    const fileExtension = `.${ext.toLowerCase()}`;
    if (fileExtension !== ".pdf" && fileExtension !== ".zip") {
      toast.error(`Incorrect file extension. Must be .pdf or .zip`, { autoClose: 2000 });
      return;
    }
    const formData = new FormData();
    formData.append('file', file3);
      
    const record = evidenceData.find(e => e._id === selectedEvidenceId);
    if (record) {
      // Add record data from blockchain
      const originalFilename = record.filePath.split('/').pop();
      if (originalFilename) {
        // Replace "case_number" with "executive_report"
        const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        const executiveReportBaseName = baseName.replace("case_number", "executive_report");
        const executiveReportFilename = executiveReportBaseName + fileExtension;
        formData.append('executiveReportFilename', executiveReportFilename);
        console.log("filename:", executiveReportFilename);
      } else {
        toast.error("Error retrieving original filename", { autoClose: 2000 });
        return;
      }
    } else {
      toast.error("No record found for selected evidence", { autoClose: 2000 });
      return;
    }
    console.log("formData before sending file:", formData);
    try {
      const response = await fetch(`${API}/uploadExecutiveReport`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${tokenAuth}`
        },
        body: formData,
      });
        
      const data = await response.json();
      if (!response.ok) {
        console.error('Error uploading file:', data.error);
        toast.error('Error uploading file', { autoClose: 2000 });
        return;
      }
  
      setFormData(prevState => ({
        ...prevState,        
        fileExecutiveReport: data.file_path,
      }));
  
      console.log('Executive report successfully uploaded', data.file_path);
      toast.success('Executive report successfully uploaded', { autoClose: 2000 });
    } catch (error) {
      console.error('Error requesting executive report upload', error);
      toast.error('Error requesting executive report upload', { autoClose: 2000 });
    }
  };
//----------------------------------------
  const uploadReports= async (e) => {
    e.preventDefault(); 
    if ( !formData2.fileTechnicalReport ) {
      toast.error('Technical report not uploaded, select file and upload.', { autoClose: 2000 });
      return;
    }
    if (!file2) {
        toast.error('No file selected', { autoClose: 2000 });
        return;
    }
    if ( !formData2.fileExecutiveReport ) {
      toast.error('Executive report not uploaded, select file and upload.', { autoClose: 2000 });
      return;
    }
    if (!file3) {
        toast.error('No file selected', { autoClose: 2000 });
        return;
    }
    console.log("prueba antes de cargar:", formData2);
    toast.success('Files successfully uploaded', { autoClose: 2000 });
    setShowEvidenceDataTable(false);
    setShowBlockchainTable(true);
    setShowFirstForm(false);
    setShowUploadForm(false);
  }
  //----------------------------------------
  const nextPhase2 = async () => {
    const newPhase = "Presentation"; 
    const newState = "Judicial Validation";
    const newStateUpdateDate = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Bogota'
    });
    const getMilliseconds = new Date();
    const milliseconds = String(getMilliseconds.getMilliseconds()).padStart(3, '0');
    const selectDate = `${newStateUpdateDate}.${milliseconds}`;

    if (selectedEvidenceId === null) {
      toast.error("No evidence selected", { autoClose: 2000 });
      return;
    }

    try {
      const currentTxHash = await writeTx2({
        address: contractAddress_DE_deploy,
        abi,
        functionName: "updatePresentationPhase",
        args: [selectedEvidenceId, newPhase, newState, selectDate, 
          formData2.fileTechnicalReport, formData2.fileExecutiveReport],
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

     //const currentTxHash ="0x0";
     console.log("Data form: ", formData2, selectDate);
     handleUpdateDB2(selectedEvidenceId, newPhase, newState, selectDate, 
      formData2.fileTechnicalReport, formData2.fileExecutiveReport, currentTxHash);
     clearForm();// clear box data form  
     clearForm2();
     await getEvidenceData(); //update table 1
    } catch (error) {
      console.error("Error updating phase:", error);
      toast.error("Error updating phase", { autoClose: 2000 });
    }
  };
  //----------------------------------------
  const handleUpdateDB2 = async (_selectedEvidenceId: number,
    _newPhase: string, _newState: string, _selectDate: string, 
    _technicalReport: string, _executiveReport: string, 
    _blockchainTxHash: string) => { 
    
    const nameUser = localStorage.getItem("user"); 
    try{  
      const response = await fetch(`${API}/updateEvidence2/${_selectedEvidenceId}`, { //submit data to server
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
            technicalReport: _technicalReport,
            executiveReport: _executiveReport,
            blockchainTxHash: _blockchainTxHash //hash of the transaction registered evidence in blockchain         
          })
        });

        const data = await response.json();
        
        if(!response.ok){
            throw new Error(`HTTP error! Status Update Evidence BD: ${response.status}`);
        }
        console.log("Success report data updated",data);
      
    }catch(error){
        console.error('Error:',error);
    }
  };
  //----------------------------------------
  const handleShowUploadForm= (e) => {
    e.preventDefault();
    setShowEvidenceDataTable(false);
    setShowBlockchainTable(false);
    setShowFirstForm(false);
    setShowUploadForm(true);
  };
  //----------------------------------------
  const handleNextPhaseButton = (e) => {
    e.preventDefault();
    if( !formData2.userId || !formData2.names || !formData2.lastNames || 
      !formData2.userType){
      toast.error('Please, fill all the fields', { autoClose: 2000 });
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
    await nextPhase2(); // Call update2 data blockchain
    await getEvidenceData(); //update table 1
    
    setShowBlockchainTable(false);
    setShowFirstForm(false);
    setShowUploadForm(false);
    setShowEvidenceDataTable(true);
  };
  const handlePhaseForm2 = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet", { autoClose: 2000 });
      return;
    }
    if (
      formData2.fileTechnicalReport === "" ||
      formData2.fileExecutiveReport === ""
    ) {
      toast.error("Please upload the reports before proceeding", { autoClose: 2000 });
      return;
    }

    setShowEvidenceDataTable(false);
    setShowBlockchainTable(false);
    setShowFirstForm(true);
    setShowUploadForm(false);
  }
//----------------------------------------
  const handleBack = () => { 
    clearForm2();
    setShowBlockchainTable(false);
    setShowEvidenceDataTable(true);
    setShowFirstForm(false);
    setShowUploadForm(false);
  };
  //----------------------------------------
  const handleBack2 = () => { 
    setShowBlockchainTable(true);
    setShowEvidenceDataTable(false);
    setShowFirstForm(false);
    setShowUploadForm(false);
    clearForm();
  };
  const handleBack3 = () => { 
    setShowBlockchainTable(true);
    setShowEvidenceDataTable(false);
    setShowFirstForm(false);
    setShowUploadForm(false);
    clearForm2();
    console.log("Back 3 clear: ", formData2);
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
              Preserved digital evidence is examined to extract information relevant to the forensic case.</h3>
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
      <div className="w-full max-w-[90%] mx-auto mt-1">
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
                  "Location", "Device", "User Id", "User Name", "User Type"
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

            <div className="w-full max-w-[80%]  mx-auto mt-1">
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
                    onClick={handlePhaseForm2}
                    type="button" 
                    className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !(
                        blockchainEvidence &&
                        Array.isArray(blockchainEvidence) &&
                        blockchainEvidence.length >= 3 &&
                        blockchainEvidence[2] &&
                        blockchainEvidence[2].phase === "Analysis" 
                      )
                    }
                  >
                  Presentation Phase
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

              <div className="flex justify-end  gap-4">
                <button
                  onClick={handleDownloadTechnical}
                  type="button" 
                  disabled={
                    (
                      blockchainEvidence &&
                      Array.isArray(blockchainEvidence) &&
                      blockchainEvidence.length >= 3 &&
                      blockchainEvidence[2] &&
                      blockchainEvidence[2].technicalReport=== "noFileTechnical" 
                    )
                  }
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  Download Technical Report
                </button>
                <button
                  onClick={handleDownloadExecutive}
                  type="button" 
                  disabled={
                    (
                      blockchainEvidence &&
                      Array.isArray(blockchainEvidence) &&
                      blockchainEvidence.length >= 3 &&
                      blockchainEvidence[2] &&
                      blockchainEvidence[2].executiveReport=== "noFileExecutive" 
                    )
                  }
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  Download Executive Report
                </button>
                <button
                  onClick={handleShowUploadForm}
                  type="button" 
                  disabled={
                    !(
                      blockchainEvidence &&
                      Array.isArray(blockchainEvidence) &&
                      blockchainEvidence.length >= 3 &&
                      blockchainEvidence[2] &&
                      blockchainEvidence[2].phase=== "Analysis" 
                    )
                  }
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Reports
                </button>
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
                                <th className="px-3 py-3 text-start text-base font-medium uppercase">
                                  Action
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
                                  <td className="px-3 py-4 whitespace-nowrap text-end text-sm font-medium">
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                      Verify
                                    </button>
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
              Information responsible for the change from phase to presentation</h2>      
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
                    <option value="Prosecutor">Prosecutor</option> 
                    <option value="Judge">Judge</option>                  
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
{/*----------------------*/}
      {showUploadForm && (
      <form className="w-[60%] bg-gray-50 rounded-7 px-8 p-6 pb-3 mt-4" id="form2">
          <div className="form-group border-b border-gray-300 pb-3 pt-2">
              <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
              Upload of technical and executive reports of forensic analysis performed on digital evidence</h2>      
          </div>

          <label htmlFor="fileType" className="text-2xl font-semibold text-lg text-gray-700">
            Technical report
          </label>
          <div className="col-span-full border-b border-gray-300 pb-3">
            <label htmlFor="fileType" className="text-1xl  text-lg text-gray-700">
              Select file
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-500 px-6 py-3 ">
              <div className="text-center">
                {fileName2 ? (
                    <span className="text-lg text-gray-700">{fileName2}</span>  // Show the selected file name
                  ) : (
                    <FcDocument aria-hidden="true" className="mx-auto size-14 text-gray-500"/>
                )}

                <div className="flex flex-col items-center justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span> Select a file</span>
                    <input id="file-upload" 
                          name="file" 
                          type="file" 
                          accept=".pdf,.zip"
                          className="sr-only"
                          onChange={handleFileChange2}
                    />      
                  </label>
                </div>
                <p className="text-xs/4 text-gray-600">  PDF or ZIP</p>
              </div>
            </div> 
        
            <div className="mt-6 flex items-center justify-end gap-x-3">
              <button
                type="submit"
                onClick={uploadTechnicalReport}  
                className="rounded-md bg-primary-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                Upload Report 1
              </button>
            </div>
          </div> 
          
          <label htmlFor="fileType2" className="text-2xl font-semibold text-lg text-gray-700">
            Executive report
          </label>
          <div className="col-span-full">
            <label htmlFor="fileType2" className="text-1xl  text-lg text-gray-700">
              Select file
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-3 ">
              <div className="text-center">
                {fileName3 ? (
                    <span className="text-lg text-gray-700">{fileName3}</span>  // Show the selected file name
                  ) : (
                    <FcDocument aria-hidden="true" className="mx-auto size-14 text-gray-300"/>
                )}

                <div className="flex flex-col items-center justify-center">
                  <label
                    htmlFor="file-upload2"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span> Select a file</span>
                    <input id="file-upload2" 
                          name="file" 
                          type="file" 
                          accept=".pdf,.zip"
                          className="sr-only"
                          onChange={handleFileChange3}
                    />      
                  </label>
                </div>
                <p className="text-xs/4 text-gray-600">  PDF or ZIP</p>
              </div>
            </div> 
        
            <div className="mt-6 flex items-center justify-end gap-x-3">
              <button
                type="submit"
                onClick={uploadExecutiveReport}  
                className="rounded-md bg-primary-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                Upload Report 2
              </button>
            </div>
          </div> 
          
          <div className="mt-6 flex items-center justify-center gap-x-6">
            <button 
              type="button" 
              onClick={handleBack3}
              className="rounded-md bg-red-500 px-4 py-1 text-sm-md font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Back
            </button>  
            <button
              type="submit"
              className="bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-indigo-600
              rounded-md px-3 py-1 text-sm-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={uploadReports}
            >
              Upload
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

{/* --- Download Technical Report Modal */}
  <Dialog
      open={confirmDownloadTechnical}
      onClose={() => setDownloadTechnical(false)}
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
                    Download Technical Report
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-lg text-gray-500">
                    Are you sure you want to download the technical report?
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
                onClick={confirmDownload2}
                className="bg-primary-600 text-white hover:bg-primary-700 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDownloadTechnical(false)}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
{/* --- Download Technical Report Modal */}
    <Dialog
      open={confirmDownloadExecutive}
      onClose={() => setDownloadExecutive(false)}
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
                    Download Executive Report
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-lg text-gray-500">
                    Are you sure you want to download the executive report?
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
                onClick={confirmDownload3}
                className="bg-primary-600 text-white hover:bg-primary-700 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDownloadExecutive(false)}
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
                    Do you want to shift digital evidence to the Presentation Phase?
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