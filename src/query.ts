import config from './config.js'
import db from './service/database.js'
import Product from './types/ProductInterface'
import HistoryInterface from './types/HistoryInterface.js'
import logger from './service/log.js'

export const fetchPrices = async (id: string) => {
  logger.debug('Fetch prices for product %s', id)

  const result = await db.query(
    `SELECT value, notified, created_at, modified_at, NOW() - INTERVAL '${config.dateRange}' MONTH AS floor FROM price WHERE modified_at > NOW() - INTERVAL '${config.dateRange}' MONTH AND ID = $1 ORDER BY modified_at ASC`,
    [id],
  )

  return result.rows
}

export const insertProduct = async (product: Product) => {
  logger.debug('Insert product %s', product.id)

  await db.query(
    'INSERT INTO product (id, title, url, image, price, rating, score, category, creator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET (price, rating, score) = ($5, $6, $7)',
    [
      product.id,
      product.title,
      product.url,
      product.image,
      product.referencePrice!,
      product.rating,
      product.score,
      product.category,
      product.creator,
    ],
  )
}

export const fetchMostRecentPrice = async (id: string): Promise<number | null> => {
  logger.debug('Fetch most recent price for %s', id)

  const result = await db.query('SELECT value FROM price WHERE id = $1 ORDER BY created_at DESC LIMIT 1', [id])

  const [price] = result.rows

  return price ? price.value : null
}

export const insertPrice = async (id: string, price: number, mostRecentPrice: number | null) => {
  if (mostRecentPrice === price) {
    logger.debug('Price for %s has not changed, updating weight...', id)

    // update existing record
    await db.query(
      'UPDATE price SET weight = price.weight + 1 WHERE id = $1 AND value = $2 AND created_at = (SELECT created_at FROM price WHERE id = $1 ORDER BY created_at DESC LIMIT 1)',
      [id, price],
    )
  } else {
    logger.debug('Price for %s has changed, inserting new record...', id)
    // insert new record
    await db.query('INSERT INTO price (id, value) VALUES ($1, $2)', [id, price])
  }
}

export const fetchProduct = async (id: string) => {
  logger.debug('Fetch product %s', id)

  const result = await db.query('SELECT ean, velocity, has_quantity_limit FROM product WHERE id = $1', [id])
  const [product] = result.rows

  return product
}

type Table = 'price' | 'quantity'

export const fetchHistory = async (id: string, tableName: Table): Promise<HistoryInterface[]> => {
  logger.debug(`Fetch ${tableName} history for %s`, id)

  const result = await db.query(
    `SELECT value, created_at, modified_at FROM ${tableName} WHERE id = $1 ORDER BY modified_at ASC`,
    [id],
  )
  return result.rows
}

export const setNotified = async (id: string) => {
  await db.query(
    'UPDATE price SET notified = true WHERE id = $1 AND created_at = (SELECT created_at FROM price WHERE id = $1 ORDER BY created_at DESC LIMIT 1)',
    [id],
  )
}
