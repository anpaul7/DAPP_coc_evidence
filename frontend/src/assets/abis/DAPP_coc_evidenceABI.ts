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
                "name": "dateRequest",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timeBlock",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
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
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
            }
        ],
        "name": "statusED",
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
                "name": "dateRequest",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timeBlock",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
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
        "name": "changeStatus",
        "outputs": [],
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "getId",
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
        "name": "getRecordsEvidence",
        "outputs": [
            {
                "components": [
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
                        "name": "dateRequest",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timeBlock",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "verified",
                        "type": "bool"
                    }
                ],
                "internalType": "struct DataEvidence[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nameContract",
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
        "name": "owner",
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
                "name": "dateRequest",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timeBlock",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]