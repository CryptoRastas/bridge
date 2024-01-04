import { getContractAddress, getContractFactory } from '@/utils/contracts'
import { LZEndpointMock__factory } from '@/typechain'

export async function deployLZEndpointMockFixture(chainId: number) {
  const _LZEndpointMock =
    await getContractFactory<LZEndpointMock__factory>('LZEndpointMock')
  const LZEndpointMock = await _LZEndpointMock.deploy(chainId)
  const LZEndpointMockAddress = await getContractAddress(LZEndpointMock)

  return { LZEndpointMock, LZEndpointMockAddress }
}
