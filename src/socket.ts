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
  try {
    let access_token: null | string = null
    let user_id: null | string = null
    access_token = socket.handshake.auth.access_token
    user_id = socket.handshake.auth.decoded_authorization?.user_id
    if (!access_token || !user_id) throw new Error('Missing token or user id')

    //socket middlewares
    socket.use(async (packet, next) => {
      try {
        await verifyAccessToken({ access_token: access_token as string })
      } catch (error) {
        next(new Error('Unauthorized'))
      }
      next()
    })
    //catch errors from socket middlewares
    socket.on('error', (err) => {
      console.log(err)
      if (err.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('disconnect', () => {
      delete users[user_id as string]
      console.log(`a client disconnected: ${socket.id}`)
      console.log(users)
    })
    socket.on('private_message', (data: { to: string; content: string }) => {
      const receiver_socket_id = users[data.to].socket_id
      console.log('receiver_socket_id', receiver_socket_id)
      socket.to(receiver_socket_id).emit('receive_private_message', {
        content: data.content,
        from: user_id
      })
    })
    users[user_id] = { socket_id: socket.id }
    console.log(users)
  } catch (error) {
    // console.log(error)
    socket.disconnect()
  }
})

export default httpServer
