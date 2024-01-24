import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/user.requests'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { comparePassword, hashPassword } from '~/utils/bcrypt'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { JwtPayload } from 'jsonwebtoken'

config()
const JWT_SECRET_ACCESS_TOKEN = process.env.JWT_SECRET_ACCESS_TOKEN
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN
const JWT_SECRET_REFRESH_TOKEN = process.env.JWT_SECRET_REFRESH_TOKEN
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN
const JWT_SECRET_EMAIL_VERIFY_TOKEN = process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN
const EMAIL_VERIFY_TOKEN_EXPIRES_IN = process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
const JWT_SECRET_FORGOT_PASSWORD_TOKEN = process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN
const FORGOT_PASSWORD_TOKEN_EXPIRES_IN = process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN

class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.AccessToken },
      secret: JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN as string
      }
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.RefreshToken },
      secret: JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN as string
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.EmailVerifyToken },
      secret: JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: EMAIL_VERIFY_TOKEN_EXPIRES_IN as string
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.ForgotPasswordToken },
      secret: JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string
      }
    })
  }

  async register(payload: RegisterRequestBody) {
    const hashedPassword = await hashPassword(payload.password)

    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashedPassword,
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(payload: { email: string }) {
    const { email } = payload
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }

  async login(payload: { user_id: string; verify: UserVerifyStatus; password: string; hashedPassword: string }) {
    const { user_id, verify, password, hashedPassword } = payload
    const checkPassword = await comparePassword(password, hashedPassword)
    if (checkPassword) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
      )
      return {
        access_token,
        refresh_token
      }
    }
    throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT, status: 422 })
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return result
  }

  async emailVerify({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify })
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { email_verify_token, updated_at: '$$NOW' }
      }
    ])

    //send mail with url: DOMAIN/verify-email?email_verify_token=email_verify_token
    console.log(JSON.stringify({ email_verify_token }))
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_VERIFY_EMAIL
    }
  }

  async verifyEmailVerify(user_id: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { verify: UserVerifyStatus.Verified, email_verify_token: '', updated_at: '$$NOW' }
      }
    ])
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { forgot_password_token, updated_at: '$$NOW' }
      }
    ])

    //send mail with url: DOMAIN/forgot-password?token=token
    console.log(JSON.stringify({ forgot_password_token }))
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword({
    user_id,
    decoded_authorization,
    password
  }: {
    user_id: ObjectId
    decoded_authorization: JwtPayload | undefined
    password: string
  }) {
    const hashedPassword = await hashPassword(password)
    if (decoded_authorization) {
      return await databaseService.users.updateOne(
        { _id: user_id },
        {
          $set: { password: hashedPassword },
          $currentDate: {
            updated_at: true
          }
        }
      )
    }
    return await databaseService.users.updateOne(
      { _id: user_id },
      {
        $set: { password: hashedPassword, forgot_password_token: '' },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeRequestBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
}

const userService = new UserService()
export default userService
