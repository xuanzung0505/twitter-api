import { Query } from 'express-serve-static-core'

export interface Pagination extends Query {
  limit?: string
  page?: string
}
