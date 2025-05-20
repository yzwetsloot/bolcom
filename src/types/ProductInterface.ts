export default interface Product {
  id: string
  title: string
  url: string
  image: string
  price: number
  rating: number
  score: number
  category: string
  creator: string | null
  referencePrice?: number // calculated by script
  velocity?: number // fetched from database, possibly null
  ean?: string // fetched from database, possibly null
  has_quantity_limit?: boolean // fetched from database, false by default
}
