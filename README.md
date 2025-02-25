# CryptoRastas - NFT Bridge

### ToDos

1. For **Abstract** chain, there's still missing implementation of set min destination gas and set trusted remote scripts for zksync.
2. Implementing script for set min batch limit for transfering tokens

### Available chains

#### Mainnet

- Ethereum
- Polygon
- Base
- Abstract

#### Testnet

- Amoy (not deployed)
- Sepolia
- Base Sepolia
- Abstract Testnet (not deployed)

## Getting Started

```shell
pnpm compile
pnpm typechain
pnpm node
```

## Testing

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Deploying ERC721Mock (optional testnet only)

```bash
pnpm hardhat deploy-ERC721-mock --network 11155111 --token-name CryptoRastas222 --token-symbol RASTAS222
```

| Argument          | Description                  | Default        |
| ----------------- | ---------------------------- | -------------- |
| `--token-name`    | Token name                   | `CryptoRastas` |
| `--token-symbol`  | Token symbol                 | `RASTAS`       |
| `--account-index` | Account index to deploy from | `0`            |

## Step 1 - deploying contracts

Deploy ProxyONFT721 on source chain:

| Argument                | Description                                  | Default                   |
| ----------------------- | -------------------------------------------- | ------------------------- |
| `--proxy-token`         | Proxy token address (token to be proxied)    | [Address]                 |
| `--min-gas-to-transfer` | Min gas required to perform actions on chain | [check](config/chains.ts) |
| `--lz-endpoint`         | L2 endpoint                                  | [check](config/chains.ts) |
| `--account-index`       | Account index to deploy from                 | `0`                       |

```bash
pnpm hardhat deploy-proxy-ONFT721 --network 1 --proxy-token 0x07cd221b2fe54094277a2f4e1c1bc6df14e63678
```

and deploy ONFT721 on destination chain:

| Argument                | Description                                  | Default                   |
| ----------------------- | -------------------------------------------- | ------------------------- |
| `--name`                | Token name                                   | `CryptoRastas`            |
| `--symbol`              | Token symbol                                 | `RASTAS`                  |
| `--account-index`       | Account index to deploy from                 | `0`                       |
| `--min-gas-to-transfer` | Min gas required to perform actions on chain | [check](config/chains.ts) |
| `--lz-endpoint`         | L2 endpoint                                  | [check](config/chains.ts) |

```bash
pnpm hardhat deploy-ONFT721 --network 137 --name Cryptorastas --symbol RASTA
```

## Step 2 - Setting up the bridge

### Setting trusted remote address

Set destination chain as trusted remote address on source chain:

| Argument                              | Description                    | Default   |
| ------------------------------------- | ------------------------------ | --------- |
| `--account-index`                     | Account index to deploy from   | `0`       |
| `--core-contract-address`             | Core Contract address          | [Address] |
| `--destination-chain-id`              | Destination chain id           | [ChainId] |
| `--destination-core-contract-address` | ONFT721 from destination chain | [Address] |

```bash
pnpm hardhat set-trusted-remote-address --network 1 --core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --destination-chain-id 137 --destination-core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480
```

repeat the process on the destination chain, to trust the source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 137 --core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --destination-chain-id 1 --destination-core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480
```

### Setting min gas required

Set destination chain min gas required to perform actions on chain:

| Argument                  | Description                                  | Default                   |
| ------------------------- | -------------------------------------------- | ------------------------- |
| `--account-index`         | Account index to deploy from                 | `0`                       |
| `--core-contract-address` | Core Contract address                        | [Address]                 |
| `--destination-chain-id`  | Destination chain id                         | [ChainId]                 |
| `--min-destination-gas`   | Min gas required to perform actions on chain | [check](config/chains.ts) |
| `--packet-type`           | Packet type                                  | `1` (send and call)       |

```bash
pnpm hardhat set-min-destination-gas --network 1 --core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --destination-chain-id 137
```

repeat the process on the destination chain, to set min gas required to perform actions on chain:

```bash
pnpm hardhat set-min-destination-gas --network 137 --core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --destination-chain-id 1
```

### Setting min allowed tokens to batch transfer

```bash
Access using block explorer and call the action manually in the contract write section "setDstChainIdToBatchLimit"
```

## Step 3 - Transfer ERC721

Transfer ERC721 to destination chain

| Argument                  | Description                  | Default             |
| ------------------------- | ---------------------------- | ------------------- |
| `--account-index`         | Account index to deploy from | `0`                 |
| `--token-id`              | Token id                     | [TokenId]           |
| `--token-address`         | Token address                | [Address]           |
| `--core-contract-address` | Core Contract address        | [Address]           |
| `--destination-chain-id`  | Destination chain id         | [ChainId]           |
| `--packet-type`           | Packet type                  | `1` (send and call) |

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 1 --core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --destination-chain-id 137 --token-address 0x07cd221b2fe54094277a2f4e1c1bc6df14e63678 --token-id 1
```

optionally you can transfer back to initial chain

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 137 --core-contract-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --destination-chain-id 1 --token-address 0xfD691DCf0Cd713986F9218F3dc7aEb5f2b9e7480 --token-id 1
```

## Step 4 - Verifing contracts

Run this command to verify contracts on selected network

```bash
pnpm verify --network [networkid] --contract contracts/[ContractName].sol:[Contract] [contractAddress] [arguments]
```

## Step 5 - Set min destination batch limit

normally it should be set to 3 as the maximum dapp accepts
todo
