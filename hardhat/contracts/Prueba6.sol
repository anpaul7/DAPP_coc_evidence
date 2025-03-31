// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

 struct DataEvidence{
    uint256 id;
    uint256 caseNumber;
    string location;
    string device;
    string evidenceType;
    string filePath;
    string hashEvidence;
    string registrationDate;
}

struct DetailsEvidence{
    string methodAdquisition;
    string noteEvidence;
    uint256 userId;
    string names;
    string lastNames;
    string userType;
 }

struct PhaseEvidence{
    string phase;
    string state;
    string stateUpdateDate;
    string technicalReport;
    string executiveReport;
}

struct FullEvidence { //structure for full data
    DataEvidence dataEvidence;
    DetailsEvidence detailsEvidence;
    PhaseEvidence phaseEvidence;
}

contract Prueba6 {

    uint256 private registerId; //counter records 
    address private owner; //wallet that deployment contract
    string private  nameContract;

    //-- create Full Data Evidence 
    mapping(uint256 => FullEvidence) public recordsEvidence;
    FullEvidence[] public arrayEvidence;

    // add evidence records
    event createdDataEvidence(
        uint256 indexed id, uint256 caseNumber, string location, string device,
        string evidenceType, string filePath, string hashEvidence, 
        string registrationDate, string methodAdquisition, string noteEvidence
    );
     event createdDetailsEvidence(
        uint256 indexed id, uint256 userId, string names,
        string lastNames, string userType, string phase, string state, 
        string stateUpdateDate, string technicalReport, string executiveReport
    );
    //event update phase state
    event eventUpdatePhase(uint256 indexed id, string phase, string state, string stateUpdateDate);

    //event update presentation phase
    event eventUpdatePresentationPhase(
        uint256 indexed id, string phase, string state, string stateUpdateDate,
        string technicalReport, string executiveReport
    );
    //---------
    modifier  onlyOwner(){
        require(msg.sender == owner, "Only the owner can record digital evidence");
        _;
    }
//------------------------------------------------------
    constructor(){
        nameContract = "Smart contract for recording, preservation and verification of digital evidence";
        owner = msg.sender; //who deployed contract
        registerId = 0; //initialize counter records
    }
//-- create Evidence
    function createEvidence(
        DataEvidence memory _dataEvidence,
        DetailsEvidence memory _detailsEvidence,
        PhaseEvidence memory _phaseEvidence
        ) public returns (bool){

            if( // Validate input data
            bytes(_dataEvidence.hashEvidence).length == 0 || _dataEvidence.caseNumber == 0 ||
            bytes(_dataEvidence.location).length == 0 || bytes(_dataEvidence.device).length == 0 ||
            bytes(_dataEvidence.evidenceType).length == 0 || bytes(_dataEvidence.filePath).length == 0 ||
            bytes(_dataEvidence.registrationDate).length == 0 || 
            bytes(_detailsEvidence.methodAdquisition).length == 0 ||
            bytes(_detailsEvidence.noteEvidence).length == 0 || _detailsEvidence.userId == 0 ||
            bytes(_detailsEvidence.names).length == 0 || bytes(_detailsEvidence.lastNames).length == 0 ||
            bytes(_detailsEvidence.userType).length == 0 ||
            bytes(_phaseEvidence.stateUpdateDate).length == 0
            ){ 
                return false;
            }

            uint256 currentId = registerId;//increment position id

            _dataEvidence.id = currentId;
            _phaseEvidence.phase = "Preservation";
            _phaseEvidence.state = "Custody";
            _phaseEvidence.technicalReport = "noFileTechnical";
            _phaseEvidence.executiveReport = "noFileExecutive";

            FullEvidence memory evidence = FullEvidence({
                dataEvidence: _dataEvidence,
                detailsEvidence: _detailsEvidence,
                phaseEvidence: _phaseEvidence
            });

            recordsEvidence[currentId] = evidence;
            arrayEvidence.push(evidence);           

            emit createdDataEvidence(  //-- call event
                currentId, _dataEvidence.caseNumber, 
                _dataEvidence.location, _dataEvidence.device, 
                _dataEvidence.evidenceType, _dataEvidence.filePath,
                _dataEvidence.hashEvidence, _dataEvidence.registrationDate,
                _detailsEvidence.methodAdquisition, _detailsEvidence.noteEvidence
            );
            emit createdDetailsEvidence(  //-- call event
                currentId, _detailsEvidence.userId, _detailsEvidence.names,
                _detailsEvidence.lastNames, _detailsEvidence.userType, 
                _phaseEvidence.phase, _phaseEvidence.state,
                _phaseEvidence.stateUpdateDate, _phaseEvidence.technicalReport,
                _phaseEvidence.executiveReport
            );
            registerId++;

        return true; //if record evidence is correct returns true
    }

//--- funtion Evidence update phase 
    function updatePhase(uint256 _id, string memory _phase, string memory _state,
     string memory _stateUpdateDate) public returns (bool) {
        require(_id < registerId, "No record found for the given ID");
        require(bytes(_phase).length > 0, "Phase cannot be empty");
        require(bytes(_state).length > 0, "State cannot be empty");
        require(bytes(_stateUpdateDate).length > 0, "StateUpdateDate cannot be empty");

        FullEvidence storage evidence = recordsEvidence[_id]; //Use "storage" to modify the value directly
        evidence.phaseEvidence.phase = _phase;
        evidence.phaseEvidence.state = _state;
        evidence.phaseEvidence.stateUpdateDate = _stateUpdateDate;
        arrayEvidence[_id] = evidence; //update array evidence

        emit eventUpdatePhase(_id, _phase, _state, _stateUpdateDate); //call event

        return true;
    }

//--- funtion Evidence update presentation phase
    function updatePresentationPhase(uint256 _id, string memory _phase, string memory _state,
     string memory _stateUpdateDate, string memory _technicalReport, 
     string memory _executiveReport) public returns (bool) {
        require(_id < registerId, "No record found for the given ID");
        require(bytes(_phase).length > 0, "Phase cannot be empty");
        require(bytes(_state).length > 0, "State cannot be empty");
        require(bytes(_stateUpdateDate).length > 0, "StateUpdateDate cannot be empty");
        require(bytes(_technicalReport).length > 0, "TechnicalReport cannot be empty");
        require(bytes(_executiveReport).length > 0, "ExecutiveReport cannot be empty");

       FullEvidence storage evidence = recordsEvidence[_id]; //Use "storage" to modify the value directly
        evidence.phaseEvidence.phase = _phase;
        evidence.phaseEvidence.state = _state;
        evidence.phaseEvidence.stateUpdateDate = _stateUpdateDate;
        evidence.phaseEvidence.technicalReport = _technicalReport;
        evidence.phaseEvidence.executiveReport = _executiveReport;
        arrayEvidence[_id] = evidence;

        emit eventUpdatePresentationPhase(_id, _phase, _state, _stateUpdateDate,
            _technicalReport, _executiveReport
        ); 

        return true;
    }
// ------------- Get data 
    function getHashEvidence(uint256 _id) public view returns (string memory) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].dataEvidence.hashEvidence;
    }
    function getCaseNumber(uint256 _id) public view returns (uint256) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].dataEvidence.caseNumber;
    }
    function getRegistrationDate(uint256 _id) public view returns (string memory) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].dataEvidence.registrationDate;
    }
    function getFilePath(uint256 _id) public view returns (string memory) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].dataEvidence.filePath;
    }
    function getPhase(uint256 _id) public view returns (string memory) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].phaseEvidence.phase;
    }
    function getState(uint256 _id) public view returns (string memory) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].phaseEvidence.state;
    }
    function getStateUpdateDate(uint256 _id) public view returns (string memory) {
        require(_id >= 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].phaseEvidence.stateUpdateDate;
    }
    function getNameContract() public view returns (string memory) {
        return nameContract;
    }
    function getAdrress() public view onlyOwner returns (address) {
        return owner;
    }
    function getUserId(uint256 _id) public view returns (uint256) {
        require(_id > 0 && _id < registerId, "No record found for the given ID");
        return recordsEvidence[_id].detailsEvidence.userId;
    }
    
    function getEvidenciaAll() public view returns (FullEvidence[] memory) {
        return arrayEvidence;
    }
    function getRegisterId() public view returns (uint256) {
        return registerId;
    }
}