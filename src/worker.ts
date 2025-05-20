import queue from './queue.js'
import Client from './request.js'
import { parseProducts } from './parse.js'
import calculateReferencePrice from './util/calculateReferencePrice.js'
import shouldAlert from './util/shouldAlert.js'
import shouldCall from './util/shouldCall.js'
import call from './service/call.js'
import { insertProduct, fetchMostRecentPrice, fetchProduct, insertPrice, fetchHistory, setNotified } from './query.js'
import HistoryInterface from './types/HistoryInterface.js'
import fs from 'fs'
import { generateUUID, getTempPath } from './util/util.js'
import logger from './service/log.js'
import plot from './plot.js'
import alert from './service/alert.js'

let counter = 0

const worker = async (url: string, page: number) => {
  const client = new Client()

  logger.info('Scraping products @ %s', '/' + url + page)

  const response = await client.request('get', url + page, { headers: { Connection: 'Close' } })

  // retry
  if (response === null) {
    queue.add(url, page)
    return
  }

  const products = parseProducts(response.body)
  if (products.length === 0) return

  logger.info('Got %d products from %s', products.length, '/' + url + page)

  if (page !== 500) queue.add(url, page + 1)

  for (const product of products) {
    logger.info('[%s] Processing %s', ++counter, product.id)

    logger.debug('Calculate reference price for %s', product.id)

    product.referencePrice = (await calculateReferencePrice(product.id)) ?? product.price
    await insertProduct(product)

    const mostRecentPrice = await fetchMostRecentPrice(product.id)

    await insertPrice(product.id, product.price, mostRecentPrice)

    const storedProduct = await fetchProduct(product.id)

    if (shouldAlert(product, storedProduct.velocity, mostRecentPrice)) {
      logger.info('Send alert for %s', product.id)

      // fetch price history
      const prices = await fetchHistory(product.id, 'price')

      // fetch quantity history
      const quantities = await fetchHistory(product.id, 'quantity')

      // transform price history
      const plotPrices = transform(prices)
      // transform quantity history
      const plotQuantities = transform(quantities)
      // write to JSON (temp location)

      const data = {
        prices: plotPrices,
        quantities: plotQuantities,
      }

      const task_id = generateUUID()

      product.velocity = storedProduct.velocity
      product.ean = storedProduct.ean
      product.has_quantity_limit = storedProduct.has_quantity_limit

      fs.writeFileSync(getTempPath(`plot_${task_id}.json`), JSON.stringify(data))

      // call Python plotting script
      await plot(task_id)
        .then(() => alert(product, task_id))
        .catch((e) => logger.warning('[%s] Plotting failed, not sending alert...', task_id))

      // set `notified` to true
      await setNotified(product.id)

      if (shouldCall(product, mostRecentPrice!)) {
        logger.debug('Call number(s) for %s', product.id)
        call()
      }
    }
  }
}

type PlotDataPoint = [Date, number]

const transform = (data: HistoryInterface[]) => {
  const transformed: PlotDataPoint[] = []

  const count = data.length

  for (let i = 0; i < count - 1; i++) {
    const point = data[i]
    const nextPoint = data[i + 1]

    transformed.push([point.created_at, point.value])

    const nextTimestamp = nextPoint.created_at.getTime() - 1
    const nextDate = new Date(nextTimestamp)

    transformed.push([nextDate, point.value])
  }

  const lastPoint = data[count - 1]

  // push last data point
  transformed.push([lastPoint.created_at, lastPoint.value])
  transformed.push([lastPoint.modified_at, lastPoint.value])

  return transformed
}

export default worker
