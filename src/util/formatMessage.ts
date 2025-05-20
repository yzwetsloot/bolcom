import fs from 'fs'

import ejs from 'ejs'

import ProductInterface from '../types/ProductInterface.js'
import { round } from './util.js'

const formatMessage = (product: ProductInterface): string => {
  const template = fs.readFileSync('./resources/alert.ejs', 'utf-8')

  let forecast: undefined | number
  if (product.velocity !== null && product.velocity !== undefined) forecast = round(product.velocity * 30)

  const absoluteDelta = -round(product.price - product.referencePrice!)
  const relativeDelta = -round((product.price / product.referencePrice! - 1) * 100)

  const content = ejs.render(template, { ...product, forecast, absoluteDelta, relativeDelta })

  return content
}

export default formatMessage
