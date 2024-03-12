import { Router } from 'express'
import {
  createTweetController,
  getTweetByIDController,
  getTweetChildrenController
} from '~/controllers/tweets.controllers'
import {
  createTweetValidator,
  getTweetByIDValidator,
  getTweetChildrenValidator,
  tweetAudienceValidator,
  tweetAuthorValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRouter = Router()

/**
 * Description: create tweet
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
tweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: get tweet by id
 * Path: /:id
 * Method: GET
 */
tweetRouter.get(
  '/:id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetByIDValidator,
  tweetAudienceValidator,
  wrapRequestHandler(tweetAuthorValidator),
  wrapRequestHandler(getTweetByIDController)
)

/**
 * Description: get tweet's children
 * Path: /:id/children
 * Method: GET
 * Query: {type, limit, page}
 */
tweetRouter.get(
  '/:id/children',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetByIDValidator,
  tweetAudienceValidator,
  wrapRequestHandler(tweetAuthorValidator),
  getTweetChildrenValidator,
  wrapRequestHandler(getTweetChildrenController)
)

export default tweetRouter
