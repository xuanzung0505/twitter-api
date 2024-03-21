import { describe, it, expect, jest } from '@jest/globals'
import { createRequest, createResponse } from 'node-mocks-http'
import userService from '~/services/users.services'
import { signToken } from '~/utils/jwt'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { registerController } from '~/controllers/users.controllers'
import { USERS_MESSAGES } from '~/constants/messages'
jest.mock('~/services/users.services')

describe('/register', () => {
  it('200 OK', async () => {
    const user = {
      _id: new ObjectId(),
      name: 'user_test',
      email: 'test@gmail.com',
      password: 'password1234567',
      date_of_birth: new Date().toISOString()
    }
    const access_token = await signToken({
      payload: { user_id: user._id, verify: UserVerifyStatus.Unverified, token_type: TokenType.AccessToken },
      secret: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string
      }
    })
    const refresh_token = await signToken({
      payload: { user_id: user._id, verify: UserVerifyStatus.Unverified, token_type: TokenType.RefreshToken },
      secret: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {}
    })
    ;(userService.register as jest.Mock).mockResolvedValue({ access_token, refresh_token } as never)
    const body = {
      ...user,
      confirm_password: user.password
    }
    const mockRequest = createRequest({
      method: 'POST',
      url: '/users/register',
      body,
      headers: { 'Content-Type': 'application/json' }
    })
    const mockResponse = createResponse()
    const mockNext = jest.fn()
    await registerController(mockRequest, mockResponse, mockNext)
    const data: any = mockResponse._getJSONData()
    expect(mockResponse.statusCode).toBe(200)
    expect(data.message).toBe(USERS_MESSAGES.REGISTER_SUCCESS)
  })
})
