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
import { FcDocument } from 'react-icons/fc';

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
      toast.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log(API);

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

      if (response.ok) {
        console.log('File path:', data.file_path);
        console.log('File hash:', data.file_hash);
        toast.success('File uploaded successfully');

        setFormData(prevState => ({
          ...prevState,
          filePath: data.file_path,
          fileHash: data.file_hash,
          userType: '',
          idType: '',
          id: '',
          names: '',
          lastNames: '',
          datepicker: ''
        }));

        setTimeout(() => {
          setShowFirstForm(false);  // Hide the first form
          setShowSecondForm(true);  // Show the second form
        }, 1000); // 4 seconds 

      } else {
        console.error('Error uploading file:', data.error);
        toast.error('Error uploading file');
      }
    } catch (error) {
      console.error('Request error:', error);
      toast.error('Request error');
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
    handleCancel();// clear date
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
    
    handleCancel();// clear date

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const daysContainerRef = useRef(null);
  const datepickerContainerRef = useRef(null);

  useEffect(() => {
    if (daysContainerRef.current) {
      renderCalendar();
    }
  }, [currentDate, isCalendarOpen]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysContainer = daysContainerRef.current;
    daysContainer.innerHTML = "";

    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDiv = document.createElement("div");
      daysContainer.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className =
        "flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-[.5px] border-transparent text-dark hover:border-stroke hover:bg-gray-2 sm:h-[46px] sm:w-[47px] dark:text-gray dark:hover:border-dark-3 dark:hover:bg-dark mb-2";
      dayDiv.textContent = i;
      dayDiv.addEventListener("click", () => {
        const selectedDateValue = `${i}/${month + 1}/${year}`;
        setSelectedDate(selectedDateValue);
        daysContainer
          .querySelectorAll("div")
          .forEach((d) => d.classList.remove("bg-primary", "text-dark"));
        dayDiv.classList.add("bg-primary", "text-gray", "dark:text-gray");
      });
      daysContainer.appendChild(dayDiv);
    }
  };

  const handlePrevMonth = (e) => {
    e.preventDefault();  
    setCurrentDate(
      (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1)),
    );
  };

  const handleNextMonth = (e) => {
    e.preventDefault(); 
    setCurrentDate(
      (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1)),
    );
  };

  const handleApply = (e) => {
    e.preventDefault(); 
    if (selectedDate) {
      setFormData(prevState => ({
        ...prevState,
        datepicker: selectedDate
      }));
      setIsCalendarOpen(false);
    }
    else {
      toast.error("Please select a date before applying.");
    }
  };

  const handleCancel = () => {
    setFormData({
      ...formData2,
      datepicker: ''
    });
    setSelectedDate(null);
    setIsCalendarOpen(false);

  };

  const handleToggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleClickOutside = (event) => {
    if (
      datepickerContainerRef.current &&
      !datepickerContainerRef.current.contains(event.target) &&
      event.target.id !== "datepicker" &&
      event.target.id !== "toggleDatepicker"
    ) {
      setIsCalendarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
    
    handleCancel();// clear date
    
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

  <div className="flex flex-col items-center justify-center min-h-screen min-w-screen p-10">
  {tokenAuth ? (
    <>
        {showFirstForm && (
        <form className="bg-gray-50 rounded-7 p-10 pb-10" id="form0">    
              <h2 className="text-2xl font-semibold text-gray-900 text-center">Phase 1. Acquisition</h2>
              
              <div className="form-group border-b border-gray-900/10 pb-7">
                <h2 className="text-2xl font-semibold text-lg text-gray-700">Stage 1 - Upload digital evidence:</h2>
                <p className="mt-1 text-bg text-lg text-gray-700">
                Record digital evidence on the blockchain as <strong>immutable evidence </strong> 
                of forensic investigation.
                </p>
            </div>

            <div className="col-span-full">
              <label htmlFor="fileType" className="text-2xl font-semibold text-lg text-gray-700">
                Select file
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
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
                            accept=".pdf,.docx,.doc,.png,.jpg"
                            className="sr-only"
                            onChange={handleFileChange}
                      />      
                    </label>
                  </div>
                  <p className="text-xs/4 text-gray-600">PDF, DOCX, PNG, JPG up to Max 10MB</p>
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

            <div className="col-span-full"> 

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

            </div> 
        {/** Date section */}
            <section className="bg-white py-6 dark:bg-dark">
              <div className="container">
                <div className="mx-auto w-full max-w-[510px]">
                  <div className="relative mb-3">
                    <input
                      id="datepicker"
                      name='datepicker'
                      type="text"
                      placeholder="Pick a date"
                      className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-12 pr-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      value={selectedDate || ""}
                      readOnly
                      onClick={handleToggleCalendar}
                      required
                    />
                    <span
                      id="toggleDatepicker"
                      onClick={handleToggleCalendar}
                      className="absolute inset-y-0 flex h-12 w-12 items-center justify-center text-dark-5"
                    >
                      <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 3.3125H16.3125V2.625C16.3125 2.25 16 1.90625 15.5937 1.90625C15.1875 1.90625 14.875 2.21875 14.875 2.625V3.28125H6.09375V2.625C6.09375 2.25 5.78125 1.90625 5.375 1.90625C4.96875 1.90625 4.65625 2.21875 4.65625 2.625V3.28125H3C1.9375 3.28125 1.03125 4.15625 1.03125 5.25V16.125C1.03125 17.1875 1.90625 18.0938 3 18.0938H18C19.0625 18.0938 19.9687 17.2187 19.9687 16.125V5.25C19.9687 4.1875 19.0625 3.3125 18 3.3125ZM3 4.71875H4.6875V5.34375C4.6875 5.71875 5 6.0625 5.40625 6.0625C5.8125 6.0625 6.125 5.75 6.125 5.34375V4.71875H14.9687V5.34375C14.9687 5.71875 15.2812 6.0625 15.6875 6.0625C16.0937 6.0625 16.4062 5.75 16.4062 5.34375V4.71875H18C18.3125 4.71875 18.5625 4.96875 18.5625 5.28125V7.34375H2.46875V5.28125C2.46875 4.9375 2.6875 4.71875 3 4.71875ZM18 16.6562H3C2.6875 16.6562 2.4375 16.4062 2.4375 16.0937V8.71875H18.5312V16.125C18.5625 16.4375 18.3125 16.6562 18 16.6562Z"
                          fill="currentColor"
                        />
                        <path
                          d="M9.5 9.59375H8.8125C8.625 9.59375 8.5 9.71875 8.5 9.90625V10.5938C8.5 10.7812 8.625 10.9062 8.8125 10.9062H9.5C9.6875 10.9062 9.8125 10.7812 9.8125 10.5938V9.90625C9.8125 9.71875 9.65625 9.59375 9.5 9.59375Z"
                          fill="currentColor"
                        />
                        <path
                          d="M12.3438 9.59375H11.6562C11.4687 9.59375 11.3438 9.71875 11.3438 9.90625V10.5938C11.3438 10.7812 11.4687 10.9062 11.6562 10.9062H12.3438C12.5312 10.9062 12.6562 10.7812 12.6562 10.5938V9.90625C12.6562 9.71875 12.5312 9.59375 12.3438 9.59375Z"
                          fill="currentColor"
                        />
                        <path
                          d="M15.1875 9.59375H14.5C14.3125 9.59375 14.1875 9.71875 14.1875 9.90625V10.5938C14.1875 10.7812 14.3125 10.9062 14.5 10.9062H15.1875C15.375 10.9062 15.5 10.7812 15.5 10.5938V9.90625C15.5 9.71875 15.375 9.59375 15.1875 9.59375Z"
                          fill="currentColor"
                        />
                        <path
                          d="M6.5 12H5.8125C5.625 12 5.5 12.125 5.5 12.3125V13C5.5 13.1875 5.625 13.3125 5.8125 13.3125H6.5C6.6875 13.3125 6.8125 13.1875 6.8125 13V12.3125C6.8125 12.125 6.65625 12 6.5 12Z"
                          fill="currentColor"
                        />
                        <path
                          d="M9.5 12H8.8125C8.625 12 8.5 12.125 8.5 12.3125V13C8.5 13.1875 8.625 13.3125 8.8125 13.3125H9.5C9.6875 13.3125 9.8125 13.1875 9.8125 13V12.3125C9.8125 12.125 9.65625 12 9.5 12Z"
                          fill="currentColor"
                        />
                        <path
                          d="M12.3438 12H11.6562C11.4687 12 11.3438 12.125 11.3438 12.3125V13C11.3438 13.1875 11.4687 13.3125 11.6562 13.3125H12.3438C12.5312 13.3125 12.6562 13.1875 12.6562 13V12.3125C12.6562 12.125 12.5312 12 12.3438 12Z"
                          fill="currentColor"
                        />
                        <path
                          d="M15.1875 12H14.5C14.3125 12 14.1875 12.125 14.1875 12.3125V13C14.1875 13.1875 14.3125 13.3125 14.5 13.3125H15.1875C15.375 13.3125 15.5 13.1875 15.5 13V12.3125C15.5 12.125 15.375 12 15.1875 12Z"
                          fill="currentColor"
                        />
                        <path
                          d="M6.5 14.4062H5.8125C5.625 14.4062 5.5 14.5312 5.5 14.7187V15.4062C5.5 15.5938 5.625 15.7188 5.8125 15.7188H6.5C6.6875 15.7188 6.8125 15.5938 6.8125 15.4062V14.7187C6.8125 14.5312 6.65625 14.4062 6.5 14.4062Z"
                          fill="currentColor"
                        />
                        <path
                          d="M9.5 14.4062H8.8125C8.625 14.4062 8.5 14.5312 8.5 14.7187V15.4062C8.5 15.5938 8.625 15.7188 8.8125 15.7188H9.5C9.6875 15.7188 9.8125 15.5938 9.8125 15.4062V14.7187C9.8125 14.5312 9.65625 14.4062 9.5 14.4062Z"
                          fill="currentColor"
                        />
                        <path
                          d="M12.3438 14.4062H11.6562C11.4687 14.4062 11.3438 14.5312 11.3438 14.7187V15.4062C11.3438 15.5938 11.4687 15.7188 11.6562 15.7188H12.3438C12.5312 15.7188 12.6562 15.5938 12.6562 15.4062V14.7187C12.6562 14.5312 12.5312 14.4062 12.3438 14.4062Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>

                  {isCalendarOpen && (
                    <div
                      ref={datepickerContainerRef}
                      id="datepicker-container"
                      className="flex w-full flex-col rounded-xl bg-white p-4 shadow-four sm:p-[30px] dark:bg-dark-2 dark:shadow-box-dark"
                    >
                      <div className="flex items-center justify-between pb-4">
                        <button
                          id="prevMonth"
                          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border-[.5px] border-stroke bg-gray-2 text-dark hover:border-primary hover:bg-primary hover:text-white sm:h-[46px] sm:w-[46px] dark:border-dark-3 dark:bg-dark dark:text-white"
                          onClick={(e) => handlePrevMonth(e)}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="fill-current"
                          >
                            <path d="M16.2375 21.4875C16.0125 21.4875 15.7875 21.4125 15.6375 21.225L7.16249 12.6C6.82499 12.2625 6.82499 11.7375 7.16249 11.4L15.6375 2.77498C15.975 2.43748 16.5 2.43748 16.8375 2.77498C17.175 3.11248 17.175 3.63748 16.8375 3.97498L8.96249 12L16.875 20.025C17.2125 20.3625 17.2125 20.8875 16.875 21.225C16.65 21.375 16.4625 21.4875 16.2375 21.4875Z" />
                          </svg>
                        </button>

                        <span
                          id="currentMonth"
                          className="text-xl font-medium capitalize text-dark dark:text-white"
                        >
                          {currentDate.toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>

                        <button
                          id="nextMonth"
                          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border-[.5px] border-stroke bg-gray-2 text-dark hover:border-primary hover:bg-primary hover:text-white sm:h-[46px] sm:w-[46px] dark:border-dark-3 dark:bg-dark dark:text-white"
                          onClick={(e) => handleNextMonth(e)}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="fill-current"
                          >
                            <path d="M7.7625 21.4875C7.5375 21.4875 7.35 21.4125 7.1625 21.2625C6.825 20.925 6.825 20.4 7.1625 20.0625L15.0375 12L7.1625 3.97498C6.825 3.63748 6.825 3.11248 7.1625 2.77498C7.5 2.43748 8.025 2.43748 8.3625 2.77498L16.8375 11.4C17.175 11.7375 17.175 12.2625 16.8375 12.6L8.3625 21.225C8.2125 21.375 7.9875 21.4875 7.7625 21.4875Z" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-7 justify-between text-center pb-2 pt-4 text-sm font-medium capitalize text-body-color sm:text-lg dark:text-dark-6">
                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          Mo
                        </span>

                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          Tu
                        </span>

                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          We
                        </span>

                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          Th
                        </span>

                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          Fr
                        </span>

                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          Sa
                        </span>

                        <span className="flex h-[38px] w-[38px] items-center justify-center sm:h-[46px] sm:w-[47px]">
                          Su
                        </span>
                      </div>

                      <div
                        ref={daysContainerRef}
                        id="days-container"
                        className="grid grid-cols-7 text-center text-sm font-medium sm:text-lg"
                      >
                        {/* Days will be rendered here */}
                      </div>
                    
                      <div className="mt-1 flex items-center justify-center gap-x-1">
                        <button
                          id="cancelBtn"
                          className=" rounded-md bg-teal-500 px-2 py-2  font-semibold bg-[#2a2a2a] 
                          flex h-[30px] w-1/3 items-center justify-center rounded-md text-base font-medium text-white hover:bg-opacity-90"
                          onClick={handleCancel}
                        >
                          Remove
                        </button>
                        <button
                          id="cancelBtn"
                          className="rounded-md bg-sky-500px-2 py-2  font-semibold bg-[#1865fe] 
                          flex h-[30px] w-1/3 items-center justify-center rounded-md text-base font-medium text-white hover:bg-opacity-90"
                          onClick={handleApply}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>      

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
                              Digital Evidence existing 
                            </DialogTitle>
                            <div className="mt-2">
                              <p className="text-lg text-gray-500 ">
                              The digital evidence you want to record on the blockchain <strong> already exists.</strong><br/><br/>
                              You will be redirected to the beginning of <strong>Stage 1.</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:space-x-4 sm:space-x-reverse sm:px-6 justify-center items-center">
                      <button
                        type="button"
                        data-autofocus
                        onClick={redirectForm}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-green-600 sm:mt-0 sm:w-auto"
                        >
                        Redirect
                      </button>
                      <button
                        type="button"
                        data-autofocus
                        onClick={() => setOpen2(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-red-600 sm:mt-0 sm:w-auto"
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

    </> 
  ) : (
    <h2 className="text-3xl text-white font-bold text-center flex-col">
      Por favor, inicie sesión</h2>
  )}

  </div>

  );
};

export default Acquisition;
