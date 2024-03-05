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

/**
 * Description: get an image
 * Path: /image/:name
 * Method: GET
 */
staticRouter.get('/image/:name', wrapRequestHandler(serveImageController))

/**
 * Description: stream a video
 * Path: /video-stream/:name
 * Method: GET
 */
staticRouter.get('/video-stream/:name', wrapRequestHandler(serveVideoStreamController))

/**
 * Description: stream a HLS video
 * Path: /video-hls/:id/master.m3u8
 * Method: GET
 */
staticRouter.get('/video-hls/:id/master.m3u8', wrapRequestHandler(serveM3u8Controller))

/**
 * Description: serve segments for a HLS video
 * Path: /video-hls/:id/:v/:segment
 * Method: GET
 */
staticRouter.get('/video-hls/:id/:v/:segment', wrapRequestHandler(serveSegmentController))

export default staticRouter
