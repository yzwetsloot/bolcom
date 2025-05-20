import { parse } from 'node-html-parser'
import HTMLElement from 'node-html-parser/dist/nodes/html'

import { round } from './util/util.js'
import Product from './types/ProductInterface.js'
import logger from './service/log.js'
import config from './config.js'

const ratingPattern = /\d+(\.|,)?\d+/

const parseProducts = (text: string) => {
  const root = parse(text)

  const sections = root.querySelectorAll('li.product-item--row')
  if (sections.length === 0) return []

  const category = parseCategory(root)

  const products: Product[] = []

  for (const section of sections) {
    const product = parseProduct(section, category)

    if (product) {
      products.push(product)
      logger.info('Parsed %s', product.id)
    }
  }

  return products
}

const parseCategory = (element: HTMLElement): string => {
  const breadcrumb = element.querySelector('.breadcrumbs__item:last-child > * p.breadcrumbs__link-label')!
  return breadcrumb.text
}

const parseProduct = (element: HTMLElement, category: string): Product | null => {
  const imageElement = element.querySelector('img')!

  const image = imageElement.hasAttribute('src')
    ? imageElement.getAttribute('src')!
    : imageElement.getAttribute('data-src')!

  const id = element.getAttribute('data-id')!

  const titleElement = element.querySelector('a.product-title')!

  const title = titleElement.text

  let path = titleElement.getAttribute('href')!
  const url = config.baseURL + path

  const creatorElement = element.querySelector('ul.product-creator > li > a')

  const creator = creatorElement ? creatorElement.text : null

  const price = parsePrice(element)
  if (!price) return null

  const rating = parseRating(element)

  const score = parseScore(element)

  const product = {
    id,
    title,
    url,
    image,
    price,
    rating,
    score,
    category,
    creator,
  }

  return product
}

const parsePrice = (element: HTMLElement): number | null => {
  const priceElement = element.querySelector('meta[itemprop="price"]')!
  if (!priceElement) return null // product not available

  const priceText = priceElement.getAttribute('content')!

  let price = Number(priceText)

  const container = element.querySelector('span[data-test="selectPriceBoxDiscountAmount"]')

  if (container) {
    const discountText = container.text

    const translatedRatingText = discountText.replace(',', '.')

    const discount = Number(translatedRatingText)

    price = round(price - discount)
  }

  return price
}

const parseRating = (element: HTMLElement): number => {
  const container = element.querySelector('div.star-rating')

  if (container) {
    const ratingText = container.getAttribute('title')!
    const [match] = ratingText.match(ratingPattern)!

    const translatedRatingText = match.replace(',', '.')

    return Number(translatedRatingText)
  }

  return 0
}

const parseScore = (element: HTMLElement): number => {
  const container = element.querySelector('div.star-rating')

  if (container) {
    const scoreText = container.getAttribute('data-count')!
    return Number(scoreText)
  }

  return 0
}

export { parseProducts }
