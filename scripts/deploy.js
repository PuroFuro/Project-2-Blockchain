const hre = require("hardhat");

// Deploy CourseReward to the currently-selected network, fund it with 1 ETH,
// and print the address + initial state. Run with:
//   npx hardhat run scripts/deploy.js --network localhost
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const initialReward = hre.ethers.parseEther("0.01");

  console.log("Deployer:", deployer.address);
  console.log(
    "Deployer balance:",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    ),
    "ETH"
  );

  const Factory = await hre.ethers.getContractFactory("CourseReward");
  const contract = await Factory.deploy(initialReward);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nCourseReward deployed to:", address);
  console.log(
    "Initial rewardAmount:",
    hre.ethers.formatEther(initialReward),
    "ETH"
  );

  const fundAmount = hre.ethers.parseEther("1");
  const fundTx = await deployer.sendTransaction({
    to: address,
    value: fundAmount,
  });
  await fundTx.wait();
  console.log(
    "Funded contract with",
    hre.ethers.formatEther(fundAmount),
    "ETH (tx:",
    fundTx.hash + ")"
  );
  console.log(
    "Contract balance:",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(address)),
    "ETH"
  );

  console.log("\nNext steps:");
  console.log("  1. Import a Hardhat private key into MetaMask.");
  console.log("  2. Add the Hardhat network (RPC http://127.0.0.1:8545, chainId 31337).");
  console.log("  3. Whitelist a student with addToWhitelist(...) and have them call claim().");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
