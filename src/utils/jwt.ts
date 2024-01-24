import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/user.requests'

export const signToken = ({
  payload,
  secret,
  options = { algorithm: 'HS256', expiresIn: '15m' }
}: {
  payload: any
  secret: string
  options?: SignOptions
}) => {
  const token = new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, options, function (err, token) {
      if (err) {
        throw err
      }
      resolve(token as string)
    })
  })

  return token
}

export const verifyToken = ({ token, secret }: { token: string; secret: string }) => {
  const decoded = new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) reject(error)
      resolve(decoded as TokenPayload)
    })
  })

  return decoded
}
