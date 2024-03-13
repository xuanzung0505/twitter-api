import { checkSchema } from 'express-validator'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      q: {
        isString: { errorMessage: SEARCH_MESSAGES.QUERY_MUST_BE_A_STRING },
        trim: true,
        notEmpty: { errorMessage: SEARCH_MESSAGES.QUERY_MUST_NOT_BE_EMPTY }
      }
    },
    ['query']
  )
)
