import { Pagination } from './Common.requests'

/**
 * q: search query
 * f: common filter (based on FilterQuery)
 * pf: people filter (based on PeopleFilterQuery)
 */
export interface SearchQuery extends Pagination {
  q: string
  f: string
  pf?: string
}
