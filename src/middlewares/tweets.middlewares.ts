import { check, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
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
            return true
          }
        }
      }
    },
    ['params']
  )
)
