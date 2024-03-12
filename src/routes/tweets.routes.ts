import { Router } from 'express'
import {
  createTweetController,
  getTweetByIDController,
  getTweetChildrenController,
  getTweetsFromFollowingController
} from '~/controllers/tweets.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import {
  createTweetValidator,
  getTweetByIDValidator,
  getTweetChildrenValidator,
  getTweetsFromFollowingValidator,
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
 * Path: /details/:id
 * Method: GET
 */
tweetRouter.get(
  '/details/:id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetByIDValidator,
  tweetAudienceValidator,
  wrapRequestHandler(tweetAuthorValidator),
  wrapRequestHandler(getTweetByIDController)
)

/**
 * Description: get tweet's children
 * Path: /details/:id/children
 * Method: GET
 * Query: {type, limit, page}
 */
tweetRouter.get(
  '/details/:id/children',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetByIDValidator,
  tweetAudienceValidator,
  wrapRequestHandler(tweetAuthorValidator),
  getTweetChildrenValidator,
  paginationValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * Description: get tweets from accounts which the current user follows
 * Path: /following
 * Method: GET
 * Query: {type, limit, page}
 */
tweetRouter.get(
  '/following',
  accessTokenValidator,
  verifiedUserValidator,
  getTweetsFromFollowingValidator,
  paginationValidator,
  wrapRequestHandler(getTweetsFromFollowingController)
)

export default tweetRouter
