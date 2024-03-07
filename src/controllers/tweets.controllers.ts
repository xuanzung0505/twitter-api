import { RequestHandler, Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { CreateTweetRequestBody } from '~/models/requests/Tweet.requests'
import { TWEET_MESSAGES } from '~/constants/messages'

export const createTweetController: RequestHandler = async (
  req: Request<ParamsDictionary, any, CreateTweetRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet({ user_id, ...req.body })

  res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
    result
  })
}

export const getTweetByIDController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const result = await tweetsService.getTweetByID(id)
  if (result)
    return res.status(HTTP_STATUS.OK).json({
      message: TWEET_MESSAGES.GET_TWEET_SUCCESSFULLY,
      result
    })
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    message: TWEET_MESSAGES.TWEET_NOT_FOUND
  })
}
