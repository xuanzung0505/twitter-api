import { Router } from 'express'
import {
  serveImageController,
  serveM3u8Controller,
  serveSegmentController,
  serveVideoStreamController
} from '~/controllers/static.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get(
  '/image/:name',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(serveImageController)
)

staticRouter.get(
  '/video-stream/:name',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(serveVideoStreamController)
)

staticRouter.get(
  '/video-hls/:id/master.m3u8',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(serveM3u8Controller)
)

staticRouter.get(
  '/video-hls/:id/:v/:segment',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(serveSegmentController)
)

export default staticRouter
