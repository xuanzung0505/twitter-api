import { Router } from 'express'
import {
  loginController,
  logoutController,
  getMeController,
  registerController,
  forgotPasswordController,
  verifyForgotPasswordController,
  emailVerifyController,
  verifyEmailVerifyController,
  updateMeController,
  resetPasswordController,
  followController,
  unfollowController,
  refreshTokenController,
  googleOAuthController,
  getUserByUsernameController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyValidator,
  followValidator,
  forgotPasswordValidator,
  getUserByUsernameValidator,
  loginValidator,
  oldPasswordValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailVerifyTokenValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middleware'
import { UpdateMeRequestBody } from '~/models/requests/user.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

/**
 * Description: Register a user
 * Path: /register
 * Method: POST
 * Body: {name: string, email:string, password: string, confirm_password: string, date_of_birth: string}
 */
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login a user
 * Path: /login
 * Method: POST
 * Body: { email:string, password: string}
 */
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: OAuth 2.0 with Google
 * Path: /oauth/google
 * Method: GET
 */

userRouter.get('/oauth/google', wrapRequestHandler(googleOAuthController))

/**
 * Description: Current access_token is expired, request a new access_token
 * Path: /refresh_token
 * Method: POST
 * Body: { refresh_token: string }
 */
userRouter.post('/refresh_token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Logout a user
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: { refresh_token: string }
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Submit email to verify user's email, send email to user
 * Path: /verify-email-token
 * Method: POST
 * Body: { email: string }
 */
userRouter.post('/verify-email-token', emailVerifyValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description: Verify link in email to verify user's email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
userRouter.post('/verify-email', verifyEmailVerifyTokenValidator, wrapRequestHandler(verifyEmailVerifyController))

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
userRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
userRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: reset password for logged-in user or user who forgot password
 * Path: /reset-password
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * OR
 * Body: { old_password?: string, forgot_password_token?: string, password: string, confirm_password: string }
 */
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  oldPasswordValidator,
  wrapRequestHandler(resetPasswordController)
)

/**
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Get user profile by username
 * Path: /:username
 * Method: GET
 */
userRouter.get('/:username', getUserByUsernameValidator, wrapRequestHandler(getUserByUsernameController))

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * Body: UserSchema
 */
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    'name',
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Follow user
 * Path: /follow
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: { followed_user_id: string }
 */

userRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description: Unfollow user
 * Path: /follow/:user_id
 * Method: DELETE
 * Header: {Authorization: Bearer <access_token>}
 */

userRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

export default userRouter
