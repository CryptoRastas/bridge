import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type DeployTemplateTask = {
  accountIndex?: number
}

task('deploy-template-task', 'override this template with your task')
  .addOptionalParam(
    'accountIndex',
    'Account index to use for deployment',
    0,
    types.int
  )
  .setAction(async ({ accountIndex }: DeployTemplateTask, hre) => {
    spinner.start()

    try {
      const chainConfig = allowedChainsConfig[+hre.network.name]
      if (!chainConfig) {
        spinner.stop()
        throw new Error('Chain config not found')
      }

      const provider = new hre.ethers.JsonRpcProvider(
        chainConfig.rpcUrls.default.http[0],
        chainConfig.id
      )

      const deployer = new hre.ethers.Wallet(
        chainConfig.accounts[accountIndex || 0],
        provider
      )

      console.log(`✅ `)
    } catch (error) {
      spinner.stop()
      console.log(`❌ `)
      console.log(error)
    }
  })
