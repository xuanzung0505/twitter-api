import { NextFunction, Request, RequestHandler, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, TWEET_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { Media } from '~/models/Others'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { convertEnumToArray } from '~/utils/commons'
import { TweetAdditionalData } from '~/utils/pipelines'
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
        custom: {
          options: (value, { req }) => {
            if (value != TweetAudience.Everyone) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.THIS_FEATURE_WILL_BE_AVAILABLE_SOON,
                status: HTTP_STATUS.FORBIDDEN
              })
            }
            return true
          }
        },
        errorMessage: TWEET_MESSAGES.TWEET_AUDIENCE_IS_INVALID
      },
      content: {
        isString: {
          errorMessage: TWEET_MESSAGES.TWEET_CONTENT_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: (value: string, { req }) => {
            const { type } = req.body
            const medias = req.body.medias as Media[]
            //only the retweeted tweet may have its content empty, unless there are medias attached to the current tweet
            if (type === TweetType.Retweet) {
              if (value.length > 0) throw new Error(TWEET_MESSAGES.TWEET_CONTENT_MUST_BE_EMPTY)
            } else {
              if (value.length === 0 && medias.length === 0)
                throw new Error(TWEET_MESSAGES.TWEET_CONTENT_MUST_NOT_BE_EMPTY)
            }
            return true
          }
        }
      },
      parent_id: {
        custom: {
          options: async (value: null | string, { req }) => {
            const isValidParentId = value === null || ObjectId.isValid(value)
            if (!isValidParentId) throw new Error(TWEET_MESSAGES.TWEET_PARENT_ID_MUST_BE_NULL_OR_A_VALID_OBJECT_ID)
            //if value exists, the tweet type must be a retweet/quoted retweet or a comment with its attached parent
            if (value) {
              if (req.body.type === TweetType.Tweet)
                throw new Error(TWEET_MESSAGES.NORMAL_TWEET_MUST_HAVE_NULL_PARENT_ID)
              const parent = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
              if (!parent)
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.TWEET_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                })
            } else {
              //value doesn't exist, so it must be a normal tweet
              if (req.body.type != TweetType.Tweet)
                throw new Error(TWEET_MESSAGES.NORMAL_TWEET_MUST_HAVE_NULL_PARENT_ID)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (values: any[], { req }) => {
            //check tweet type
            if (req.body.type === TweetType.Retweet) {
              if (values.length > 0) throw new Error(TWEET_MESSAGES.A_RETWEET_MUST_NOT_HAVE_HASHTAGS)
            }
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
            //check tweet type
            if (req.body.type === TweetType.Retweet) {
              if (values.length > 0) throw new Error(TWEET_MESSAGES.A_RETWEET_MUST_NOT_HAVE_MENTIONS)
            }
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
            if (values.length > 0) {
              const { type } = req.body
              if (type === TweetType.Retweet) throw new Error(TWEET_MESSAGES.A_RETWEET_MUST_NOT_HAVE_MEDIAS)
              //must be an array of Media object
              const isMediaArray = values.every((value: any) => {
                return typeof value.url === 'string' && mediaTypeEnum.includes(value.type)
              })
              return isMediaArray
            }
            return true
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
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                ...TweetAdditionalData
              ])
              .toArray()
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      type: {
        optional: true,
        isIn: { options: [tweetTypeEnum] },
        errorMessage: TWEET_MESSAGES.TWEET_TYPE_IS_INVALID
      }
    },
    ['query']
  )
)

export const getTweetsFromFollowingValidator = validate(
  checkSchema(
    {
      type: {
        optional: true,
        isIn: { options: [[TweetType.Tweet, TweetType.Retweet, TweetType.QuoteTweet]] },
        errorMessage: TWEET_MESSAGES.TWEET_TYPE_IS_INVALID
      }
    },
    ['query']
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
