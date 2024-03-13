import { Pagination } from './Common.requests'

export interface SearchQuery extends Pagination {
  content: string
}
