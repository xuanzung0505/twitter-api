import { RequestHandler, Request, Response, NextFunction } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'

export const addToBookmarksController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await bookmarksService.addToBookmarks(user_id, tweet_id)

  if (result)
    return res.status(HTTP_STATUS.OK).json({
      message: BOOKMARK_MESSAGES.ADD_TO_BOOKMARKS_SUCCESSFULLY,
      result
    })

  return res.status(HTTP_STATUS.OK).json({
    message: BOOKMARK_MESSAGES.ADD_TO_BOOKMARKS_FAILED
  })
}

export const removeFromBookmarksController: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const result = await bookmarksService.removeFromBookmarks(id)

  if (result)
    return res.status(HTTP_STATUS.OK).json({
      message: BOOKMARK_MESSAGES.REMOVE_FROM_BOOKMARKS_SUCCESSFULLY,
      result
    })

  return res.status(HTTP_STATUS.OK).json({
    message: BOOKMARK_MESSAGES.REMOVE_FROM_BOOKMARKS_FAILED
  })
}
