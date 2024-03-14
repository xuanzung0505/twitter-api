import { Pagination } from './Common.requests'

export interface SearchQuery extends Pagination {
  q: string
  f: string
}
