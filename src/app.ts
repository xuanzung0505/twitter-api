import express from 'express'
import userRouter from '~/routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middleware'

const app = express()
app.use(express.json())
app.use('/users', userRouter)
app.use(defaultErrorHandler)

export default app
