# CryptoRastas - NFT Bridge

### Available chains

#### Mainnet

- Ethereum
- Polygon

#### Testnet

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

## Deploying ERC721Mock (test only)

```bash
pnpm hardhat deploy-ERC721-mock --network 11155111 --token-name CryptoRastas --token-symbol RASTAS
```

## Step 1 - deploying contracts

Deploy ProxyONFT721 on source chain:

```bash
pnpm hardhat deploy-proxy-ONFT721 --network 11155111 --proxy-token 0x0888CF7Ee20c0E1d43bd2073bb334c65cF7B6FF1
```

and deploy ONFT721 on destination chain:

```bash
pnpm hardhat deploy-ONFT721 --network 80001 --name CryptoRastas --symbol RASTAS
```

## Step 2 - Setting up the bridge

### Setting trusted remote address

Set destination chain as trusted remote address on source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 11155111 --core-contract-address 0xf17c3853379947f7B750953AaFa5C59B78153e10 --destination-chain-id 80001 --destination-core-contract-address 0xc8ce0cA761935859c457C1b0cBE953A66757E777
```

repeat the process on the destination chain, to trust the source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 80001 --core-contract-address 0xc8ce0cA761935859c457C1b0cBE953A66757E777 --destination-chain-id 11155111 --destination-core-contract-address 0xf17c3853379947f7B750953AaFa5C59B78153e10
```

### Setting min gas required

Set destination chain min gas required to perform actions on chain:

```bash
pnpm hardhat set-min-destination-gas --network 11155111 --core-contract-address 0xf17c3853379947f7B750953AaFa5C59B78153e10 --destination-chain-id 80001
```

repeat the process on the destination chain, to set min gas required to perform actions on chain:

```bash
pnpm hardhat set-min-destination-gas --network 80001 --core-contract-address 0xc8ce0cA761935859c457C1b0cBE953A66757E777 --destination-chain-id 11155111
```

## Step 3 - Transfer ERC721

Transfer ERC721 to destination chain

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 11155111 --core-contract-address 0xf17c3853379947f7B750953AaFa5C59B78153e10 --destination-chain-id 80001 --token-address 0x0888CF7Ee20c0E1d43bd2073bb334c65cF7B6FF1 --token-id 1
```

optionally you can transfer back to initial chain

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 80001 --core-contract-address 0xc8ce0cA761935859c457C1b0cBE953A66757E777 --destination-chain-id 11155111 --token-address 0xc8ce0cA761935859c457C1b0cBE953A66757E777 --token-id 1 --is-proxy false
```

## Step 4 - Verifing contracts

Run this command to verify contracts on selected network

```bash
pnpm verify --network [networkid] --contract contracts/[ContractName].sol:[Contract] [contractAddress] [arguments]
```
