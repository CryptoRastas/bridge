import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { LoadLightEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: set min destination gas', function () {
  const bridge = new LoadLightEnvironment()

  before(async function () {
    await bridge.setup()
  })

  it('should set min destination gas', async function () {
    const destinationChainIdAbstract = 1234
    const packetType = 1
    const minDestinationGas = 200_000n

    await bridge.proxyONFT721.setMinDstGas(
      destinationChainIdAbstract,
      packetType,
      minDestinationGas
    )

    const minDestinationGasStored = await bridge.proxyONFT721.minDstGasLookup(
      destinationChainIdAbstract,
      packetType
    )

    expect(minDestinationGasStored).to.be.equal(minDestinationGas)
  })

  describe('Checks', () => {
    it('should revert if caller is not owner', async function () {
      const [, hacker] = await getSigners()

      await expect(
        bridge.proxyONFT721
          .connect(hacker)
          .setMinDstGas(bridge.destinationChainId, bridge.packetType, 260_000n)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
