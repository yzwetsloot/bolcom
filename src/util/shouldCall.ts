import Product from '../types/ProductInterface.js'

const referenceMargin = 0.6 // 60% :: subject to change

const priceMargin = 0.4 // 40%

// NOTE: has `shouldAlert` as precondition
// identify pricing mistakes
const shouldCall = (product: Product, mostRecentPrice: number) => {
  const referencePrice = product.referencePrice!

  // check if at least drop relative to reference price
  const referenceDrop = referencePrice * (1 - referenceMargin) > product.price + 10

  // check if at least drop relative to most recent price
  const priceDrop = mostRecentPrice < (1 - priceMargin) * product.price

  return referenceDrop && priceDrop
}

export default shouldCall
