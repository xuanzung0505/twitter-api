import { NextFunction, Request, RequestHandler, Response } from 'express'
import { check, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, TWEET_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { convertEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const tweetTypeEnum = convertEnumToArray(TweetType)
const tweetAudienceEnum = convertEnumToArray(TweetAudience)
const mediaTypeEnum = convertEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: { options: [tweetTypeEnum] },
        errorMessage: TWEET_MESSAGES.TWEET_TYPE_IS_INVALID
      },
      audience: {
        isIn: { options: [tweetAudienceEnum] },
        errorMessage: TWEET_MESSAGES.TWEET_AUDIENCE_IS_INVALID
      },
      content: {
        custom: {
          options: (value, { req }) => {
            return value === null || (typeof value === 'string' && value.trim().length > 0)
          }
        },
        errorMessage: TWEET_MESSAGES.TWEET_CONTENT_MUST_BE_NULL_OR_A_NON_EMPTY_STRING
      },
      parent_id: {
        custom: {
          options: async (value: null | string, { req }) => {
            const isValidParentId = value === null || ObjectId.isValid(value)
            if (!isValidParentId) throw new Error(TWEET_MESSAGES.TWEET_PARENT_ID_MUST_BE_NULL_OR_A_VALID_OBJECT_ID)
            //CHECK parent exists
            if (value) {
              const parent = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
              if (!parent)
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.TWEET_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                })
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (values: any[], { req }) => {
            //must be an array of object, each object's name starts with a letter a-zA-Z
            return values.every((value) => {
              if (typeof value != 'object' || typeof value.name != 'string')
                throw TWEET_MESSAGES.TWEET_HASHTAGS_MUST_BE_AN_ARRAY_OF_HASHTAG_OBJECT
              if (!value.name.match(/[A-Za-z]+/g))
                throw TWEET_MESSAGES.TWEET_HASHTAGS_NAMES_MUST_START_WITH_AN_ENGLISH_ALPHABET_CHARACTER
              return true
            })
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (values: any[], { req }) => {
            //must be an array of string, each one is an objectId
            return values.every((value) => {
              return typeof value === 'string' && ObjectId.isValid(value)
            })
          }
        },
        errorMessage: TWEET_MESSAGES.TWEET_MENTIONS_MUST_BE_AN_ARRAY_OF_OBJECT_ID
      },
      medias: {
        isArray: true,
        custom: {
          options: (values: any[], { req }) => {
            //must be an array of Media object
            return values.every((value: any) => {
              return typeof value.url === 'string' && mediaTypeEnum.includes(value.type)
            })
          }
        },
        errorMessage: TWEET_MESSAGES.TWEET_MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT
      }
    },
    ['body']
  )
)

/**
 * Look for tweet by param :tweet_id in the database and confirm if the tweet exists or not
 */
export const tweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isString: { errorMessage: TWEET_MESSAGES.TWEET_ID_MUST_BE_A_STRING },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) throw new Error(TWEET_MESSAGES.TWEET_ID_IS_INVALID)
            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
            if (!tweet)
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEET_MESSAGES.TWEET_NOT_FOUND
              })
            return true
          }
        }
      }
    },
    ['params']
  )
)

/**
 * Look for tweet by param :id in the database and confirm if the tweet exists or not,
 * then attach it to the request
 */
export const getTweetByIDValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: TWEET_MESSAGES.TWEET_ID_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) throw new Error(TWEET_MESSAGES.TWEET_ID_IS_INVALID)
            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
            if (!tweet)
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEET_MESSAGES.TWEET_NOT_FOUND
              })
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params']
  )
)

/**
 * Handle different tweet.audience cases
 */
export const tweetAudienceValidator = (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  //tweet audience FUTURE FEATURE
  if (tweet.audience != TweetAudience.Everyone) {
    console.log('tweet audience', TweetAudience[tweet.audience])
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: COMMON_MESSAGES.THIS_FEATURE_WILL_BE_AVAILABLE_SOON
    })
  }
  next()
}

/**
 * Check tweet.author validity.
 * If the author is banned, return USER_NOT_FOUND
 */
export const tweetAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  const author = await databaseService.users.findOne({ _id: tweet.user_id })
  if (author && author.verify != UserVerifyStatus.Banned) {
    next()
  } else
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
}
