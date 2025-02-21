import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useReadContract, useWriteContract } from 'wagmi';
import { contractAddress_DE_deploy } from '../constants';
import { abi } from '../abis/coc_evidence_digitalABI';
import  React,{ useEffect, useRef, useState } from 'react';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../../main';
import { toast } from 'react-toastify';

import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FcAudioFile, FcDataEncryption, FcDataRecovery, FcDocument, FcFinePrint, FcFolder, FcImageFile, FcMultipleDevices } from 'react-icons/fc';

const API = import.meta.env.VITE_API_SERVER_FLASK;//URL server backend

function Acquisition () {

  const [txHash, setTxHash] = useState('');// hash of the transaction registered evidence
  //const [evidenceFound, setEvidenceFound] = useState(null);// evidence registered in db
  const [tokenAuth, setTokenAuth] = useState('');//authentication token 

  //use in button on click
  const [isRegistering, setRegisterEvidence] = useState(false); //state transaction blockchain register evidence
  const {writeContractAsync} = useWriteContract(); //hub wagmi write in contract
  
  // state hide and show forms
  const [showFirstForm, setShowFirstForm] = useState(true);  //show first form
  const [showSecondForm, setShowSecondForm] = useState(false); //hide second form

//----------------------------------------
  const [file, setFile] = useState(null); // state file
  const [fileName, setFileName] = useState('');

  const [open, setOpen] = useState(false); //dialog register evidence
  const [open2, setOpen2] = useState(false); //dialog evidence found in db

//----------------------------------------
//----- revisar posiblemente quitar
  const registerAsk = async (e) => { //use in button on click register evidence
    e.preventDefault(); 

    try{

      const response = await fetch(`${API}/verify`, { //submit data to server
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${tokenAuth}`,
            'Content-Type':'application/json'
            },
          body: JSON.stringify({
            id: formData2.fileHash,          
          })
        });

        const data = await response.json();
        
        if(!response.ok){
            throw new Error(`HTTP error!: Verify evidence exists in BD: ${response.status}`);
        }
        if (data.status) {
          setOpen2(true); // Evidence exists, show dialog no register
        } else {
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
  const handleUploadFile = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!file) {
      toast.error('No file selected', { autoClose: 2000 });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

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

      if(!response.ok){
        console.error('Error uploading file:', data.error);
        toast.error('Error uploading file', { autoClose: 2000 });
        
        if (response.status === 402) {//if evidence exists in database
          setOpen2(true); // Show dialog
        }
        return;
      }

      const currentDate = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Bogota'
      });

      const getMilliseconds = new Date();
      const milliseconds = String(getMilliseconds.getMilliseconds()).padStart(3, '0');
    
      const getDate = `${currentDate}.${milliseconds}`;

      setFormData(prevState => ({
        ...prevState,
        filePath: data.file_path,
        fileHash: data.file_hash,
        userType: '',
        idType: '',
        id: '',
        names: '',
        lastNames: '',
        datepicker: getDate
      }));

      console.log('File path:', data.file_path);
      console.log('File hash:', data.file_hash);
      toast.success('File uploaded successfully', { autoClose: 2000 });

      //setOpen(true);  // Evidence not exists, show dialog register
 
      setTimeout(() => {
        setShowFirstForm(false);  // Hide the first form
        setShowSecondForm(true);  // Show the second form
      }, 1000); // 4 seconds 

    } catch (error) {
      console.error('Error requesting file upload:', error);
      toast.error('Error requesting file upload');
    }
  };

  //----------------------------------------
  const [formData2, setFormData] = useState({
    userType: '',
    idType: '',
    id: '',
    names: '',
    lastNames: '',
    filePath: '',
    fileHash: '',
    datepicker: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
//----------------------------------------
  const redirectForm = () => { // redirect to form1 register evidence 
    toast.error("Redirect to Stage 1");
    clearForm();
    setOpen2(false)
  };
//----------------------------------------
  const clearForm = () => { // clear box data form to default
    setFormData(prevState => ({
      ...prevState,
      userType: "",
      idType: '',
      id: '',
      names: '',
      lastNames: '',
      filePath: '',
      fileHash: '',
      datepicker: ''
    }));

    setFile(null);
    setTxHash('');
    setFileName('');

    // hide and show forms
    setTimeout(() => {
      setShowFirstForm(true);
      setShowSecondForm(false);
    }, 1000); 

    console.log(formData2);
  };

  const handleCancel2 = () => {  // clear box data form

    setFormData(prevState => ({
      ...prevState,
      userType: "",
      idType: '',
      id: '',
      names: '',
      lastNames: '',
      datepicker: ''
    }));
    
    console.log(formData2);
  };
//----------------------------------------

  //---- date
 
  //-------- end date

  //----------------------------------------
  const registerEvidence = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    setRegisterEvidence(true);
  
    setOpen(false);

    /*
    setRegisterEvidence(true);

    try {
        txHash = await writeContractAsync({
        address: contractAddress_DE_deploy, //address of the contract deployed
        abi,
        functionName: "createEvidence", //function to call on the contract
        args: [formData2.userType, formData2.idType, parseInt(formData2.id),
          formData2.names, formData2.lastNames, formData2.fileHash,
          formData2.filePath, formData2.datepicker], //args to pass to the function, args: [address],
      });
        
      await waitForTransactionReceipt(config, { //report if the transaction was correct
        confirmations: 1,
        hash: txHash, //hash of the transaction written
      })
  
      setRegisterEvidence(false);

      
      console.log(formData2);
      
      setShowFirstForm(true);
      setShowSecondForm(false);

      //refetch();

    } catch (error) {
      console.error(error);
      toast.error('Error registering evidence'); //notification user register evidence
      setRegisterEvidence(false);
    }
      */
    console.log(formData2);

    handleInsertDB(); 

    toast.success('Evidence registered successfully!'); //notification user register evidence 

    console.log("txHash evidence registered: ", txHash);
    clearForm();// clear box data form
    setFile(null);
     
    setRegisterEvidence(false);
    console.log("Finish register evidence in blockchain");
  };
  //---------------------------------
 
  //---- insert data digital evidence to database
  const handleInsertDB = async () => { 
    try{

      const response = await fetch(`${API}/insert`, { //submit data to server
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${tokenAuth}`,
            'Content-Type':'application/json'
            },
          body: JSON.stringify({
            userType: formData2.userType,
            idType: formData2.idType,
            id: formData2.id,
            names: formData2.names,
            lastNames: formData2.lastNames,
            fileHash: formData2.fileHash,
            filePath: formData2.filePath,
            datepicker: formData2.datepicker,
            phase: 'Preservation',
            txHash: txHash //hash of the transaction registered evidence            
          })
        });

        const data = await response.json();
        
        if(!response.ok){
            throw new Error(`HTTP error! Status Register Evidence BD: ${response.status}`);
        }

        console.log("reporte data registered");
        console.log(data);
      
        console.log('Success:',data);         
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
    <div className="w-[20%] flex flex-col items-center justify-center bg-neutral-900 text-white p-8 ">
      <div className="mb-4 mt-[-20px]">
        <h2 className="text-2xl font-semibold text-white text-center">
          Phase 1. Acquisition</h2><br/>
          <h3 className='text-center text-gray-400 text-lg '>
            Record digital evidence on the blockchain as <strong>immutable evidence </strong>
            of forensic investigation.</h3>
      </div>
      <div className="mb-12">     
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <FcFolder className="size-20" />
        <FcFinePrint className="size-20" />
        <FcAudioFile className="size-20"/>
      </div>
    </div>
    {/* Section line */}
    <div className="w-[3px] bg-gray-800 shadow-2xl shadow-black/50 "></div>
    {/* Section right  bg-gray-900 */}
    <div className="w-[80%] flex flex-col justify-start items-center bg-[#010f1f] text-white p-1 mt-20">
       
        {showFirstForm && (
        <form className="w-[60%] bg-gray-50 rounded-7 p-10 pb-10" id="form0">    
              
              <div className="form-group border-b border-gray-900/10 pb-7">
                <h2 className="text-center text-2xl font-semibold text-lg text-gray-700">
                  Stage 1 - Record digital evidence</h2>
               
            </div>

            <div className="col-span-full">
              <label htmlFor="fileType" className="text-2xl font-semibold text-lg text-gray-700">
                Select file
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-3">
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
                            accept=".pdf,.docx,.doc,.png,.jpg, .zip"
                            className="sr-only"
                            onChange={handleFileChange}
                      />      
                    </label>
                  </div>
                  <p className="text-xs/4 text-gray-600">PDF, DOCX, PNG, JPG, ZIP</p>
                </div>
              </div> 
          
              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                  type="submit"
                  onClick={handleUploadFile}  
                  className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Upload
                </button>
              </div>
            </div> 

          {/* Dialog evidence existing in the blockchain y bd */}
              <Dialog open={open2} onClose={() => setOpen2(false)} className="relative z-10">
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
                            {/*<ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" /> */}
                            <XCircleIcon aria-hidden="true" className="size-6 text-red-600 " /> 
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 ">
                              Digital evidence existing
                            </DialogTitle>
                            <div className="mt-2">
                              <p className="text-lg text-gray-500 ">
                              The digital evidence you want to record on the blockchain 
                              <strong> already exists.</strong><br/><br/> 
                                <center>Please select another file.</center>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:space-x-4 sm:space-x-reverse sm:px-6 justify-center items-center">
                      <button
                        type="button"
                        data-autofocus
                        onClick={() => setOpen2(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-green-600 sm:mt-0 sm:w-auto"
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

        {showSecondForm && (
          <form className="bg-gray-50 rounded-7 p-10 pb-10" id="form1">    
              <h2 className="text-2xl font-semibold text-gray-900 text-center">Chain of Custody</h2>
              
              <div className="form-group border-b border-gray-900/10 pb-7">
              
                <p className="mt-1 text-base/7 text-gray-700">
                  Registration of digital evidence information on the blockchain.
                </p>
            </div>

          <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base/7 font-semibold text-gray-900 ">Digital Evidence Form</h2>
              <p className="mt-1 text-base/7 text-gray-700 pb-5">Register user data and upload digital evidence.</p>

              <div className="col-span-full"> 

              <div className="col-span-full">
                <label htmlFor="fileHash" className="block text-base/7 font-medium text-gray-900">
                  Hash code generated from digital evidence
                </label>
                <div className="mt-2">
                  <textarea
                    id="fileHash"
                    name="fileHash"
                    value={formData2.fileHash}
                    onChange={handleChange}
                    autoComplete="fileHash"
                    readOnly
                    rows={2} // number of rows
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-base/6 resize-none"
                    required
                  />
                </div>
              </div>
              <div className="col-span-full">
                <label htmlFor="file-path" className="block text-base/7 font-medium text-gray-900">
                  File path
                </label>
                <div className="mt-2">
                  <input
                    id="filePath"
                    name="filePath"
                    type="text"
                    value={formData2.filePath}
                    onChange={handleChange}
                    autoComplete="filePath"
                    readOnly
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-base/6"
                    required
                  />
                </div>
              </div> 
               

            </div>
              <div className="sm:col-span-3">
                  <label htmlFor="datepicker" className="block text-base/7 font-medium text-gray-900">
                    Date
                  </label>
                  <div className="mt-2">
                    <input
                      id="datepicker"
                      name="datepicker"
                      type="text"
                      value={formData2.datepicker}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-base/6 resize-none"
                      placeholder="Date of registration"
                      autoFocus
                      required
                      readOnly
                    />
                  </div>
                </div>
                
              <div className="sm:col-span-3 pb-2">
                <label htmlFor="userType" className="block text-base/7 font-medium text-gray-900">
                  User type
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="userType"
                    name="userType"
                    defaultValue={formData2.idType}
                    value={formData2.userType}
                    onChange={handleChange}
                    autoComplete="userType"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 
                    pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 
                    focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 
                    sm:text-1xl"
                    autoFocus
                    required 
                  >
                    <option value="" disabled >Select a user type</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Official">Official</option>
                    <option value="Lawyer">Lawyer</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center
                      justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 pb-2">      
                <label htmlFor="idType" className="block text-base/7 font-medium text-gray-900">
                  Identification type
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="idType"
                    name="idType"
                    defaultValue={formData2.idType}
                    value={formData2.idType}
                    onChange={handleChange}
                    autoComplete="idType"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 
                    pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 
                    focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 
                    sm:text-1xl"
                    autoFocus
                    required
                  >
                    <option value="" disabled >Select an identification type</option>
                    <option value="Id">Id</option>
                    <option value="License">License</option>
                    <option value="Professional card">Professional card</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center
                      justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="id" className="block text-base/7 font-medium text-gray-900">
                  Identification
                </label>
                <div className="mt-2">
                  <input     
                    id="id"
                    name="id"
                    type="number"
                    value={formData2.id}
                    onChange={(e) => {
                      const value = e.target.value.replace(/^0+/, ''); // Elimina ceros a la izquierda
                      if (/^\d*$/.test(value)) { // Solo permite números
                        handleChange({ target: { name: "id", value } });
                      }
                    }}
                    autoComplete="id"
                    className="block w-[70%] rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-base/6"
                    placeholder="Enter your ID"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="names" className="block text-base/7 font-medium text-gray-900">
                    Names
                  </label>
                  <div className="mt-2">
                    <input
                      id="names"
                      name="names"
                      value={formData2.names}
                      onChange={handleChange}
                      type="text"
                      autoComplete="names"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-base/6"
                      placeholder="Enter your names"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastNames" className="block text-base/7 font-medium text-gray-900">
                    Last names
                  </label>
                  <div className="mt-2">
                    <input
                      id="lastNames"
                      name="lastNames"
                      type="text"
                      value={formData2.lastNames}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-base/6"
                      placeholder="Enter your lastNames"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                
              </div> 
            </div>

            <div className="mt-6 flex items-center justify-center gap-x-6">
                <button 
                  type="button" 
                  onClick={handleCancel2}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm-md font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Clear Form
                </button>  
                <button
                  type="submit"
                  className={`rounded-md px-3 py-2 text-sm-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                    ${formData2.userType.trim() && formData2.idType.trim() && formData2.id.trim() &&
                      formData2.names.trim() && formData2.lastNames.trim() && formData2.fileHash.trim() &&
                      formData2.filePath.trim() && formData2.datepicker.trim() && !isRegistering ? "bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-indigo-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                  `}
                  onClick={registerAsk}
                  disabled={
                    !formData2.userType.trim() || !formData2.idType.trim() || !formData2.id.trim() || 
                    !formData2.names.trim() || !formData2.lastNames.trim() || !formData2.fileHash.trim() || 
                    !formData2.filePath.trim() || !formData2.datepicker.trim() || isRegistering} // disable the button if any of the fields are empty
                >
                  {isRegistering ? 'Registering...' : 'Register'}   
                </button>
              </div>

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
                        onClick={registerEvidence}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-green-700 sm:mt-0 sm:w-auto"
                      >
                        Register
                      </button>   
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500  sm:w-auto"
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
      Por favor, inicie sesión</h2>
  )}
  

  </div>

  );
};

export default Acquisition;
