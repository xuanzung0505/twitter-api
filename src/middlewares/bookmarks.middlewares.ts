import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BOOKMARK_MESSAGES, TWEET_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const addToBookmarksValidator = validate(
  checkSchema(
    {
      tweet_id: {
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
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const removeFromBookmarksValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: BOOKMARK_MESSAGES.ID_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) throw new Error(BOOKMARK_MESSAGES.ID_IS_INVALID)
            const bookmark = (await databaseService.bookmarks.findOne({ _id: new ObjectId(value) })) as Bookmark
            const { user_id } = req.decoded_authorization as TokenPayload
            console.log('hehe' == 'hehe')
            if (user_id != bookmark?.user_id.toString())
              throw new ErrorWithStatus({
                status: HTTP_STATUS.FORBIDDEN,
                message: BOOKMARK_MESSAGES.ONLY_THE_OWNERS_CAN_REMOVE_FROM_BOOKMARKS
              })
            return true
          }
        }
      }
    },
    ['params']
  )
)
