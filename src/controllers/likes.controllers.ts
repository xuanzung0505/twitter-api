import { NextFunction, Request, RequestHandler, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { LIKE_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'

export const likeController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await likesService.like(user_id, tweet_id)
  if (result)
    return res.status(HTTP_STATUS.OK).json({
      message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
      result
    })
  return res.status(HTTP_STATUS.OK).json({
    message: LIKE_MESSAGES.LIKE_FAILED
  })
}

export const unlikeController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const result = await likesService.unlike(id)
  console.log(result)
  if (result)
    return res.status(HTTP_STATUS.OK).json({
      message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY,
      result
    })
  return res.status(HTTP_STATUS.OK).json({
    message: LIKE_MESSAGES.UNLIKE_FAILED
  })
}
