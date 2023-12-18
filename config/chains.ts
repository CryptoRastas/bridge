import { evmAccounts } from './accounts'
import { Chain } from './types'

export const polygon: Chain = {
  id: 137,
  name: 'Polygon',
  network: 'matic',
  accounts: evmAccounts,
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: ['https://polygon-mainnet.g.alchemy.com/v2']
    },
    infura: {
      http: ['https://polygon-mainnet.infura.io/v3']
    },
    default: {
      http: ['https://polygon-rpc.com']
    },
    public: {
      http: ['https://polygon-rpc.com']
    }
  },
  blockExplorers: {
    etherscan: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com'
    },
    default: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com'
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160
    }
  }
}

export const ethereum: Chain = {
  id: 1,
  network: 'homestead',
  name: 'Ethereum',
  accounts: evmAccounts,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: ['https://eth-mainnet.g.alchemy.com/v2']
    },
    infura: {
      http: ['https://mainnet.infura.io/v3']
    },
    default: {
      http: ['https://cloudflare-eth.com']
    },
    public: {
      http: ['https://cloudflare-eth.com']
    }
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://etherscan.io'
    },
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io'
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601
    }
  }
}

export const sepolia: Chain = {
  id: 11_155_111,
  accounts: evmAccounts,
  network: 'sepolia',
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: ['https://eth-sepolia.g.alchemy.com/v2']
    },
    infura: {
      http: ['https://sepolia.infura.io/v3']
    },
    default: {
      http: ['https://rpc.sepolia.org']
    },
    public: {
      http: ['https://rpc.sepolia.org']
    }
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io'
    },
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io'
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 751532
    }
  },
  testnet: true
}

export const polygonMumbai: Chain = {
  id: 80_001,
  name: 'Polygon Mumbai',
  network: 'maticmum',
  accounts: evmAccounts,
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    infura: {
      http: ['https://polygon-mumbai.infura.io/v3']
    },
    default: {
      http: ['https://rpc.ankr.com/polygon_mumbai']
    },
    public: {
      http: ['https://rpc.ankr.com/polygon_mumbai']
    }
  },
  blockExplorers: {
    etherscan: {
      name: 'PolygonScan',
      url: 'https://mumbai.polygonscan.com'
    },
    default: {
      name: 'PolygonScan',
      url: 'https://mumbai.polygonscan.com'
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160
    }
  },
  testnet: true
}
