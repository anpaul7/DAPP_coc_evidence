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
    bool verified;
}

contract Prueba1 {

    uint256 private nextId; //contador registros
    address public  owner; //wallet that deployment contract
    string public nameContract;

    DataEvidence [] public arrayEvidence;

    constructor(){
        nameContract = "Contract for recording of digital evidence and verification";
        owner = msg.sender; //who deployed contract
        nextId = 0;
        createEvidence("Nonce_init","-",0,"-","-","-","-","-");
    }

    //obtain data from a record: id
    mapping (uint256 => DataEvidence) public recordsEvidence;
  
    //evidence add records
    event createdED(
        uint256 id, string typeUser, string typeIde, uint256 identification,
        string names, string lastNames,
        string fileHash, string filePath,
        string dateRequest, bool verified
    );
    //event verified state
    event statusED(uint256 id, bool verified);

   //event get_Id(uint256 id); 

    //---------
    modifier  onlyOwner(){
        require(msg.sender == owner, "only the owner can execute task");
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
               _dateRequest, false);

            arrayEvidence.push(recordsEvidence[nextId]);
            nextId++;  
           
            //call event
            emit createdED(nextId, _typeUser, _typeIde, _identification,
                _names, _lastNames, _fileHash, _filePath, _dateRequest, false);   
        return true; //if record evidence is correct returns true
    }

//--- funtion update state verify evidence
    function changeStatus(uint256 _id) public{
        DataEvidence memory _recordE = recordsEvidence[_id];// get record evidence
        _recordE.verified = !_recordE.verified;//change state
        recordsEvidence[_id].verified = _recordE.verified; //update state evidence
        emit statusED(_id, _recordE.verified);//event
    }

    function getId(uint256 _id) public view onlyOwner returns ( uint256 ) { 
        return  recordsEvidence[_id].id;
    }

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

    function getNameContract() public view returns ( string memory) {
        string memory result = nameContract;
        return result;
    }
//esta funcion revisar trae los mismos datos que mapping recordevidence
    function getRecordsEvidence() public view onlyOwner returns (DataEvidence[] memory){
        return arrayEvidence;
    }

}
