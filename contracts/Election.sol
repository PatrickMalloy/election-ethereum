// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Election {
  // Structure to hold Candidate info
  struct Candidate {
    uint256 id;
    string name;
    uint256 numVotes;
  }

  // Owner of this election
  address public owner;

  // Voting active flag
  bool public votingActive = false;

  // This mapping will store all voters who have voted
  mapping(address => bool) public voters;

  // This mapping will hold all of the Candidates in the race
  mapping(uint256 => Candidate) public candidates;

  // Store the total number of Candidates
  uint256 public numCandidates;

  // Store total number of votes cast
  uint256 public totalVotesCast;

  // Event for votes cast
  event voteCast(uint256 indexed candidateId);

  // Event for Candidates added 
  event candidateAdded(string name);

  // Event for Voting starting
  event votingStarted(uint256 timestamp);

  // Event for Voting ended
  event votingEnded(uint256 timestamp);

  // modifier
  modifier onlyOwner {
    require (msg.sender == owner, "Only Owner.");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function addCandidate(string memory name) public onlyOwner {
    require(!votingActive, "Voting has already started. Cannot add now.");
    numCandidates ++;
    candidates[numCandidates] = Candidate(numCandidates, name, 0);

    emit candidateAdded(name);
  }

  function vote(uint256 candidateId) public {
    // Check if voting has started
    require(votingActive, "Voting is not active.");

    // You can only vote once
    require(!voters[msg.sender], "Already voted.");

    // Need a valid candidate
    require(candidateId > 0 && candidateId <= numCandidates, "Invalid candidate.");

    // Record the vote on the blockchain
    voters[msg.sender] = true;

    // Assign the vote to appropiate candidate
    candidates[candidateId].numVotes ++;

    // Update total number of votes cast
    totalVotesCast ++;

    // Emit the vote event
    emit voteCast(candidateId);
  }

  function startVoting() public onlyOwner {
    require(!votingActive, "Voting has already started.");

    votingActive = true;

    emit votingStarted(block.timestamp);
  }

  function endVoting() public onlyOwner {
    require(votingActive, "Voting is not active.");

    votingActive = false;

    emit votingEnded(block.timestamp);
  }
}