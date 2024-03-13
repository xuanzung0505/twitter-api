import express from 'express'
import userRouter from '~/routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRouter from './routes/medias.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetRouter from './routes/tweets.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import likeRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'

const app = express()
app.use(express.json())
app.use(cors())
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/tweets', tweetRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
app.use('/search', searchRouter)
app.use(defaultErrorHandler)

export default app
