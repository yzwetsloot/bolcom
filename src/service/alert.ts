import got from 'got'
import { FormData } from 'formdata-node'
import { fileFromPath } from 'formdata-node/file-from-path'

import logger from './log.js'
import config from '../config.js'
import ProductInterface from '../types/ProductInterface.js'
import { getTempPath } from '../util/util.js'
import formatMessage from '../util/formatMessage.js'

const telegramEndpoint = 'https://api.telegram.org/bot'

const client = got.extend({
  timeout: {
    request: config.timeout,
  },
  retry: {
    limit: config.retryCount,
  },
  throwHttpErrors: false,
})

const alert = async (product: ProductInterface, taskId: string) => {
  logger.debug('[%s] Send alert for %s', taskId, product.id)

  const content = formatMessage(product)

  await sendMessage(content)
  await sendPlot(taskId)
}

const sendMessage = async (content: string) => {
  const data = {
    chat_id: config.telegram.chatID,
    text: content,
    parse_mode: 'html',
  }

  const response: any = await client
    .post(telegramEndpoint + config.telegram.token + '/sendMessage', { json: data })
    .json()

  if (!response.ok)
    logger.error('Failed to send Telegram message: %s', `[${response.error_code}] ${response.description}`)
  else logger.debug('Telegram message sent')
}

const sendPlot = async (taskId: string) => {
  const photoPath = getTempPath(`plot_${taskId}.png`)

  const form = new FormData()
  form.set('chat_id', config.telegram.chatID)
  form.set('photo', await fileFromPath(photoPath))

  const response: any = await client
    .post(telegramEndpoint + config.telegram.token + '/sendPhoto', { body: form })
    .json()

  if (!response.ok)
    logger.error('Failed to send Telegram photo: %s', `[${response.error_code}] ${response.description}`)
  else logger.debug('Telegram photo sent')
}

export default alert
