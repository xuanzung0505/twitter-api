import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { searchValidator } from '~/middlewares/search.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'

const searchRouter = Router()

/**
 * Description: search content
 * Path: /search
 * Method: GET
 * Query: {q, limit, page}
 */
searchRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  searchValidator,
  paginationValidator,
  searchController
)

export default searchRouter
