import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ProxyONFT721 } from '@/typechain/contracts/ProxyONFT721'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'

import {
  abiCoder,
  getContractAddress,
  getContractFactory
} from '@/utils/contracts'

import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import { deployLZEndpointMockFixture } from '../fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '../fixtures/mocks/ERC721Mock'

describe('Bridge', function () {
  const chainId = 1
  const name = 'CryptoRastas'
  const symbol = 'RASTA'
  let proxyONFT721: ProxyONFT721
  let proxyONFT721Address: string
  const minGasToTransferAndStore = 100_000n

  before(async function () {
    const { ERC721MockAddress } = await loadFixture(
      deployERC721MockFixture.bind(this, name, symbol)
    )

    const { lZEndpointMockAddress } = await loadFixture(
      deployLZEndpointMockFixture.bind(this, chainId)
    )

    const fixture = await loadFixture(
      deployProxyONFT721Fixture.bind(
        this,
        minGasToTransferAndStore,
        lZEndpointMockAddress,
        ERC721MockAddress
      )
    )

    proxyONFT721 = fixture.proxyONFT721
    proxyONFT721Address = fixture.proxyONFT721Address
  })

  describe('Settings', () => {
    it('should set trusted remote', async function () {
      const destinationCoreContractAddress = ethers.ZeroAddress
      const destinationChainIdAbstract = 1234

      await proxyONFT721.setTrustedRemoteAddress(
        destinationChainIdAbstract,
        destinationCoreContractAddress
      )

      const trustedRemoteId = await proxyONFT721.trustedRemoteLookup(
        destinationChainIdAbstract
      )

      const isTrusted = await proxyONFT721.isTrustedRemote(
        destinationChainIdAbstract,
        trustedRemoteId
      )

      expect(isTrusted).to.be.true
    })
  })

  describe('Checks', () => {
    it('should revert if caller is not deployer', async function () {})
  })
})
