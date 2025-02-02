// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

 struct DataEvidence{
    uint256 id;
    string typeUser;
    string typeIde;
    uint256 identification;
    string names;
    string lastNames;
    string fileHash;
    string filePath;
    string dateRequest;
    string phase;
}

contract Prueba2 {

    uint256 private nextId; //counter records 
    address private owner; //wallet that deployment contract
    string private  nameContract;

    DataEvidence [] public arrayEvidence;

    constructor(){
        nameContract = "Contract for recording of digital evidence and verification";
        owner = msg.sender; //who deployed contract
        nextId = 0;
        createEvidence("Nonce_init","-",1,"-","-","-","-","-");
    }

    //obtain data from a record: id
    mapping (uint256 => DataEvidence) public recordsEvidence;

    //evidence add records
    event createdED(
        uint256 id, string typeUser, string typeIde, uint256 identification,
        string names, string lastNames,
        string fileHash, string filePath,
        string dateRequest, string phase
    );
    //event verified state
    event statusPhase(uint256 id, string phase);

    //---------
    modifier  onlyOwner(){
        require(msg.sender == owner, "Only the owner can record digital evidence");
        _;
    }
//------------------------------------------------------
//-- create Evidence
    function createEvidence(
        string memory _typeUser, string memory _typeIde,
        uint256 _identification, string memory _names,
        string memory _lastNames, string memory _fileHash, 
        string memory _filePath, string memory _dateRequest
        ) public returns (bool){
            //require(!existsOwner(msg.sender,"owner exists"));

            // Validate input data
            require(bytes(_typeUser).length > 0, "TypeUser cannot be empty");
            require(bytes(_typeIde).length > 0, "TypeIde cannot be empty");
            require(_identification > 0, "Identification must be greater than 0");
            require(bytes(_names).length > 0, "Names cannot be empty");
            require(bytes(_lastNames).length > 0, "LastNames cannot be empty");
            require(bytes(_fileHash).length > 0, "DateRequest cannot be empty");
            require(bytes(_filePath).length > 0, "DateRequest cannot be empty");
            require(bytes(_dateRequest).length > 0, "DateRequest cannot be empty");

            recordsEvidence[nextId] = DataEvidence(
               nextId, _typeUser, _typeIde, _identification,
               _names, _lastNames, _fileHash, _filePath,
               _dateRequest, "Preservation");

            arrayEvidence.push(recordsEvidence[nextId]);
            nextId++;  
           
            //call event
            emit createdED(nextId, _typeUser, _typeIde, _identification,
                _names, _lastNames, _fileHash, _filePath, _dateRequest, "Preservation");   
        return true; //if record evidence is correct returns true
    }

//--- funtion Evidence phase update
    function changePhase(uint256 _id, string memory _phase) public returns (bool) {
        require(_id >= 0, "Id cannot be empty");
        require(bytes(_phase).length > 0, "Phase cannot be empty");
        require(_id < nextId, "No record found for the given ID");

        DataEvidence storage _recordE = recordsEvidence[_id]; //Use "storage" to modify the value directly
        _recordE.phase = _phase;

        emit statusPhase(_id, _phase); //call event

        return true;
    }

    // Get fileHash records for id
    function getFileHash(uint256 _id) public view returns (string memory) {
        require(_id < nextId, "No record found for the given ID");
        return recordsEvidence[_id].fileHash;
    }

    // Get fileHash records for id
    function getFilePath(uint256 _id) public view returns (string memory) {
        require(_id < nextId, "No record found for the given ID");
        return recordsEvidence[_id].filePath;
    }

    function getNameContract() public view returns ( string memory) {
        string memory result = nameContract;
        return result;
    }

    function getAdrress() public view onlyOwner returns (address) { 
        return owner;
    }

    function getName(uint256 _id) public view returns (string memory) {
        require(_id < nextId, "No record found for the given ID");
        return recordsEvidence[_id].names;
    }

/*
    function getName(uint256 _id) public view returns ( string memory) {
        string memory result = "No existe...";
        for (uint256 i=0; i<arrayEvidence.length;i++){
            if(arrayEvidence[i].id == _id){
                result = arrayEvidence[i].names;
                break;
            }
        }     
        return result;
    }
*/
}
