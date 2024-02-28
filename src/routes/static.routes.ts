import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/static.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:name', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(serveImageController))

staticRouter.get('/video/:name', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(serveVideoController))

export default staticRouter
