import { ParamSchema, checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { JsonWebTokenError } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { capitalize } from 'lodash'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { comparePassword } from '~/utils/bcrypt'
import { REGEX_USERNAME } from '~/constants/regex'
import {
  JWT_SECRET_ACCESS_TOKEN,
  JWT_SECRET_EMAIL_VERIFY_TOKEN,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN,
  JWT_SECRET_REFRESH_TOKEN
} from '~/utils/getEnv'

const nameSchema: ParamSchema = {
  isString: { errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING },
  trim: true,
  notEmpty: { errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED },
  isLength: {
    options: {
      min: 1,
      max: 50
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_50
  }
}

const emailSchema: ParamSchema = {
  isString: true,
  trim: true,
  notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
  isEmail: true,
  custom: {
    options: async (value, { req }) => {
      const user = await databaseService.users.findOne({ email: value })
      if (user == null) throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
      req.user = user
    }
  },
  errorMessage: 'Invalid email'
}

const passwordSchema: ParamSchema = {
  isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
  notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
  isStrongPassword: {
    options: {
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  },
  errorMessage: 'Invalid password'
}

const confirmPasswordSchema: ParamSchema = {
  isString: { errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING },
  notEmpty: { errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  custom: {
    options: (value, { req }) => {
      if (value != req.body.password) throw new Error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      return true
    }
  },
  errorMessage: 'Invalid password confirmation'
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED },
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  },
  errorMessage: 'Invalid date of birth'
}

const forgotPasswordTokenSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED },
  custom: {
    options: async (value: string, { req }) => {
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secret: JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const user = (await databaseService.users.findOne({
          _id: new ObjectId(decoded_forgot_password_token.user_id)
        })) as User
        if (user == null)
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        if (user.forgot_password_token != value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.user = user
      } catch (error) {
        if (error instanceof JsonWebTokenError)
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        else throw error
      }
      return true
    }
  }
}

const userIdSchema: ParamSchema = {
  isString: { errorMessage: USERS_MESSAGES.USER_ID_MUST_BE_A_STRING },
  trim: true,
  notEmpty: { errorMessage: USERS_MESSAGES.USER_ID_IS_REQUIRED },
  custom: {
    options: async (value, { req }) => {
      const isValidObjectId = ObjectId.isValid(value)
      if (!isValidObjectId)
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_ID_IS_INVALID,
          status: HTTP_STATUS.NOT_FOUND
        })
      if (value === (req.decoded_authorization as TokenPayload).user_id)
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_ID_IS_INVALID,
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY
        })
      const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (!user) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      if (user.verify != UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      return true
    }
  }
}

const imageUrlSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const usernameSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING },
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      const matchedPattern = value.match(REGEX_USERNAME)
      if (matchedPattern == null || matchedPattern[0] != value) {
        throw new Error(USERS_MESSAGES.USERNAME_IS_INVALID)
      }
      const decoded_authorization = req.decoded_authorization as TokenPayload
      const { user_id } = decoded_authorization
      const otherUser = await databaseService.users.findOne({
        username: value,
        _id: { $ne: new ObjectId(user_id) }
      })
      if (otherUser) {
        throw new Error(USERS_MESSAGES.USER_ALREADY_EXISTS)
      }
      return true
    }
  }
}

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isString: true,
        trim: true,
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: true,
        custom: {
          options: async (value, { req }) => {
            const isEmailExist = await userService.checkEmailExist({ email: value })
            if (isEmailExist)
              //
              // throw new ErrorWithStatus({ message: 'Email already exists', status: HTTP_STATUS.UNAUTHORIZED })
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            return true
          }
        },
        errorMessage: 'Invalid email'
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isString: true,
        trim: true,
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (user == null) throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            req.user = user
          }
        },
        errorMessage: 'Invalid email'
      },
      password: {
        isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
        notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        errorMessage: 'Invalid password'
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const access_token = value.split(' ')[1]
              if (!access_token) throw new Error(USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED)
              const decoded_authorization = await verifyToken({
                token: access_token,
                secret: JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else throw error
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: { errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secret: JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token == null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              else throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const logoutValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const access_token = value.split(' ')[1]
              if (!access_token) throw new Error(USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED)
              const decoded_authorization = await verifyToken({
                token: access_token,
                secret: JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else throw error
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const emailVerifyValidator = validate(
  checkSchema(
    {
      email: emailSchema
    },
    ['body']
  )
)

export const verifyEmailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secret: JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              const user = (await databaseService.users.findOne({
                _id: new ObjectId(decoded_email_verify_token.user_id)
              })) as User
              if (user == null)
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              if (user.email_verify_token != value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.user = user
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              else throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: emailSchema
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      Authorization: {
        optional: true,
        in: 'headers',
        notEmpty: { errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const access_token = value.split(' ')[1]
              if (!access_token) throw new Error(USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED)
              const decoded_authorization = await verifyToken({
                token: access_token,
                secret: JWT_SECRET_ACCESS_TOKEN as string
              })
              const { user_id } = decoded_authorization
              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
              if (!user)
                throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.UNAUTHORIZED })
              req.user = user
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else throw error
            }
            return true
          }
        }
      },
      forgot_password_token: {
        optional: true,
        ...forgotPasswordTokenSchema
      },
      old_password: {
        optional: true,
        ...passwordSchema
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const oldPasswordValidator = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.decoded_authorization) {
    if (!req.body.old_password) {
      return next(
        new ErrorWithStatus({ message: USERS_MESSAGES.OLD_PASSWORD_IS_INVALID, status: HTTP_STATUS.UNAUTHORIZED })
      )
    }
    const user = req.user as User
    const hashedPassword = user.password
    const password = req.body.old_password
    const result = await comparePassword(password, hashedPassword)
    if (result == false) {
      return next(
        new ErrorWithStatus({ message: USERS_MESSAGES.OLD_PASSWORD_IS_INVALID, status: HTTP_STATUS.UNAUTHORIZED })
      )
    }
  }
  next()
}

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const decoded_authorization = req.decoded_authorization as TokenPayload
  const verify = decoded_authorization.verify as UserVerifyStatus
  if (verify != UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  return next()
}

export const getUserByUsernameValidator = validate(
  checkSchema(
    {
      username: {
        isString: { errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING },
        trim: true,
        notEmpty: { errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED }
      }
    },
    ['params']
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },
      location: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING },
        trim: true
      },
      website: {
        optional: true,
        isString: { errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },
      username: usernameSchema,
      avatar: imageUrlSchema,
      cover_photo: imageUrlSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)
