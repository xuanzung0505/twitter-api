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
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PORT_SOCKET } from './utils/getEnv'

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

//socket.io
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})
const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log(`a client connected: ${socket.id}`)
  const user_id = socket.handshake.auth._id
  users[user_id] = { socket_id: socket.id }
  console.log(users)
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`a client disconnected: ${socket.id}`)
    console.log(users)
  })
  socket.on('private_message', (data) => {
    const receiver_socket_id = users[data.to].socket_id
    socket.to(receiver_socket_id).emit('receive_private_message', {
      content: data.content,
      from: user_id
    })
  })
})
httpServer.listen(PORT_SOCKET)

export { app, httpServer }
