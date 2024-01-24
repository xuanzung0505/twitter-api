import { RequestHandler, Request, Response, NextFunction } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import {
  EmailVerifyRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UpdateMeRequestBody,
  VerifyEmailVerifyRequestBody,
  VerifyForgotPasswordRequestBody
} from '~/models/requests/user.requests'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import { JwtPayload } from 'jsonwebtoken'
import { UserVerifyStatus } from '~/constants/enums'

export const registerController: RequestHandler = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController: RequestHandler = async (
  req: Request<ParamsDictionary, any, LoginRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify as UserVerifyStatus

  const result = await userService.login({
    user_id: user_id.toString(),
    verify,
    password: req.body.password,
    hashedPassword: user.password
  })

  if (result)
    res.status(200).json({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      result
    })
  else {
    res.status(200).json({
      message: USERS_MESSAGES.LOGIN_FAILED,
      result
    })
  }
}

export const logoutController: RequestHandler = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.status(200).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS,
    result
  })
}

export const emailVerifyController: RequestHandler = async (
  req: Request<ParamsDictionary, any, EmailVerifyRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify as UserVerifyStatus

  const result = await userService.emailVerify({ user_id: user_id.toString(), verify })

  res.status(200).json(result)
}

export const verifyEmailVerifyController: RequestHandler = async (
  req: Request<ParamsDictionary, any, VerifyEmailVerifyRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await userService.verifyEmailVerify(user_id.toString())

  res.status(200).json({
    message: USERS_MESSAGES.VERIFY_EMAIL_VERIFY_TOKEN_SUCCESS,
    result
  })
}

export const forgotPasswordController: RequestHandler = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify as UserVerifyStatus
  const result = await userService.forgotPassword({ user_id: user_id.toString(), verify })

  res.status(200).json(result)
}

export const verifyForgotPasswordController: RequestHandler = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
export const resetPasswordController: RequestHandler = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  //For users who is still logged in
  //For users who forgot the password
  const user = req.user as User
  const user_id = user._id as ObjectId
  const decoded_authorization = req.decoded_authorization

  const { password: newPassword } = req.body
  const result = await userService.resetPassword({ user_id, decoded_authorization, password: newPassword })

  res.status(200).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
    result
  })
}

export const getMeController: RequestHandler = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getMe(user_id)
  res.status(200).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

export const updateMeController: RequestHandler = async (
  req: Request<ParamsDictionary, any, UpdateMeRequestBody, Query, Record<string, any>>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req

  const result = await userService.updateMe(user_id, body)
  res.status(200).json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}
