import { Router } from 'express'
import { addToBookmarksController, removeFromBookmarksController } from '~/controllers/bookmarks.controllers'
import { removeFromBookmarksValidator } from '~/middlewares/bookmarks.middlewares'
import { tweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

/**
 * Description: bookmark a tweet
 * Path: /:tweet_id
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
bookmarkRouter.post(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapRequestHandler(addToBookmarksController)
)

/**
 * Description: remove a bookmark
 * Path: /:id
 * Method: DELETE
 * Header: {Authorization: Bearer <access_token>}
 */
bookmarkRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedUserValidator,
  removeFromBookmarksValidator,
  wrapRequestHandler(removeFromBookmarksController)
)

export default bookmarkRouter
