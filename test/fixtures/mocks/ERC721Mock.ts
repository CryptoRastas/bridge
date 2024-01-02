import { getContractAddress, getContractFactory } from '@/utils/contracts'
import { ERC721Mock__factory } from '@/typechain'

export async function deployERC721MockFixture(name: string, symbol: string) {
  const _ERC721Mock =
    await getContractFactory<ERC721Mock__factory>('ERC721Mock')

  const ERC721Mock = await _ERC721Mock.deploy(name, symbol)

  const ERC721MockAddress = await getContractAddress(ERC721Mock)

  return { ERC721Mock, ERC721MockAddress }
}
