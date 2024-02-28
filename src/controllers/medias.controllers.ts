import { NextFunction, Request, RequestHandler, Response } from 'express'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadSingleImage(req)
  return res.status(200).json({
    result
  })
}
