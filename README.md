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

| Argument          | Description                  | Default        |
| ----------------- | ---------------------------- | -------------- |
| `--token-name`    | Token name                   | `CryptoRastas` |
| `--token-symbol`  | Token symbol                 | `RASTAS`       |
| `--account-index` | Account index to deploy from | `0`            |

## Step 1 - deploying contracts

Deploy ProxyONFT721 on source chain:

| Argument                | Description                                  | Default                   |
| ----------------------- | -------------------------------------------- | ------------------------- |
| `--proxy-token`         | Proxy token address                          | [Address]                 |
| `--min-gas-to-transfer` | Min gas required to perform actions on chain | [check](config/chains.ts) |
| `--lz-endpoint`         | L2 endpoint                                  | [check](config/chains.ts) |
| `--account-index`       | Account index to deploy from                 | `0`                       |

```bash
pnpm hardhat deploy-proxy-ONFT721 --network 11155111 --proxy-token 0xEa1bE678525726C050aE363D6561110567c6A005
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
pnpm hardhat deploy-ONFT721 --network 80001 --name CryptoRastas --symbol RASTAS
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
pnpm hardhat set-trusted-remote-address --network 11155111 --core-contract-address 0x08d6474eb92E8c4Df03E4223e0ec8d50f743c75f --destination-chain-id 80001 --destination-core-contract-address 0x357F0dc00AdE231db59aE38aCd8A0E73ed0125Ff
```

repeat the process on the destination chain, to trust the source chain:

```bash
pnpm hardhat set-trusted-remote-address --network 80001 --core-contract-address 0x357F0dc00AdE231db59aE38aCd8A0E73ed0125Ff --destination-chain-id 11155111 --destination-core-contract-address 0x08d6474eb92E8c4Df03E4223e0ec8d50f743c75f
```

### Setting min gas required

Set destination chain min gas required to perform actions on chain:

| Argument                  | Description                                  | Default                   |
| ------------------------- | -------------------------------------------- | ------------------------- |
| `--account-index`         | Account index to deploy from                 | `0`                       |
| `--core-contract-address` | Core Contract address                        | [Address]                 |
| `--destination-chain-id`  | Destination chain id                         | [ChainId]                 |
| `--min-gas-to-transfer`   | Min gas required to perform actions on chain | [check](config/chains.ts) |
| `--packet-type`           | Packet type                                  | `1` (send and call)       |

```bash
pnpm hardhat set-min-destination-gas --network 11155111 --core-contract-address 0x08d6474eb92E8c4Df03E4223e0ec8d50f743c75f --destination-chain-id 80001
```

repeat the process on the destination chain, to set min gas required to perform actions on chain:

```bash
pnpm hardhat set-min-destination-gas --network 80001 --core-contract-address 0x357F0dc00AdE231db59aE38aCd8A0E73ed0125Ff --destination-chain-id 11155111
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
pnpm hardhat transfer-ERC721-to-destination-chain --network 11155111 --core-contract-address 0x08d6474eb92E8c4Df03E4223e0ec8d50f743c75f --destination-chain-id 80001 --token-address 0xEa1bE678525726C050aE363D6561110567c6A005 --token-id 1
```

optionally you can transfer back to initial chain

```bash
pnpm hardhat transfer-ERC721-to-destination-chain --network 80001 --core-contract-address 0x357F0dc00AdE231db59aE38aCd8A0E73ed0125Ff --destination-chain-id 11155111 --token-address 0x357F0dc00AdE231db59aE38aCd8A0E73ed0125Ff --token-id 1
```

## Step 4 - Verifing contracts

Run this command to verify contracts on selected network

```bash
pnpm verify --network [networkid] --contract contracts/[ContractName].sol:[Contract] [contractAddress] [arguments]
```
