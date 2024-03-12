import { RequestHandler, Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { CreateTweetRequestBody, TweetParam, TweetQuery } from '~/models/requests/Tweet.requests'
import { TWEET_MESSAGES } from '~/constants/messages'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { parseQuery } from '~/utils/commons'

export const createTweetController: RequestHandler = async (
  req: Request<ParamsDictionary, any, CreateTweetRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet({ user_id, ...req.body })

  return res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
    result
  })
}

export const getTweetByIDController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  const decoded_authorization = req.decoded_authorization ? (req.decoded_authorization as TokenPayload) : null
  const user_id = decoded_authorization?.user_id ?? null
  const result = await tweetsService.increaseView(tweet._id.toString(), user_id)
  if (tweet)
    return res.status(HTTP_STATUS.OK).json({
      message: TWEET_MESSAGES.GET_TWEET_SUCCESSFULLY,
      result: {
        ...tweet,
        ...result
      }
    })
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    message: TWEET_MESSAGES.TWEET_NOT_FOUND
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetParam, any, any, TweetQuery>,
  res: Response,
  next: NextFunction
) => {
  const decoded_authorization = req.decoded_authorization ? (req.decoded_authorization as TokenPayload) : null
  const user_id = decoded_authorization?.user_id ?? null

  const { id } = req.params
  const { type, limit, page } = req.query
  const myQuery = parseQuery({ type, limit, page }, { type: undefined, limit: 10, page: 1 })
  const result = await tweetsService.getTweetChildren({
    id,
    ...myQuery
  })

  if (result.data.length > 0) {
    //increase views for children tweets in the DB
    const children_ids = result.data.map((item) => item._id)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const currentDate = new Date()
    databaseService.tweets.updateMany(
      {
        _id: { $in: children_ids }
      },
      {
        $inc: inc,
        $set: {
          updated_at: currentDate
        }
      },
      {}
    )
    //return children with the updated views regardless of the result from our mutation above
    result.data.forEach((value) => {
      if (user_id) value.user_views += 1
      else value.guest_views += 1
    })
  }
  return res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
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

export const getTweetsFromFollowingController = async (
  req: Request<any, any, any, TweetQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { type, limit, page } = req.query
  const myQuery = parseQuery({ type, limit, page }, { type: undefined, limit: 10, page: 1 })
  const result = await tweetsService.getTweetsFromFollowing({ user_id, ...myQuery })
  if (result.data.length > 0) {
    //increase views for children tweets in the DB
    const tweet_ids = result.data.map((item) => item._id)
    const inc = { user_views: 1 }
    const currentDate = new Date()
    databaseService.tweets.updateMany(
      {
        _id: { $in: tweet_ids }
      },
      {
        $inc: inc,
        $set: {
          updated_at: currentDate
        }
      },
      {}
    )
    //return children with the updated views regardless of the result from our mutation above
    result.data.forEach((value) => {
      value.user_views += 1
    })
  }
  return res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
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
