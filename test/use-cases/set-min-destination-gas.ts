import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ProxyONFT721 } from '@/typechain/contracts/ProxyONFT721'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'

import { getSigners } from '@/utils/signers'

import { deployLZEndpointMockFixture } from '../fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '../fixtures/mocks/ERC721Mock'

describe('UseCase: set min destination gas', function () {
  const chainId = 1
  const name = 'CryptoRastas'
  const symbol = 'RASTA'
  let proxyONFT721: ProxyONFT721
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
  })

  describe('Settings', () => {
    it('should set min destination gas', async function () {
      const destinationChainIdAbstract = 1234
      const packetType = 1
      const minDestinationGas = 200_000n

      await proxyONFT721.setMinDstGas(
        destinationChainIdAbstract,
        packetType,
        minDestinationGas
      )

      const minDestinationGasStored = await proxyONFT721.minDstGasLookup(
        destinationChainIdAbstract,
        packetType
      )

      expect(minDestinationGasStored).to.be.equal(minDestinationGas)
    })
  })

  describe('Checks', () => {
    it('should revert if caller is not owner', async function () {
      const destinationChainIdAbstract = 1234
      const packetType = 1
      const minDestinationGas = 200_000n

      const [, hacker] = await getSigners()

      await expect(
        proxyONFT721
          .connect(hacker)
          .setMinDstGas(
            destinationChainIdAbstract,
            packetType,
            minDestinationGas
          )
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
