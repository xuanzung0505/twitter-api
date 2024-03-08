import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { LIKE_MESSAGES, TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Like from '~/models/schemas/Like.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

/**
 * Make sure the like reaction exists in DB, and the user who makes the request owns that like reaction.
 */
export const unlikeValidator = validate(
  checkSchema(
    {
      id: {
        isString: { errorMessage: TWEET_MESSAGES.TWEET_ID_MUST_BE_A_STRING },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) throw new Error(LIKE_MESSAGES.LIKE_ID_IS_INVALID)
            const like = (await databaseService.likes.findOne({
              _id: new ObjectId(value)
            })) as Like
            if (!like)
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: LIKE_MESSAGES.LIKE_NOT_FOUND
              })
            const { user_id } = req.decoded_authorization as TokenPayload
            if (user_id != like.user_id.toString())
              throw new ErrorWithStatus({
                status: HTTP_STATUS.FORBIDDEN,
                message: LIKE_MESSAGES.ONLY_THE_OWNERS_CAN_UNLIKE
              })
            return true
          }
        }
      }
    },
    ['params']
  )
)
