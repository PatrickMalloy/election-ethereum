const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
//const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Election", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployElectionFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy();

    return { election, owner, voter1, voter2, voter3};
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { election, owner } = await loadFixture(deployElectionFixture);

      expect(await election.owner()).to.equal(owner.address);
    });

    it("Voting should not be active", async function () {
      const { election } = await loadFixture(deployElectionFixture);

      expect(await election.votingActive()).to.equal(false);
    });

    it("Should be no candidates yet", async function () {
      const { election } = await loadFixture(deployElectionFixture);

      expect(await election.numCandidates()).to.equal(0);
    });
  });

  describe("Add Candidates", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called while voting is active", async function () {
        const { election } = await loadFixture(deployElectionFixture);

        await election.startVoting();

        await expect(election.addCandidate("Candidate 1")).to.be.revertedWith(
          "Voting has already started. Cannot add now."
        );
      });

      it("Should revert if not called from the owner account", async function () {
        const { election, voter1 } = await loadFixture(deployElectionFixture);

        // We use election.connect() to send a transaction from another account
        await expect(election.connect(voter1).addCandidate("Candidate 1")).to.be.revertedWith(
          "Only Owner."
        );
      });

    });

    describe("Events", function () {
      it("Should emit an event on candidate add", async function () {
        const { election, owner } = await loadFixture(deployElectionFixture);


        await expect(election.addCandidate("Candidate 1"))
          .to.emit(election, "candidateAdded").withArgs("Candidate 1");
      });
    });

  });

  describe("Start the Voting", function () {
    describe("Validations", function () {
      it("Should allow only owner to start the voting", async function () {
        const { election, owner, voter1 } = await loadFixture(deployElectionFixture);

        await expect(election.connect(voter1).startVoting()).to.be.revertedWith("Only Owner.");
      });

      it("Should set the votingActive flag to true", async function () {
        const { election } = await loadFixture(deployElectionFixture);

        await election.startVoting();
        expect(await election.votingActive()).to.equal(true);
      });
    });

    describe("Events", function () {
      it("Should emit votingStarted event", async function () {
        const { election } = await loadFixture(deployElectionFixture);

        await expect(election.startVoting())
          .to.emit(election, "votingStarted");
      })
    });
  });

  describe("Voting", function () {
    describe("Validations", function () {
      it("Should revert if voting not started yet", async function () {
        const { election, voter1 } = await loadFixture(deployElectionFixture);
        await expect(election.connect(voter1).vote(1)).to.be.revertedWith("Voting is not active.")
      });

      it("Should revert if candidate id is out-of-range", async function () {
        const { election, voter1 } = await loadFixture(deployElectionFixture);
        await election.addCandidate("Candidate 1");
        await election.startVoting();

        await expect(election.connect(voter1).vote(0)).to.be.revertedWith("Invalid candidate.")
        await expect(election.connect(voter1).vote(2)).to.be.revertedWith("Invalid candidate.")
      });

      it("Should be able to vote only once", async function () {
        const { election, voter1 } = await loadFixture(deployElectionFixture);
        await election.addCandidate("Candidate 1");
        await election.startVoting();
        await election.connect(voter1).vote(1);

        await expect(election.connect(voter1).vote(1)).to.be.revertedWith("Already voted.")
      });

      it("Should increase total number of votes for a candidate", async function () {
        const { election, voter1, voter2, voter3 } = await loadFixture(deployElectionFixture);
        let candidateInfo;

        await election.addCandidate("Candidate 1");
        await election.addCandidate("Candidate 2");
        await election.startVoting();

        await election.connect(voter1).vote(1);
        candidateInfo = await election.candidates(1);
        expect(candidateInfo[2]).to.equal(1);

        await election.connect(voter2).vote(1);
        candidateInfo = await election.candidates(1);
        expect(candidateInfo[2]).to.equal(2);

        await election.connect(voter3).vote(2);
        candidateInfo = await election.candidates(2);
        expect(candidateInfo[2]).to.equal(1);
      });
      
    });

    describe("Events", function () {
      it("Should emit voteCast event", async function () {
        const { election, voter1 } = await loadFixture(deployElectionFixture);
        await election.addCandidate("Candidate 1");
        await election.startVoting();
        
        await expect(election.connect(voter1).vote(1))
          .to.emit(election, "voteCast").withArgs(1);        
      })
    });
  });
});
