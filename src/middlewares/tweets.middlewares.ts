import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { TWEET_MESSAGES } from '~/constants/messages'
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
          options: (value: null | string, { req }) => {
            const isValidParentId = value === null || ObjectId.isValid(value)
            if (!isValidParentId) throw new Error(TWEET_MESSAGES.TWEET_PARENT_ID_MUST_BE_NULL_OR_A_VALID_OBJECT_ID)
            //CHECK parent exists
            return isValidParentId
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (values: any[], { req }) => {
            //must be an array of string, each one starts with a letter a-zA-Z
            return values.every((value) => {
              if (typeof value != 'string') throw TWEET_MESSAGES.TWEET_HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING
              if (!value.match(/[A-Za-z]+/g))
                throw TWEET_MESSAGES.TWEET_HASHTAGS_MUST_START_WITH_AN_ENGLISH_ALPHABET_CHARACTER

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
