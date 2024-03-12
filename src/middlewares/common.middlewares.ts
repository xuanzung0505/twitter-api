import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { pick } from 'lodash'
import { COMMON_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const filterMiddleware =
  <T>(filterKeys: Array<keyof T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        optional: true,
        isInt: { errorMessage: COMMON_MESSAGES.LIMIT_QUERY_MUST_BE_A_VALID_INTEGER, options: { min: 1, max: 50 } }
      },
      page: {
        optional: true,
        isInt: { errorMessage: COMMON_MESSAGES.PAGE_QUERY_MUST_BE_A_VALID_INTEGER, options: { min: 1 } }
      }
    },
    ['query']
  )
)
