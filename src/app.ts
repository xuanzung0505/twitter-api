import express from 'express'
import userRouter from '~/routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRouter from './routes/medias.routes'

const app = express()
app.use(express.json())
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use(defaultErrorHandler)

export default app
