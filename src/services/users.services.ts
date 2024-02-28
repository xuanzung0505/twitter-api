import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody, TokenPayload, UpdateMeRequestBody } from '~/models/requests/user.requests'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { comparePassword, hashPassword } from '~/utils/bcrypt'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { JwtPayload } from 'jsonwebtoken'
import axios from 'axios'
import HTTP_STATUS from '~/constants/httpStatus'
import { randomBytes } from 'crypto'
import {
  JWT_SECRET_ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRES_IN,
  JWT_SECRET_REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRES_IN,
  JWT_SECRET_EMAIL_VERIFY_TOKEN,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
} from '~/utils/getEnv'

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

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.RefreshToken },
      secret: JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: exp ?? (REFRESH_TOKEN_EXPIRES_IN as string)
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

  private async getGoogleOAuthToken(code: string) {
    const body = {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      expires_in: number
      refresh_token: string
      scope: string
      token_type: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const hashedPassword = await hashPassword(payload.password)
    //1.insert
    const insertResult = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashedPassword
      })
    )
    //2.update
    await databaseService.users.updateOne({ _id: user_id }, [
      {
        $set: { email_verify_token, updated_at: '$$NOW' }
      }
    ])
    //send mail with url: DOMAIN/verify-email?email_verify_token=email_verify_token
    console.log(JSON.stringify({ email_verify_token }))
    //3.save refresh_token
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
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

  async googleOAuth(code: string) {
    const { id_token, access_token } = await this.getGoogleOAuthToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    console.log(userInfo)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const { email, name, picture } = userInfo
    //check if email exists in the system
    //if email exists then log in + verify that user, else insert new credentials
    const user = await databaseService.users.findOneAndUpdate(
      { email },
      { $set: { verify: UserVerifyStatus.Verified, email_verify_token: '' }, $currentDate: { updated_at: true } },
      {
        returnDocument: 'after'
      }
    )
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      await databaseService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id: user._id }))
      return {
        access_token,
        refresh_token,
        new_user: 0
      }
    } else {
      const user_id = new ObjectId()
      const hashedPassword = await hashPassword(randomBytes(32).toString('hex'))
      const [insertResult, [access_token, refresh_token]] = await Promise.all([
        databaseService.users.insertOne(
          new User({
            _id: user_id,
            name,
            email,
            date_of_birth: new Date(),
            password: hashedPassword,
            verify: UserVerifyStatus.Verified,
            username: `user${user_id.toString()}`,
            avatar: picture
          })
        ),
        this.signAccessAndRefreshToken({
          user_id: user_id.toString(),
          verify: UserVerifyStatus.Verified
        })
      ])
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
      )
      return {
        access_token,
        refresh_token,
        new_user: 1
      }
    }
  }

  async rotateRefreshToken(payload: { refresh_token: string; decoded_refresh_token: TokenPayload }) {
    const { refresh_token: old_refresh_token, decoded_refresh_token } = payload
    const { user_id, verify } = decoded_refresh_token
    const exp = decoded_refresh_token.exp as number

    //delete current refresh_token
    //create new refresh_token + new access_token, retain old refresh_token's exp date
    //save new refresh_token
    const [deleleResult, access_token, refresh_token] = await Promise.all([
      databaseService.refreshTokens.deleteOne({ token: old_refresh_token }),
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp })
    ])
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )

    return {
      access_token,
      refresh_token
    }
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
    const [token, updateResult] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: { verify: UserVerifyStatus.Verified, email_verify_token: '', updated_at: '$$NOW' }
        }
      ])
    ])

    const [access_token, refresh_token] = token
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return {
      access_token,
      refresh_token
    }
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

  async follow(payload: { user_id: ObjectId; followed_user_id: ObjectId }) {
    const { user_id, followed_user_id } = payload
    const result = await databaseService.followers.findOneAndUpdate(
      { user_id, followed_user_id },
      { $set: { ...payload } },
      { upsert: true, returnDocument: 'after' }
    )
    return result
  }

  async unfollow(payload: { user_id: ObjectId; followed_user_id: ObjectId }) {
    const { user_id, followed_user_id } = payload
    const result = await databaseService.followers.findOneAndDelete({ user_id, followed_user_id })
    return result
  }
}

const userService = new UserService()
export default userService
