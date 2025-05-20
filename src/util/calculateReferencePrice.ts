import { round } from './util.js'
import { fetchPrices } from '../query.js'

const calculateReferencePrice = async (id: string): Promise<number | null> => {
  /**
   * Calculate the reference price of a product
   *
   * Use record duration to weight each price value.
   *
   * @param prices - price history
   * @returns reference price
   *
   * @async
   */
  const prices = await fetchPrices(id)

  if (prices.length === 0) return null

  if (prices.length === 1) return prices[0].value

  // reset date range floor
  const oldest = prices[0]
  if (oldest.created_at < oldest.floor) oldest.created_at = oldest.floor

  let sum = 0,
    totalDuration = 0

  for (const price of prices) {
    const duration = price.modified_at.getTime() - price.created_at.getTime()

    sum += price.value * duration
    totalDuration += duration
  }

  const referencePrice = sum / totalDuration

  return round(referencePrice)
}

export default calculateReferencePrice
