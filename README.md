# Election Smart Contract
This smart contract will allow you to hold elections using the blockchain to record results. It is only a starter template, more checks-and-balances would need to be added for a serious election.

## Overview
A Hardhat network is used to deploy and test the contract locally.

## Installation
Clone the repository:
```
git clone https://github.com/PatrickMalloy/election-ethereum.git
```
Change into the new directory and install dependencies
```
cd election-ethereum
npm install
```

## Running
Start a Hardhat local node in a terminal
```
npx hardhat node
```
In a new terminal run the tests using the following:
```
npx hardhat --network localhost test
or
npm run test
```

## Enhancements
1) Allow the owner address to be passed in/changed
2) On startVoting(), add a duration parameter for when the voting will end, e.g. 24 hours
3) Verify there are candidates added before voting can start
4) Don't allow the voting to be done more than once
5) Create a whitelist of valid wallet addresses that can vote
6) Allow a list of candidates to be added at once, instead of individually
