export const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "caseNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "device",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "evidenceType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "filePath",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "hashEvidence",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "registrationDate",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "methodAdquisition",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "noteEvidence",
        "type": "string"
      }
    ],
    "name": "createdDataEvidence",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "names",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "lastNames",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "userType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "phase",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "state",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "stateUpdateDate",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "technicalReport",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "executiveReport",
        "type": "string"
      }
    ],
    "name": "createdDetailsEvidence",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "phase",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "state",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "stateUpdateDate",
        "type": "string"
      }
    ],
    "name": "eventUpdatePhase",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "phase",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "state",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "stateUpdateDate",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "technicalReport",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "executiveReport",
        "type": "string"
      }
    ],
    "name": "eventUpdatePresentationPhase",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "arrayEvidence",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "caseNumber",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "device",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "evidenceType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "filePath",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "hashEvidence",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "registrationDate",
            "type": "string"
          }
        ],
        "internalType": "struct DataEvidence",
        "name": "dataEvidence",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "methodAdquisition",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "noteEvidence",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "names",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "lastNames",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "userType",
            "type": "string"
          }
        ],
        "internalType": "struct DetailsEvidence",
        "name": "detailsEvidence",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "phase",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "state",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "stateUpdateDate",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "technicalReport",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "executiveReport",
            "type": "string"
          }
        ],
        "internalType": "struct PhaseEvidence",
        "name": "phaseEvidence",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "caseNumber",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "device",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "evidenceType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "filePath",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "hashEvidence",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "registrationDate",
            "type": "string"
          }
        ],
        "internalType": "struct DataEvidence",
        "name": "_dataEvidence",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "methodAdquisition",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "noteEvidence",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "names",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "lastNames",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "userType",
            "type": "string"
          }
        ],
        "internalType": "struct DetailsEvidence",
        "name": "_detailsEvidence",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "phase",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "state",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "stateUpdateDate",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "technicalReport",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "executiveReport",
            "type": "string"
          }
        ],
        "internalType": "struct PhaseEvidence",
        "name": "_phaseEvidence",
        "type": "tuple"
      }
    ],
    "name": "createEvidence",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAdrress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getCaseNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEvidenciaAll",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "caseNumber",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "location",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "device",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "evidenceType",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "filePath",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "hashEvidence",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "registrationDate",
                "type": "string"
              }
            ],
            "internalType": "struct DataEvidence",
            "name": "dataEvidence",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "methodAdquisition",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "noteEvidence",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "userId",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "names",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "lastNames",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "userType",
                "type": "string"
              }
            ],
            "internalType": "struct DetailsEvidence",
            "name": "detailsEvidence",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "phase",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "state",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "stateUpdateDate",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "technicalReport",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "executiveReport",
                "type": "string"
              }
            ],
            "internalType": "struct PhaseEvidence",
            "name": "phaseEvidence",
            "type": "tuple"
          }
        ],
        "internalType": "struct FullEvidence[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getFilePath",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getHashEvidence",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNameContract",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getPhase",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRegisterId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getRegistrationDate",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getState",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getStateUpdateDate",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getUserId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "recordsEvidence",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "caseNumber",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "device",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "evidenceType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "filePath",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "hashEvidence",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "registrationDate",
            "type": "string"
          }
        ],
        "internalType": "struct DataEvidence",
        "name": "dataEvidence",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "methodAdquisition",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "noteEvidence",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "names",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "lastNames",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "userType",
            "type": "string"
          }
        ],
        "internalType": "struct DetailsEvidence",
        "name": "detailsEvidence",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "phase",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "state",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "stateUpdateDate",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "technicalReport",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "executiveReport",
            "type": "string"
          }
        ],
        "internalType": "struct PhaseEvidence",
        "name": "phaseEvidence",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_phase",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_state",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_stateUpdateDate",
        "type": "string"
      }
    ],
    "name": "updatePhase",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_phase",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_state",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_stateUpdateDate",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_technicalReport",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_executiveReport",
        "type": "string"
      }
    ],
    "name": "updatePresentationPhase",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]