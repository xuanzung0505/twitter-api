import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/static.controllers'
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

export default staticRouter
