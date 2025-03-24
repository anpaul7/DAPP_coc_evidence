import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { contractAddress_DE_deploy } from '../constants';
import { abi } from '../abis/coc_evidence_digitalABI';
import  React,{ useEffect, useState } from 'react';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../../main';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import {  FcButtingIn, FcDataProtection, FcDocument, FcFilingCabinet, FcFinePrint, FcFolder, FcInspection, FcKey, FcManager, FcMultipleDevices, FcNook,  FcPlanner, FcReadingEbook, FcReuse, FcSafe,  FcSupport, FcSurvey, FcTodoList } from 'react-icons/fc';

const API = import.meta.env.VITE_API_SERVER_FLASK;//URL server backend

function Identification () {

  //const [evidenceFound, setEvidenceFound] = useState(null);// evidence registered in db
  const [tokenAuth, setTokenAuth] = useState('');//authentication token
  const { isConnected } = useAccount(); //conect to wallet

  //use in button on click
  const [isRegistering, setRegisterEvidence] = useState(false); //state transaction blockchain register evidence
  const {writeContractAsync} = useWriteContract(); //hub wagmi write in contract
  
  // state hide and show forms
  const [showFirstForm, setShowFirstForm] = useState(true);  //show first form
  const [showSecondForm, setShowSecondForm] = useState(false); //hide second form
  const [showThirdForm, setShowThirdForm] = useState(false);
  // show and hide left section
  const [showLeftSection, setShowLeftSection] = useState(true);
  const [showLeftSectionTwo, setShowLeftSectionTwo] = useState(false);
  const [showLeftSectionThree, setShowLeftSectionThree] = useState(false);
//----------------------------------------
  const [file, setFile] = useState<File | null>(null); // state file
  const [fileName, setFileName] = useState('');

  const [open, setOpen] = useState(false); //dialog register evidence

//----------------------------------------
//----- validation evidence exists in BD
  const registerAsk = async (e) => { //use in button on click register evidence
    e.preventDefault(); 
    
    if( !formData2.methodAdquisition || !formData2.noteEvidence){
      toast.error('Please, fill all the fields', { autoClose: 1000 });
      return;  
    }

    try{

      const response = await fetch(`${API}/verify`, { //submit data to server
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${tokenAuth}`,
            'Content-Type':'application/json'
            },
          body: JSON.stringify({
            caseNumber: parseInt(formData2.caseNumber),
            hashEvidence: formData2.hashEvidence,          
          })
        });

        const data = await response.json();
        
        if(!response.ok){
            throw new Error(`HTTP error!: Verify evidence exists in BD: ${response.status}`);
        }
        if (!data.status) {
          setOpen(true);  // Evidence not exists, show dialog register
        } 
        //setEvidenceFound(data.status);//true or false evidence exists
        console.log("Response if evidence exists in BD ?: ", data.status);
        console.log(data.status);    
        
    }catch(error){
        console.error('Error verifying evidence in BD:',error);
    }
    //setOpen(true);// open dialog register evidence
  };
//----------------------------------------

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setFileName(selectedFile.name);  // Update the fileName state
      console.log("Selected file:", selectedFile.name);
    }
  };
//----------------------------------------
  const uploadEvidence = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (!isConnected) {
      toast.error("Please connect your wallet", { autoClose: 1500 });
      return;
    }

    if (!file) {
      toast.error('No file selected', { autoClose: 1500 });
      return;
    }
    if ( !formData2.caseNumber || !formData2.location ||
      !formData2.device || !formData2.evidenceType ) {
      toast.error('Please, fill all the fields', { autoClose: 1500 });
      return;
    }
    //validate file extension
    const nameParts = file.name.split('.');
    const ext = nameParts.pop();
    if (!ext) {
      toast.error('The file does not have an extension', { autoClose: 1500 });
      return;
    }
    const fileExtension = `.${ext.toLowerCase()}`;
    const extensionE = formData2.evidenceType.toLowerCase();

    if (fileExtension !== extensionE) {
      toast.error(`Incorrect selection of the file extension type.`, { autoClose: 1500 });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseNumber', formData2.caseNumber);
    console.log('Case number:', formData2.caseNumber);

    try {
      //const response = await fetch('http://localhost:5000/upload', {
      const response = await fetch(`${API}/upload`,{
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${tokenAuth}`
          },
        body: formData,
      });
      
      const data = await response.json();

      if (response.status === 402) {//if evidence exists in database
        toast.error('Error: Digital evidence already exists in the blockchain', { autoClose: 2000 }); 
        console.error('Error uploading file:', data.error);
        return;
      }else if(!response.ok){
        console.error('Error uploading file:', data.error);
        toast.error('Error uploading file', { autoClose: 2000 });
        return;
      }

      const currentDate = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Bogota'
      });
      const getMilliseconds = new Date();
      const milliseconds = String(getMilliseconds.getMilliseconds()).padStart(3, '0');
      const selectDate = `${currentDate}.${milliseconds}`;
  
      setFormData(prevState => ({
        ...prevState,        
        filePath: data.file_path,
        hashEvidence: data.file_hash,
        registrationDate: selectDate,
      }));

      console.log('File path:', data.file_path);
      console.log('File hash:', data.file_hash);
      toast.success('File uploaded successfully', { autoClose: 1000 });
      setShowLeftSection(false);
      setShowLeftSectionTwo(true);
      setShowLeftSectionThree(false);

      setTimeout(() => {
        setShowFirstForm(false);  // Hide the first form
        setShowSecondForm(true);  // Show the second form
        setShowThirdForm(false);
      }, 1000); // 4 seconds 

    } catch (error) {
      console.error('Error requesting file upload:', error);
      toast.error('Error requesting file upload');
    }
  };

  //----------------------------------------
  const [formData2, setFormData] = useState({
    caseNumber:'',
    location:'',
    device:'',
    evidenceType:'',

    userType: '',
    userId: '',
    names: '',
    lastNames: '',
    filePath: '',
    hashEvidence: '',
    registrationDate: '',

    methodAdquisition: '',
    noteEvidence: '',
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
      hashEvidence: '',
      caseNumber:'',
      location:'',
      device:'',
      evidenceType:'',
      filePath: '',
      registrationDate: '',

      methodAdquisition: '',
      noteEvidence: '',
      userId: '',
      names: '',
      lastNames: '',
      userType: "",
      
    }));

    setFile(null);
    setFileName('');

    // hide and show forms
    setTimeout(() => {
      setShowFirstForm(true);
      setShowSecondForm(false);
      setShowThirdForm(false);
    }, 1000); 
  };

  const handleBack1 = () => {  // clear box data form
    setTimeout(() => {
      setShowFirstForm(true);  // Hide the first form
      setShowSecondForm(false);  // Show the second form
      setShowThirdForm(false);
    }, 1000); // 4 seconds 
    console.log(formData2);
    toast.error("Back to Step 1", { autoClose: 1000 });
    setShowLeftSection(true);
    setShowLeftSectionTwo(false);
    setShowLeftSectionThree(false);    
  };
  const handleBack2 = () => {  // clear box data form
    setTimeout(() => {
      setShowFirstForm(false);  // Hide the first form
      setShowSecondForm(true);  // Show the second form
      setShowThirdForm(false);
    }, 1000); // 4 seconds 
    console.log(formData2);
    toast.error("Back to Step 2", { autoClose: 1000 });
    setShowLeftSection(false);
    setShowLeftSectionTwo(true);
    setShowLeftSectionThree(false);  
  };
  const handleNext1 = (e) => {  // clear box data form
    e.preventDefault();
    
  if( !formData2.methodAdquisition|| !formData2.noteEvidence|| 
    !formData2.userId || !formData2.names || !formData2.lastNames || !formData2.userType){
        toast.error('Please, fill all the fields', { autoClose: 1000 });
        return;
  }
    
    setTimeout(() => {
      setShowFirstForm(false);  // Hide the first form
      setShowSecondForm(false);  // Show the second form
      setShowThirdForm(true);
    }, 1000); // 4 seconds 
    console.log(formData2);
    toast.success("Next to Step 3", { autoClose: 1000 });
    setShowLeftSection(false);
    setShowLeftSectionTwo(false);
    setShowLeftSectionThree(true);  
  };
  //----------------------------------------
  const submitNewEvidence = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    setRegisterEvidence(true);
    setOpen(false);

    try {

      /*
      const evidenceData = [
        [0, parseInt(formData2.caseNumber), formData2.location, 
          formData2.device, formData2.evidenceType, formData2.filePath, 
          formData2.hashEvidence,formData2.registrationDate
        ], 
        [formData2.methodAdquisition, formData2.noteEvidence,
          parseInt(formData2.userId), formData2.names, 
          formData2.lastNames, formData2.userType
        ],
        ["Preservation","Custody",formData2.registrationDate,
          "noFileTechnical","noFileExecutive"
        ]
      ];

        const currentTxHash = await writeContractAsync({
        address: contractAddress_DE_deploy, //address of the contract deployed
        abi,
        functionName: "createEvidence", //function to call on the contract
        args: evidenceData, //args to pass 
        });
      
      if (!currentTxHash || !currentTxHash.startsWith('0x')) {
        console.error("Invalid transaction hash:", currentTxHash);
        toast.error("Invalid transaction hash");
        return;
      }

      const receiptCurrentTx = await waitForTransactionReceipt(config, { //report if the transaction was correct
        confirmations: 1,
        hash: currentTxHash, //hash of the transaction written
      });

      //----------------------------------------
      //extract currentId from event transaction receipt
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress_DE_deploy, abi, provider);

      const parsedLogs = receiptCurrentTx.logs.map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch (error) { // If the log cannot be parsed, return null
          return null;
        }
      }).filter(log => log !== null);
      // event created evidence the smart contract
      const createdEvent = parsedLogs.find(event => event.name === "createdDataEvidence");
      let currentId = -1;
      if (createdEvent) {
        currentId =  parseInt(createdEvent.args.id);
        console.log("CurrentId from event obtained: ", currentId);
      } else {
        console.log("Event 'createdED' not found in logs.",currentId);
      }

      */
      const currentTxHash ="0x0";
      const currentId = 100;
      handleInsertDB(currentTxHash, currentId); 
      setRegisterEvidence(false);

      console.log(formData2);
      toast.success('Evidence registered successfully!', { autoClose: 3000 }); //notification user register evidence 
      console.log("Finish: blockchainTxHash evidence registered: ", currentTxHash);
      clearForm();// clear box data form     
    } catch (error) {
      console.error(error);
      toast.error('Error registering evidence'); //notification user register evidence
      setRegisterEvidence(false);
    }
    setRegisterEvidence(false);
  };
  //---------------------------------
 
  //---- insert data digital evidence to database
  const handleInsertDB = async (_blockchainTxHash: string, _currentId: number) => { 
    try{
      const nameUser = localStorage.getItem("user"); 
      const response = await fetch(`${API}/insert`, { //submit data to server
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${tokenAuth}`,
            'Content-Type':'application/json'
            },
          body: JSON.stringify({            
            currentId: _currentId,
            caseNumber: parseInt(formData2.caseNumber),
            location: formData2.location,
            device: formData2.device,
            evidenceType: formData2.evidenceType,        
            filePath: formData2.filePath,
            hashEvidence: formData2.hashEvidence,
            registrationDate: formData2.registrationDate,

            methodAdquisition: formData2.methodAdquisition,
            noteEvidence: formData2.noteEvidence,
            userId: parseInt(formData2.userId),
            names: formData2.names,
            lastNames: formData2.lastNames,
            userType: formData2.userType,

            phase: 'Preservation',
            state: 'Custody',
            stateUpdateDate: 'noStateDate',
            technicalReport: 'noFileTechnical',
            executiveReport: 'noFileExecutive',
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
//-------------------------------------
useEffect(() => { //get token authentication
  const storedToken = localStorage.getItem("authToken");
  if (storedToken) {
    setTokenAuth(storedToken);
  }
}, []);
//-------------------------------------
return (

  <div className='w-full flex  min-h-screen bg-[#010f1f]'>
  
  {tokenAuth ? (
    <>
     {/* Section left   */}
     {showLeftSection && (
        <div className="w-[20%] flex flex-col items-center justify-center bg-neutral-900 text-white ">
          <div className="mb-4 mt-[-20px]">
            <h2 className="text-2xl font-semibold text-white text-center">
              Phase 1. Identification</h2><br/>
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
      {showLeftSectionTwo && (
        <div className="w-[20%] flex flex-col items-center justify-center bg-neutral-900 text-white p-8 ">
        <div className="mb-4 mt-[-20px]">
          <h2 className="text-2xl font-semibold text-white text-center">
            Phase 2. Acquisition</h2><br/>
            <h3 className='text-center text-gray-400 text-lg '>
            Extraction of the identified digital evidence, applying forensic techniques that guarantee the <strong>integrity and authenticity </strong>of the data.</h3>
        </div>
        <div className="mb-4">     
        </div>

        <div className="flex justify-center gap-1 mt-2">
            <FcReadingEbook className="size-20"/>
            <FcNook className="size-10" />
            <FcInspection className="size-10" />
        </div>
      </div>
    )}
    {showLeftSectionThree && (
      <div className="w-[20%] flex flex-col items-center justify-center bg-neutral-900 text-white p-8 ">
        <div className="mb-4 mt-[-20px]">
          <h2 className="text-2xl font-semibold text-white text-center">
            Phase 3. Preservation</h2><br/>
            <h3 className='text-center text-gray-400 text-lg '>
            <strong>Storing, maintaining and preserving</strong> digital evidence securely and in the exact condition in which it was acquired </h3>
        </div>
        <div className="mb-4">     
        </div>

        <div className="flex justify-center gap-1 mt-2">
          <FcSafe  className="size-20"/>
          <FcDataProtection  className="size-20" />
        </div>
      </div>
    )}


    {/* Section line */}
    <div className="w-[3px] bg-gray-800 shadow-2xl shadow-black/50 "></div>
    {/* Section right   */}
    <div className="w-[80%] flex flex-col justify-start items-center bg-[#010f1f] text-white p-1 mt-4">
       
        {showFirstForm && (
        <form className="w-[60%] bg-gray-50 rounded-7 px-8 p-5 pb-5" id="form0">    
              
              <div className="form-group border-b border-gray-300 pb-7">
                <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
                Step 1 - Identification of digital evidence</h2>      
              </div>

                  <div className="form-group border-b border-gray-300 pb-7">
                    <label htmlFor="caseNumber" className="text-2xl font-semibold text-lg text-gray-700">
                      Case record number:
                    </label>
                    <div className="mt-2 max-w-[95%]">
                      <input 
                        id="caseNumber"
                        name="caseNumber"
                        type="number"
                        value={formData2.caseNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/^0+/, ''); // Elimina ceros a la izquierda
                          if (/^\d*$/.test(value)) { // Solo permite números
                            handleChange({ target: { name: "caseNumber", value } });
                          }
                        }}
                        autoComplete="caseNumber"
                        className="block w-[50%] rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 sm:text-base/6"
                        placeholder="Enter case record id"
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group border-b border-gray-300 pb-7">
                  <label htmlFor="location" className="text-2xl font-semibold text-lg text-gray-700">
                    Location where evidence was found
                  </label>
                  <div className="mt-2 max-w-[98%]">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData2.location}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 sm:text-base/6 resize-none" 
                      placeholder="Describe the location where it was found"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                  <div className="form-group border-b border-gray-300 pb-7">
                    <label className="text-2xl font-semibold text-lg text-gray-700">
                      Evidence was extracted from:
                    </label>
                    
                    <div className="mt-2 flex justify-center space-x-6 max-w-[95%]">
                        {[
                          { value: "Computer", label: "Computer" },
                          { value: "Laptop", label: "Laptop" },
                          { value: "Hard disk", label: "Hard disk" },
                          { value: "USB", label: "USB" },
                          { value: "Cell phone", label: "Cell phone" },
                          { value: "Tablet", label: "Tablet" }
                        ].map((option) => (
                          <div key={option.value} className="flex flex-col items-center">
                            <input
                              id="device"
                              type="checkbox"
                              name="device"
                              value={option.value}
                              checked={formData2.device === option.value}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData2, device: option.value });
                                } else {
                                  setFormData({ ...formData2, device: "" });
                                }
                              }}
                              className="w-5 h-5 text-blue-600 border-2 border-gray-400 checked:border-blue-600 checked:bg-blue-600"
                               />
                            <span className="mt-1 text-sm text-gray-900 text-center">{option.label}</span>
                          </div>
                        ))}
                      </div>  
                    </div>

                

                <div className="form-group border-b border-gray-300 pb-7">
                    <label htmlFor="evidenceType" className="text-2xl font-semibold text-lg text-gray-700">
                      Type of evidence
                    </label>
                    <div className="mt-2 flex justify-center space-x-6 max-w-[95%]">
                        {[
                          { value: ".docx", label: ".docx" },
                          { value: ".xlsx", label: ".xlsx" },
                          { value: ".csv", label: ".csv" },
                          { value: ".pdf", label: ".pdf" },
                          { value: ".txt", label: ".txt" },
                          { value: ".zip", label: ".zip" },
                          { value: ".mp4", label: ".mp4" },
                          { value: ".jpg", label: ".jpg" },
                          { value: ".png", label: ".png" }
                        ].map((option) => (
                          <div key={option.value} className="flex flex-col items-center ">
                            <input
                              type="radio"
                              id="evidenceType"
                              name="evidenceType"
                              value={option.value}
                              checked={formData2.evidenceType === option.value}
                              onChange={handleChange}
                              className="w-5 h-5 
                              checked:border-blue-600 checked:bg-blue-600 
                              focus:outline focus:outline-2 focus:outline-offset-2"
                              required
                            />
                            <span className="mt-1 text-sm text-gray-900 text-center ">{option.label}</span>
                          </div>
                        ))}
                      </div>

                  </div>

            <div className="col-span-full">
              <label htmlFor="fileType" className="text-2xl font-semibold text-lg text-gray-700">
                Select file
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-500 px-6 py-3 ">
                <div className="text-center">
                  {fileName ? (
                      <span className="text-lg text-gray-700">{fileName}</span>  // Show the selected file name
                    ) : (
                      <FcDocument aria-hidden="true" className="mx-auto size-14 text-gray-300"/>
                  )}

                  <div className="flex flex-col items-center justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span> Upload a file</span>
                      <input id="file-upload" 
                            name="file" 
                            type="file" 
                            accept=".docx,.xlsx,.csv,.pdf,.mp4,.png,.jpg,.zip,.txt"
                            className="sr-only"
                            onChange={handleFileChange}
                      />      
                    </label>
                  </div>
                  <p className="text-xs/4 text-gray-600"> DOCX, XLSX, CSV, PDF, TXT, ZIP, MP4, JPG, PNG</p>
                </div>
              </div> 
          
              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                  type="submit"
                  onClick={uploadEvidence}  
                  className="rounded-md bg-primary-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                  Upload
                </button>
              </div>
            </div> 

          </form>
        )}

        {showSecondForm && (
          <form className="w-[60%] bg-gray-50 rounded-7 px-8 p-5 pb-10" id="form1">    

            <div className="form-group border-b border-gray-300 pb-7">
                <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
                Step 2 - Additional information for chain of custody</h2>      
            </div>

              <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="methodAdquisition" className="text-base/7 font-semibold text-gray-900 ">
                  Methods and instruments used in the acquisition:
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[98%]">
                  <FcSupport className="size-7"/>
                  <input
                    id="methodAdquisition"
                    name="methodAdquisition"
                    type="text"
                    value={formData2.methodAdquisition}
                    onChange={handleChange}
                    autoComplete="methodAdquisition"
                    className="block w-full rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                    required
                  />
                </div>
              </div> 
              
              <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="noteEvidence" className="text-base/7 font-semibold text-gray-900 ">
                  Annotation on the acquisition of digital evidence:
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[98%]">
                  <FcSurvey className="size-8"/>
                  <input
                    id="noteEvidence"
                    name="noteEvidence"
                    type="text"
                    value={formData2.noteEvidence}
                    onChange={handleChange}
                    autoComplete="noteEvidence"
                    className="block w-full rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6 resize-none"
                    required
                  />
                </div>
              </div>

            <div className="form-group border-b border-gray-300 pb-7 pt-7">
              <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
                Step 3 - Information responsible for obtaining digital evidence</h2>      
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
                  onClick={handleBack1}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm-md font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Back
                </button>  
                <button
                  type="submit"
                  className="bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-indigo-600
                  rounded-md px-3 py-2 text-sm-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={handleNext1}
                >
                  Next
                </button>
              </div>
          </form>

        )}
{/*----------------------------------------*/}
        {showThirdForm && (

          <form className="w-[60%] bg-gray-50 rounded-7 px-8 p-6 pb-3" id="form2">
              <div className="form-group border-b border-gray-300 pb-4">
                <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
                  Step 4 - Summary information for registration in the blockchain</h2>   
              </div>
              <div className="col-span-full"> 
                  
                <div className="form-group border-b border-gray-300 pb-4">
                  <label htmlFor="caseNumber" className="text-base/7 font-semibold text-gray-900 ">
                     Case number investigation:
                  </label>
                  <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                  <FcTodoList className="size-8" />
                    <input
                      type="text"
                      value={formData2.caseNumber}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-[50%] rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 sm:text-base/6 resize-none"
                      placeholder="Date of registration"
                      autoFocus
                      required
                      readOnly
                    />
                  </div>
                </div>

                  <div className="form-group border-b border-gray-300 pb-4">
                    <label htmlFor="file-path" className="text-base/7 font-semibold text-gray-900 ">
                      Name and path of storage of digital evidence:
                    </label>
                    <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                      <FcFilingCabinet className="size-8"/>
                      <input
                        id="filePath"
                        name="filePath"
                        type="text"
                        value={formData2.filePath}
                        onChange={handleChange}
                        autoComplete="filePath"
                        readOnly
                        className="block w-full rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                        required
                      />
                    </div>
                  </div> 

              <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="evidence2" className="text-base/7 font-semibold text-gray-900 ">
                  Device where digital evidence was extracted:
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                  <FcMultipleDevices className="size-8"/>
                  <input
                    type="text"
                    value={formData2.device}
                    className="block w-full rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                    required
                    readOnly
                  />
                </div>
              </div> 
              <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="hashEvidence" className="text-base/7 font-semibold text-gray-900 ">
                  Hash code generated from digital evidence:
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                  <FcKey className="size-8"/>
                  <textarea
                    id="hashEvidence"
                    name="hashEvidence"
                    value={formData2.hashEvidence}
                    onChange={handleChange}
                    autoComplete="hashEvidence"
                    readOnly
                    rows={2} // number of rows
                    className="block w-full rounded-md bg-white-100 px-3 py-1.5 text-base text-red-800 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6 resize-none"
                    required
                  />
                </div>
              </div>

              </div>
              <div className="form-group border-b border-gray-300 pb-4">
                  <label htmlFor="registrationDate" className="text-base/7 font-semibold text-gray-900 ">
                     Date of acquisition:
                  </label>
                  <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                  <FcPlanner className="size-8" />
                    <input
                      id="registrationDate"
                      name="registrationDate"
                      type="text"
                      value={formData2.registrationDate}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-[50%] rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 sm:text-base/6 resize-none"
                      placeholder="Date of registration"
                      autoFocus
                      required
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group border-b border-gray-300 pb-4">
                <label htmlFor="evidence1" className="text-base/7 font-semibold text-gray-900 ">
                  Responsible for obtaining digital evidence:
                </label>
                <div className="mt-2 flex items-center gap-2 text-base font-medium text-gray-900 max-w-[95%]">
                  <FcButtingIn className="size-8"/>
                  <input
                    type="text"
                    value={formData2.names+" "+formData2.lastNames}
                    className="block w-full rounded-md bg-white-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-base/6"
                    required
                    readOnly
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
                  onClick={registerAsk}
                  
                >
                  {isRegistering ? 'Registering...' : 'Register'}   
                </button>
              </div>
            

            {/* Confirmation transaction register evidence in blockchain*/}
              <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
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
                          <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                            <CheckCircleIcon aria-hidden="true" className="size-6 text-green-600" /> 
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 ">
                              Register Digital Evidence
                            </DialogTitle>
                            <div className="mt-2">
                              <p className="text-lg text-gray-500 ">
                              Are you sure you want to register digital evidence on the blockchain?.<br/>
                              This transaction cannot be undone.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:space-x-4 sm:space-x-reverse sm:px-6 justify-center items-center">
                      <button
                        type="button"
                        data-autofocus
                        onClick={submitNewEvidence}
                        className="bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-indigo-600
                        rounded-md px-3 py-2 text-sm-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Confirm
                      </button>   
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-md bg-red-500 px-4 py-2 text-sm-md font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Cancel
                      </button>
                                      
                      </div>
                    </DialogPanel>
                  </div>
                </div>
              </Dialog>

          </form>
        )}

      </div>
    </> 
  ) : (
    <h2 className="text-3xl text-white font-bold text-center flex-col">
      Login to Custody Block</h2>
  )}
  

  </div>

  );
};

export default Identification;
