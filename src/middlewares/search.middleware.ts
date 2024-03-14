import { checkSchema } from 'express-validator'
import { FilterQuery, PeopleFilterQuery } from '~/constants/enums'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { convertEnumToStringArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const searchQueryFieldEnum = convertEnumToStringArray(FilterQuery)

export const searchValidator = validate(
  checkSchema(
    {
      q: {
        isString: { errorMessage: SEARCH_MESSAGES.QUERY_MUST_BE_A_STRING },
        trim: true,
        notEmpty: { errorMessage: SEARCH_MESSAGES.QUERY_MUST_NOT_BE_EMPTY }
      },
      f: {
        isString: { errorMessage: SEARCH_MESSAGES.FILTER_QUERY_MUST_BE_A_STRING },
        trim: true,
        notEmpty: { errorMessage: SEARCH_MESSAGES.FILTER_QUERY_NOT_BE_EMPTY },
        isIn: { options: [searchQueryFieldEnum] },
        errorMessage: SEARCH_MESSAGES.FILTER_QUERY_IS_INVALID
      },
      pf: {
        optional: true,
        isString: { errorMessage: SEARCH_MESSAGES.PEOPLE_FILTER_QUERY_MUST_BE_A_STRING },
        trim: true,
        isIn: { options: [[PeopleFilterQuery.ON]] },
        errorMessage: SEARCH_MESSAGES.PEOPLE_FILTER_QUERY_IS_INVALID
      }
    },
    ['query']
  )
)
