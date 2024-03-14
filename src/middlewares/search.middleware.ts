import { checkSchema } from 'express-validator'
import { SearchQueryField } from '~/constants/enums'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { convertEnumToStringArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const searchQueryFieldEnum = convertEnumToStringArray(SearchQueryField)

export const searchValidator = validate(
  checkSchema(
    {
      q: {
        isString: { errorMessage: SEARCH_MESSAGES.QUERY_MUST_BE_A_STRING },
        trim: true,
        notEmpty: { errorMessage: SEARCH_MESSAGES.QUERY_MUST_NOT_BE_EMPTY }
      },
      f: {
        isString: { errorMessage: SEARCH_MESSAGES.FIELD_MUST_BE_A_STRING },
        trim: true,
        notEmpty: { errorMessage: SEARCH_MESSAGES.FIELD_MUST_NOT_BE_EMPTY },
        isIn: { options: [searchQueryFieldEnum] },
        errorMessage: SEARCH_MESSAGES.FIELD_IS_INVALID
      }
    },
    ['query']
  )
)
