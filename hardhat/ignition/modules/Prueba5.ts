// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Prueba5Module = buildModule("Prueba5Module", (m) => {
  
  const digitalEvidence = m.contract("Prueba5", [], { // "contractName","parameters[]"
  });

  // Imprimir la dirección del contrato desplegado
  console.log(`My contract deployed to: ${digitalEvidence.value}`);

  return { digitalEvidence };
});

export default Prueba5Module;
