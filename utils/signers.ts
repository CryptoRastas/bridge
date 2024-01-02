import { ethers } from 'hardhat'

export async function getSigners() {
  return await ethers.getSigners()
}
