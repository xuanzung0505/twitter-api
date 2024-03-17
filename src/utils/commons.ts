import { USERS_MESSAGES } from '~/constants/messages'
import { JWT_SECRET_ACCESS_TOKEN } from './getEnv'
import { Request } from 'express-validator/src/base'
import { verifyToken } from './jwt'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ErrorWithStatus } from '~/models/Errors'
import { capitalize } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { Socket } from 'socket.io'
import { TokenPayload } from '~/models/requests/User.requests'
import { NextFunction } from 'express'
import { UserVerifyStatus } from '~/constants/enums'
import { ExtendedError } from 'node_modules/socket.io/dist/namespace'

export const convertEnumToNumberArray: (numberEnum: object) => number[] = (numberEnum) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}

export const convertEnumToStringArray: (stringEnum: object) => string[] = (stringEnum) => {
  return Object.values(stringEnum).filter((value) => typeof value === 'string')
}

/**
 * Parse queryString to the desired type (number|undefined), if it fails then return defaultValue
 */
export const parseQuery: <T = { [key: string]: string | undefined }>(
  query: T,
  defaultValue: { [key in keyof T]: number | undefined }
) => typeof defaultValue = (query, defaultValue) => {
  const result = defaultValue
  for (const key in query) {
    const value = Number(query[key]) //null|{} -> 0, otherwise NaN -> this should be NaN
    result[key] = isFinite(value) ? value : defaultValue[key]
  }
  return result
}

export const verifyAccessToken = async (payload: { access_token: string; req?: Request; socket?: Socket }) => {
  const { access_token, req, socket } = payload
  try {
    if (!access_token) throw new Error(USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED)
    const decoded_authorization = await verifyToken({
      token: access_token,
      secret: JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
    }
    if (socket) {
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
    }
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: capitalize(error.message),
        status: HTTP_STATUS.UNAUTHORIZED
      })
    } else throw error
  }
}

export const verifyUser = ({ req, socket }: { req?: Request; socket?: any }) => {
  let decoded_authorization = null
  if (req) {
    decoded_authorization = req.decoded_authorization as TokenPayload
  }
  if (socket) {
    decoded_authorization = socket.decoded_authorization as TokenPayload
  }

  if (decoded_authorization) {
    const verify = decoded_authorization.verify as UserVerifyStatus
    if (verify != UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
}
