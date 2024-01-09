import { Spinner } from './spinner'
import cliSpinner from 'cli-spinners'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

const deploy = async () => {
  throw new Error('Deploy not available yet, please check tasks instead')
}

;(async () => {
  spinner.start()
  try {
    console.log(`ℹ️  Deploying...`)
    await deploy()
    spinner.stop()
    console.log(`✅ deployed`)
  } catch (error) {
    spinner.stop()
    console.log(`❌ failed to deploy`, error)
    process.exitCode = 1
  }
})()
