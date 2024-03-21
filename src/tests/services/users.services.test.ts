import { describe, it, expect, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { UserService } from '~/services/users.services'
import { signToken } from '~/utils/jwt'
jest.mock('~/services/users.services')

describe('/register', () => {
  it('200 OK', async () => {
    const mockRequestBody = {
      name: 'test_user',
      email: 'test@email.com',
      password: 'testpassword',
      confirm_password: 'testpassword',
      date_of_birth: new Date().toISOString()
    }
    const mockUserService = new UserService()
    const mockUserId = new ObjectId()
    ;(mockUserService.getSignAccessAndRefreshToken as jest.Mock).mockReturnValue(
      ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) =>
        Promise.all([
          signToken({
            payload: { user_id: user_id, verify: verify, token_type: TokenType.AccessToken },
            secret: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {
              expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string
            }
          }),
          signToken({
            payload: { user_id: user_id, verify: verify, token_type: TokenType.RefreshToken },
            secret: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {}
          })
        ])
    )
    //3.save refresh_token
    const [access_token, refresh_token] = await mockUserService.getSignAccessAndRefreshToken()({
      user_id: mockUserId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    ;(mockUserService.register as jest.Mock).mockResolvedValue(
      Promise.resolve({ access_token, refresh_token }) as never
    )
    const result = await mockUserService.register(mockRequestBody)
    expect(result).toStrictEqual({
      access_token,
      refresh_token
    })
  })
})
