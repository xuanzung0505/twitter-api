import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = Router()

/**
 * Description: upload an image
 * Path: /upload-image
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
mediaRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

/**
 * Description: upload a video
 * Path: /upload-video
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
mediaRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

/**
 * Description: upload a HLS video
 * Path: /upload-video-hls
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
mediaRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

/**
 * Description: get a video encode status
 * Path: /video-status/:id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
mediaRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
)

export default mediaRouter
