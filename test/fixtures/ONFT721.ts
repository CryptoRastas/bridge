import { getContractAddress, getContractFactory } from '@/utils/contracts'
import { ONFT721__factory } from '@/typechain'

export async function deployONFT721(
  name: string,
  symbol: string,
  minGasToTransferAndStore: bigint,
  lzEndpoint: string
) {
  const _ONFT721 = await getContractFactory<ONFT721__factory>('ONFT721')

  const ONFT721 = await _ONFT721.deploy(
    name,
    symbol,
    minGasToTransferAndStore,
    lzEndpoint
  )

  const ONFT721Address = await getContractAddress(ONFT721)

  return { ONFT721, ONFT721Address }
}
