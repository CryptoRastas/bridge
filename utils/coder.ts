import { ethers } from 'ethers'

export const coder = ethers.AbiCoder.defaultAbiCoder()

export const coderUtils = {
  coder
}

export default coderUtils
