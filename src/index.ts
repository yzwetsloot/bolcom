import logger from './service/log.js'
import queue from './queue.js'

const main = async () => {
  logger.info('Start scraping prices')

  await queue.execute()
}

await main()
