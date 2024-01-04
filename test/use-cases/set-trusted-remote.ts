import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'
import {
  FullEnvironment,
  createFullEnvironment
} from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: set trusted remote address', function () {
  let environment: FullEnvironment

  before(async function () {
    environment = await createFullEnvironment()
  })

  describe('Settings', () => {
    it('should set trusted remote', async function () {
      const destinationCoreContractAddress = ethers.ZeroAddress

      await environment.proxyONFT721.setTrustedRemoteAddress(
        environment.destinationChainId,
        destinationCoreContractAddress
      )

      const trustedRemoteId =
        await environment.proxyONFT721.trustedRemoteLookup(
          environment.destinationChainId
        )

      const isTrusted = await environment.proxyONFT721.isTrustedRemote(
        environment.destinationChainId,
        trustedRemoteId
      )

      expect(isTrusted).to.be.true
    })
  })

  describe('Checks', () => {
    it('should revert if caller is not deployer', async function () {
      const [, hacker] = await getSigners()

      await expect(
        environment.proxyONFT721
          .connect(hacker)
          .setTrustedRemoteAddress(
            environment.destinationChainId,
            ethers.ZeroAddress
          )
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
