import { Request } from 'express'
import User from './models/schemas/User.schema'
import { JwtPayload } from 'jsonwebtoken'
import { TokenPayload } from './models/requests/User.requests'
import Tweet from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    tweet?: Tweet
  }
}
