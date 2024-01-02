import { getContractAddress, getContractFactory } from '@/utils/contracts'
import { ProxyONFT721__factory } from '@/typechain'

export async function deployProxyONFT721Fixture(
  minGasToTransferAndStore: bigint,
  lzEndpoint: string,
  proxyToken: string
) {
  const ProxyONFT721 =
    await getContractFactory<ProxyONFT721__factory>('ProxyONFT721')

  const proxyONFT721 = await ProxyONFT721.deploy(
    minGasToTransferAndStore,
    lzEndpoint,
    proxyToken
  )

  const proxyONFT721Address = await getContractAddress(proxyONFT721)

  return { proxyONFT721, proxyONFT721Address }
}
