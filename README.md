# CryptoRastas - NFT Bridge

### Available chains

- Ethereum
- Polygon
- Mumbai
- Sepolia

## Getting Started

```shell
pnpm compile
pnpm typechain
pnpm node
```

## Available scrips by `dlx hardhat`

```shell
dlx hardhat help
REPORT_GAS=true dlx hardhat test
```

## Testing

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Deploying MockERC721 (test only)

```bash
pnpm hardhat deploy-mock-ERC721 --network 80001 --token-name OMNICHAIN --token-symbol OMNI
```

## Step 1 - deploying contracts

Deploy ProxyONFT721 on source chain:

```bash
pnpm hardhat deploy-proxy-ONFT721 --network 80001 --proxy-token 0x8e6F5bBCa36879769A6e4C9E807683152b64B6FD
```

and deploy ONFT721 on destination chain:

```bash
pnpm hardhat deploy-ONFT721 --network 11155111 --name OMNICHAIN --symbol OMNI
```

## Step 2 - Setting up the bridge

### Setting trusted remote address

Set destination chain as trusted remote address on source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 80001 --core-contract-address 0x1FB97771E7bd1DB0BF3b063d92e4A58CD191B54C --destination-chain-id 11155111 --destination-core-contract-address 0xE1c8ECbb0789FD6dB4cFb67FA074390c80EbD491
```

repeat the process on the destination chain, to trust the source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 11155111 --core-contract-address 0xE1c8ECbb0789FD6dB4cFb67FA074390c80EbD491 --destination-chain-id 80001 --destination-core-contract-address 0x1FB97771E7bd1DB0BF3b063d92e4A58CD191B54C
```

### Setting min gas required

Set destination chain min gas required to perform actions on chain:

```bash
pnpm hardhat set-min-destination-gas --network 80001 --core-contract-address 0x1FB97771E7bd1DB0BF3b063d92e4A58CD191B54C --destination-chain-id 11155111
```

repeat the process on the destination chain, to set min gas required to perform actions on chain:

```bash
pnpm hardhat set-min-destination-gas --network 11155111 --core-contract-address 0xE1c8ECbb0789FD6dB4cFb67FA074390c80EbD491 --destination-chain-id 80001
```

## Step 3 - Transfer ERC721

Transfer ERC721 to destination chain

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 80001 --core-contract-address 0x1FB97771E7bd1DB0BF3b063d92e4A58CD191B54C --destination-chain-id 11155111 --token-address 0x8e6F5bBCa36879769A6e4C9E807683152b64B6FD --token-id 1
```

optionally you can transfer back to initial chain

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 11155111 --core-contract-address 0xE1c8ECbb0789FD6dB4cFb67FA074390c80EbD491 --destination-chain-id 80001 --token-address 0xE1c8ECbb0789FD6dB4cFb67FA074390c80EbD491 --token-id 1
```

## Step 4 - Verifing contracts

Run this command to verify contracts on selected network

```bash
pnpm verify --network [networkid] --contract contracts/[ContractName].sol:[Contract] [contractAddress] [arguments]
```
