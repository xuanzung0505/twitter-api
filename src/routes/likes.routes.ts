import { Router } from 'express'
import { unlikeValidator } from '~/middlewares/likes.middlewares'
import { likeController, unlikeController } from '~/controllers/likes.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
import { tweetValidator } from '~/middlewares/tweets.middlewares'

const likeRouter = Router()

/**
 * Description: like a tweet
 * Path: /:tweet_id
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
likeRouter.post(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapRequestHandler(likeController)
)

/**
 * Description: unlike a tweet
 * Path: /:id
 * Method: DELETE
 * Header: {Authorization: Bearer <access_token>}
 */
likeRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedUserValidator,
  unlikeValidator,
  wrapRequestHandler(unlikeController)
)

export default likeRouter
