import { config } from 'dotenv'

config()
//App config
export const PORT = process.env.PORT || 4000
export const HOST = process.env.HOST

// MONGODB CREDENTIALS
export const DB_NAME = process.env.DB_NAME
export const DB_USERNAME = process.env.DB_USERNAME
export const DB_PASSWORD = process.env.DB_PASSWORD

// MONGODB COLLECTION
export const DB_USERS_COLLECTION = process.env.DB_USERS_COLLECTION
export const DB_REFRESH_TOKENS_COLLECTION = process.env.DB_REFRESH_TOKENS_COLLECTION
export const DB_FOLLOWERS_COLLECTION = process.env.DB_FOLLOWERS_COLLECTION
export const DB_VIDEO_STATUS_COLLECTION = process.env.DB_VIDEO_STATUS_COLLECTION
export const DB_TWEETS_COLLECTION = process.env.DB_TWEETS_COLLECTION
export const DB_HASHTAGS_COLLECTION = process.env.DB_HASHTAGS_COLLECTION
export const DB_BOOKMARKS_COLLECTION = process.env.DB_BOOKMARKS_COLLECTION

// JWT
export const { JWT_SECRET_ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN } = process.env
export const { JWT_SECRET_REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN } = process.env
export const { JWT_SECRET_EMAIL_VERIFY_TOKEN, EMAIL_VERIFY_TOKEN_EXPIRES_IN } = process.env
export const { JWT_SECRET_FORGOT_PASSWORD_TOKEN, FORGOT_PASSWORD_TOKEN_EXPIRES_IN } = process.env

// OAuth with Google
export const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, CLIENT_REDIRECT_CALLBACK } = process.env
