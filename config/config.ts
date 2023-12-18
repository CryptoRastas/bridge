import { reduce } from 'lodash'
import { ethereum, sepolia, polygon, polygonMumbai } from './chains'
import { Chain } from './types'

export const allowedChains = [ethereum, sepolia, polygon, polygonMumbai]

export const allowedChainsConfig = reduce(
  allowedChains,
  (acc, chain: Chain) => {
    acc[chain.id] = chain

    return acc
  },
  {} as { [key: number]: Chain }
)
