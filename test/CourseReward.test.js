const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CourseReward", function () {
  // Deploys a fresh CourseReward and pre-funds it with 1 ETH so claim()
  // calls in the happy path do not revert with "underfunded".
  async function deployFixture() {
    const [owner, student1, student2, student3, attacker] =
      await ethers.getSigners();
    const rewardAmount = ethers.parseEther("0.01");

    const Factory = await ethers.getContractFactory("CourseReward");
    const contract = await Factory.deploy(rewardAmount);
    await contract.waitForDeployment();

    await owner.sendTransaction({
      to: await contract.getAddress(),
      value: ethers.parseEther("1"),
    });

    return {
      contract,
      owner,
      student1,
      student2,
      student3,
      attacker,
      rewardAmount,
    };
  }

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should initialize the reward amount from the constructor", async function () {
      const { contract, rewardAmount } = await loadFixture(deployFixture);
      expect(await contract.rewardAmount()).to.equal(rewardAmount);
    });

    it("should enable the whitelist by default", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.whitelistEnabled()).to.equal(true);
    });

    it("should start with zero totalClaimed and no deadline", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.totalClaimed()).to.equal(0n);
      expect(await contract.claimDeadline()).to.equal(0n);
    });
  });

  describe("setRewardAmount (access control + events)", function () {
    it("owner can update the reward amount and emits AmountChanged", async function () {
      const { contract, rewardAmount } = await loadFixture(deployFixture);
      const newAmount = ethers.parseEther("0.02");
      await expect(contract.setRewardAmount(newAmount))
        .to.emit(contract, "AmountChanged")
        .withArgs(rewardAmount, newAmount);
      expect(await contract.rewardAmount()).to.equal(newAmount);
    });

    it("non-owner cannot update the reward amount", async function () {
      const { contract, attacker } = await loadFixture(deployFixture);
      await expect(
        contract.connect(attacker).setRewardAmount(ethers.parseEther("0.05"))
      ).to.be.revertedWith("CourseReward: caller is not the owner");
    });
  });

  describe("Whitelist management", function () {
    it("owner can add a student and emits WhitelistUpdated", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      await expect(contract.addToWhitelist(student1.address))
        .to.emit(contract, "WhitelistUpdated")
        .withArgs(student1.address, true);
      expect(await contract.whitelist(student1.address)).to.equal(true);
    });

    it("non-owner cannot add to the whitelist", async function () {
      const { contract, attacker, student1 } = await loadFixture(deployFixture);
      await expect(
        contract.connect(attacker).addToWhitelist(student1.address)
      ).to.be.revertedWith("CourseReward: caller is not the owner");
    });

    it("owner can batch-whitelist multiple students at once", async function () {
      const { contract, student1, student2 } = await loadFixture(deployFixture);
      await contract.addManyToWhitelist([student1.address, student2.address]);
      expect(await contract.whitelist(student1.address)).to.equal(true);
      expect(await contract.whitelist(student2.address)).to.equal(true);
    });

    it("owner can remove a student from the whitelist", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      await contract.addToWhitelist(student1.address);
      await contract.removeFromWhitelist(student1.address);
      expect(await contract.whitelist(student1.address)).to.equal(false);
    });

    it("rejects zero address in addToWhitelist", async function () {
      const { contract } = await loadFixture(deployFixture);
      await expect(
        contract.addToWhitelist(ethers.ZeroAddress)
      ).to.be.revertedWith("CourseReward: zero address");
    });
  });

  describe("Claim - positive paths", function () {
    it("whitelisted student receives the default reward and emits RewardClaimed", async function () {
      const { contract, student1, rewardAmount } = await loadFixture(
        deployFixture
      );
      await contract.addToWhitelist(student1.address);

      const txPromise = contract.connect(student1).claim();
      await expect(txPromise).to.changeEtherBalances(
        [student1, contract],
        [rewardAmount, -rewardAmount]
      );
      await expect(txPromise)
        .to.emit(contract, "RewardClaimed")
        .withArgs(student1.address, rewardAmount, 0);

      expect(await contract.hasClaimed(student1.address)).to.equal(true);
      expect(await contract.totalClaimed()).to.equal(rewardAmount);
    });

    it("student in a configured tier receives the tier-specific amount", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      const goldAmount = ethers.parseEther("0.05");

      await contract.setTierAmount(2, goldAmount);
      await contract.assignTier(student1.address, 2);
      await contract.addToWhitelist(student1.address);

      const txPromise = contract.connect(student1).claim();
      await expect(txPromise).to.changeEtherBalance(student1, goldAmount);
      await expect(txPromise)
        .to.emit(contract, "RewardClaimed")
        .withArgs(student1.address, goldAmount, 2);
    });

    it("disabling the whitelist allows any address to claim once", async function () {
      const { contract, student3, rewardAmount } = await loadFixture(
        deployFixture
      );
      await contract.setWhitelistEnabled(false);

      await expect(contract.connect(student3).claim())
        .to.emit(contract, "RewardClaimed")
        .withArgs(student3.address, rewardAmount, 0);
      expect(await contract.hasClaimed(student3.address)).to.equal(true);
    });

    it("previewReward reports the amount the student would receive", async function () {
      const { contract, student1, student2, rewardAmount } = await loadFixture(
        deployFixture
      );
      const tierTwoAmount = ethers.parseEther("0.04");
      await contract.setTierAmount(2, tierTwoAmount);
      await contract.assignTier(student2.address, 2);

      expect(await contract.previewReward(student1.address)).to.equal(
        rewardAmount
      );
      expect(await contract.previewReward(student2.address)).to.equal(
        tierTwoAmount
      );
    });
  });

  describe("Claim - negative paths", function () {
    it("reverts when caller is not whitelisted", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      await expect(contract.connect(student1).claim()).to.be.revertedWith(
        "CourseReward: not whitelisted"
      );
    });

    it("reverts when caller has already claimed", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      await contract.addToWhitelist(student1.address);
      await contract.connect(student1).claim();
      await expect(contract.connect(student1).claim()).to.be.revertedWith(
        "CourseReward: already claimed"
      );
    });

    it("reverts when the claim deadline has passed", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      await contract.addToWhitelist(student1.address);

      const deadline = (await time.latest()) + 3600;
      await contract.setDeadline(deadline);
      await time.increaseTo(deadline + 1);

      await expect(contract.connect(student1).claim()).to.be.revertedWith(
        "CourseReward: claim period has ended"
      );
    });

    it("reverts when the contract is underfunded", async function () {
      const [owner, student1] = await ethers.getSigners();
      const big = ethers.parseEther("10");
      const Factory = await ethers.getContractFactory("CourseReward");
      const fresh = await Factory.deploy(big);
      await fresh.waitForDeployment();
      await fresh.addToWhitelist(student1.address);

      await expect(fresh.connect(student1).claim()).to.be.revertedWith(
        "CourseReward: contract underfunded"
      );
    });
  });

  describe("Deadline", function () {
    it("owner can set a future deadline and emits DeadlineUpdated", async function () {
      const { contract } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 7200;
      await expect(contract.setDeadline(deadline))
        .to.emit(contract, "DeadlineUpdated")
        .withArgs(deadline);
      expect(await contract.claimDeadline()).to.equal(deadline);
    });

    it("reverts when the deadline is in the past", async function () {
      const { contract } = await loadFixture(deployFixture);
      const past = (await time.latest()) - 10;
      await expect(contract.setDeadline(past)).to.be.revertedWith(
        "CourseReward: deadline must be in the future"
      );
    });
  });

  describe("Tier configuration", function () {
    it("setTierAmount rejects tier 0 (reserved for default)", async function () {
      const { contract } = await loadFixture(deployFixture);
      await expect(
        contract.setTierAmount(0, ethers.parseEther("0.01"))
      ).to.be.revertedWith("CourseReward: tier 0 is reserved");
    });

    it("assignTier records the student's tier and emits TierAssigned", async function () {
      const { contract, student1 } = await loadFixture(deployFixture);
      await expect(contract.assignTier(student1.address, 3))
        .to.emit(contract, "TierAssigned")
        .withArgs(student1.address, 3);
      expect(await contract.studentTier(student1.address)).to.equal(3);
    });
  });

  describe("Funding and withdraw", function () {
    it("anyone can deposit via deposit() and the contract emits Deposited", async function () {
      const { contract, attacker } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("0.5");
      await expect(contract.connect(attacker).deposit({ value: amount }))
        .to.emit(contract, "Deposited")
        .withArgs(attacker.address, amount);
    });

    it("direct ETH transfer hits receive() and emits Deposited", async function () {
      const { contract, attacker } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("0.1");
      await expect(
        attacker.sendTransaction({
          to: await contract.getAddress(),
          value: amount,
        })
      )
        .to.emit(contract, "Deposited")
        .withArgs(attacker.address, amount);
    });

    it("owner can withdraw ETH and emits Withdrawn", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("0.3");

      const txPromise = contract.withdraw(amount);
      await expect(txPromise).to.changeEtherBalance(contract, -amount);
      await expect(txPromise)
        .to.emit(contract, "Withdrawn")
        .withArgs(owner.address, amount);
    });

    it("non-owner cannot withdraw", async function () {
      const { contract, attacker } = await loadFixture(deployFixture);
      await expect(
        contract.connect(attacker).withdraw(ethers.parseEther("0.1"))
      ).to.be.revertedWith("CourseReward: caller is not the owner");
    });
  });
});
