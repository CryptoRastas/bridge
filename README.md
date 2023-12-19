# CryptoRastas - NFT Bridge

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

## Deploying ProxyONFT721

```bash
pnpm hardhat deploy-proxy-ONFT721 --network 80001 --proxy-token 0x8fDdcAE908f834FF2Cb23d5211A42149907Cfd87
```

## Deploying ONFT721

```bash
pnpm hardhat deploy-ONFT721 --network 80001 --name OMNICHAIN --symbol OMNI
```

## Deploying WERC721

```bash
pnpm hardhat deploy-mock-ERC721 --network 80001 --token-name OMNICHAIN --token-symbol OMNI
```

## Verify contracts

pnpm verify --network [networkid] --contract contracts/[ContractName].sol:[Contract] [contractAddress] [arguments]
