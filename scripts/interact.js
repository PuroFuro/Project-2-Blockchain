const hre = require("hardhat");

// Demonstrates two interactions on a deployed CourseReward:
//   1. owner whitelists a student
//   2. student calls claim() and receives the reward
//
// Usage:
//   $env:CONTRACT_ADDRESS="0x..."; npx hardhat run scripts/interact.js --network localhost
//   (or: CONTRACT_ADDRESS=0x... npx hardhat run scripts/interact.js --network localhost)
async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error(
      "Set CONTRACT_ADDRESS env var to the deployed CourseReward address."
    );
  }

  const [owner, student] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("CourseReward", address);

  console.log("Owner   :", owner.address);
  console.log("Student :", student.address);
  console.log(
    "Contract balance:",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(address)),
    "ETH"
  );

  let tx = await contract.addToWhitelist(student.address);
  await tx.wait();
  console.log("\n[1/2] Whitelisted", student.address, "(tx:", tx.hash + ")");

  const preview = await contract.previewReward(student.address);
  console.log("      previewReward:", hre.ethers.formatEther(preview), "ETH");

  const balanceBefore = await hre.ethers.provider.getBalance(student.address);
  tx = await contract.connect(student).claim();
  const receipt = await tx.wait();
  const balanceAfter = await hre.ethers.provider.getBalance(student.address);

  console.log(
    "\n[2/2] claim() executed (tx:",
    receipt.hash + ", gasUsed:",
    receipt.gasUsed.toString() + ")"
  );
  console.log(
    "      Student balance:",
    hre.ethers.formatEther(balanceBefore),
    "->",
    hre.ethers.formatEther(balanceAfter),
    "ETH"
  );
  console.log(
    "      hasClaimed:",
    await contract.hasClaimed(student.address)
  );
  console.log(
    "      totalClaimed:",
    hre.ethers.formatEther(await contract.totalClaimed()),
    "ETH"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
