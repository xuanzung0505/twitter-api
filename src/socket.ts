import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './app'
import { verifyAccessToken, verifyUser } from './utils/commons'
import { USERS_MESSAGES } from './constants/messages'
import { TokenPayload } from './models/requests/User.requests'

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

//server middlewares
io.use(async (socket, next) => {
  const { Authorization } = socket.handshake.auth
  const access_token = Authorization.split(' ')[1]

  try {
    await verifyAccessToken({ access_token, socket })
  } catch (error) {
    next({
      message: 'Socket unauthorized',
      name: 'UnauthorizedError',
      data: error
    })
  }
  next()
})

io.use(async (socket, next) => {
  try {
    verifyUser({ socket })
  } catch (error) {
    next({
      message: USERS_MESSAGES.USER_NOT_VERIFIED,
      name: 'NotVerifiedError',
      data: error
    })
  }
  next()
})

io.on('connection', (socket) => {
  console.log(`a client connected: ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`a client disconnected: ${socket.id}`)
    console.log(users)
  })
  try {
    const access_token = socket.handshake.auth.access_token as string
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = { socket_id: socket.id }
    console.log(users)

    //socket middlewares
    socket.use(async (packet, next) => {
      try {
        await verifyAccessToken({ access_token })
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })
    //catch errors from socket middlewares
    socket.on('error', (err) => {
      console.log(err)
      if (err.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('private_message', (data) => {
      const receiver_socket_id = users[data.to].socket_id
      socket.to(receiver_socket_id).emit('receive_private_message', {
        content: data.content,
        from: user_id
      })
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`a client disconnected: ${socket.id}`)
      console.log(users)
    })
  } catch (error) {
    // console.log(error)
    socket.disconnect()
  }
})

export default httpServer
