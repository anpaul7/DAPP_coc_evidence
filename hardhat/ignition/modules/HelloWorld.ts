// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const HelloWorldModule = buildModule("HelloWorldModule", (m) => {
  
  const helloWorld = m.contract("HelloWorld", [], { // "contractName","parameters[]"
  });

  return { helloWorld };
});

export default HelloWorldModule;
