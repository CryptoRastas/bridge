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

## Step 1 - deploying contracts

Deploy ProxyONFT721 on source chain:

```bash
pnpm hardhat deploy-proxy-ONFT721 --network 80001 --proxy-token 0x8fDdcAE908f834FF2Cb23d5211A42149907Cfd87
```

and deploy ONFT721 on destination chain:

```bash
pnpm hardhat deploy-ONFT721 --network 80001 --name OMNICHAIN --symbol OMNI
```

## Step 2 - Setting up the bridge

Set destination chain as trusted remote address on source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 80001 --core-contract-address 0x28F15dF999bA0B9Cc4B363a43e70f107Ac12fef8 --destination-chain-id 11155111 --destination-core-contract-address 0x2C1e21882E18f86e1512F126d07B21FA9d6B117E
```

Set destination chain min gas required to perform actions on source chain:

```bash
pnpm hardhat set-min-destination-gas --network 80001 --core-contract-address 0x28F15dF999bA0B9Cc4B363a43e70f107Ac12fef8 --destination-chain-id 11155111
```

## Step 3 - Verifing contracts

Run this command to verify contracts on selected network

```bash
pnpm verify --network [networkid] --contract contracts/[ContractName].sol:[Contract] [contractAddress] [arguments]
```

## Extra

### Deploying MockERC721 (test only)

```bash
pnpm hardhat deploy-mock-ERC721 --network 80001 --token-name OMNICHAIN --token-symbol OMNI
```

### Transfer ERC721 to destination chain

```bash
@todo
```
