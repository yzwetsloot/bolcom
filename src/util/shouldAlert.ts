import { readLines } from './util.js'
import Product from '../types/ProductInterface.js'

const blocklist = readLines('resources/blocklist.txt')

// configuration parameters
const defaultMargin = 0.25 // 25%

const floorMargin = 0.7 // 70%

const floorPrice = 40

const shouldAlert = (product: Product, velocity: number | null, mostRecentPrice: number | null): boolean => {
  // check if product is in blocklist
  if (blocklist.some((item) => product.title.includes(item))) return false

  // no price history is never an alert
  if (mostRecentPrice === null) return false

  // price increase or same price is never an alert
  if (product.price >= mostRecentPrice) return false

  // ignore product with no or 0 velocity
  if (velocity === 0 || velocity === null) return false

  let margin = defaultMargin

  const referencePrice = product.referencePrice!

  if (referencePrice < floorPrice) margin = floorMargin

  // delta is margin + 10 euros
  if (referencePrice * (1 - margin) > product.price + 10) return true

  return false
}

export default shouldAlert
