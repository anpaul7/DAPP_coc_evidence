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
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "typeUser",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "typeIde",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "identification",
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
        "name": "fileHash",
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
        "name": "dateRequest",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "phase",
        "type": "string"
      }
    ],
    "name": "createdED",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "phase",
        "type": "string"
      }
    ],
    "name": "statusPhase",
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
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "typeUser",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "typeIde",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "identification",
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
        "name": "fileHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "filePath",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "dateRequest",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "phase",
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
      },
      {
        "internalType": "string",
        "name": "_phase",
        "type": "string"
      }
    ],
    "name": "changePhase",
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
        "internalType": "string",
        "name": "_typeUser",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_typeIde",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_identification",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_names",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_lastNames",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_fileHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_filePath",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_dateRequest",
        "type": "string"
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
    "name": "getFileHash",
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
    "name": "getName",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "recordsEvidence",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "typeUser",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "typeIde",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "identification",
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
        "name": "fileHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "filePath",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "dateRequest",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "phase",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]