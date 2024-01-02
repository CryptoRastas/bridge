import { getContractAddress, getContractFactory } from '@/utils/contracts'
import { LZEndpointMock__factory } from '@/typechain'

export async function deployLZEndpointMock(chainId: number = 1) {
  const LZEndpointMock =
    await getContractFactory<LZEndpointMock__factory>('LZEndpointMock')
  const lZEndpointMock = await LZEndpointMock.deploy(chainId)
  const lZEndpointMockAddress = await getContractAddress(lZEndpointMock)

  return { lZEndpointMock, lZEndpointMockAddress }
}