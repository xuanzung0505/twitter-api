import { RequestHandler, Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetService from '~/services/tweets.services'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { CreateTweetRequestBody } from '~/models/requests/Tweet.requests'
import { TWEET_MESSAGES } from '~/constants/messages'

export const createTweetController: RequestHandler = async (
  req: Request<ParamsDictionary, any, CreateTweetRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet({ user_id, ...req.body })

  res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.TWEET_SUCCESSFULLY,
    result
  })
}
