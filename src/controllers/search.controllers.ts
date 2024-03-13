import { NextFunction, Request, RequestHandler, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'
import { parseQuery } from '~/utils/commons'

export const searchController = async (req: Request<any, any, any, SearchQuery>, res: Response, next: NextFunction) => {
  const q = req.query.q as string
  const { limit, page } = req.query
  const myDefault = { limit: 10, page: 1 }
  const myQuery = parseQuery({ limit, page }, myDefault) as typeof myDefault

  const result = await searchService.search({ q, ...myQuery })
  return res.status(HTTP_STATUS.OK).json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
    result: {
      ...result,
      metadata: {
        ...result.metadata,
        limit: myQuery.limit,
        page: myQuery.page
      }
    }
  })
}
