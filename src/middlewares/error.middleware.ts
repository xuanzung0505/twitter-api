import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: ErrorWithStatus | Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) res.status(err.status).json(omit(err, ['status']))
  else {
    Object.getOwnPropertyNames(err).forEach((value) => {
      Object.defineProperty(err, value, {
        enumerable: true
      })
    })

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      errorInfo: err
      //PRODUCTION ALERT
      // errorInfo: omit(err, ['stack'])
    })
  }
}
