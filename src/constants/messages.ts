export const COMMON_MESSAGES = {
  THIS_FEATURE_WILL_BE_AVAILABLE_SOON: 'This feature will be available soon'
} as const

export const USERS_MESSAGES = {
  //VALIDATING ERRORS
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_50: 'Name length must be from 1 to 50',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_100: 'Bio length must be from 1 to 100',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_100: 'Location length must be from 1 to 100',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100: 'Location length must be from 1 to 100',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_4_TO_15: 'Username length must be from 4 to 15',
  USERNAME_IS_INVALID:
    'Username must be 4-15 characters long and must contain at least 1 letter, numbers and underscores',
  USERNAME_IS_REQUIRED: 'Username is required',
  USER_ALREADY_EXISTS: 'User already exists',
  IMAGE_URL_MUST_BE_A_STRING: 'Avatar must be a string',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_100: 'Avatar length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Password confirmation must be a string',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Password confirmation is required',
  PASSWORDS_DO_NOT_MATCH: 'Password confirmation does not match password',
  DATE_OF_BIRTH_MUST_BE_A_STRING: 'Date of birth must be a string',
  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  ACCESS_TOKEN_MUST_BE_A_STRING: 'Access token must be a string',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_MUST_BE_A_STRING: 'Refresh token must be a string',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used / does not exist',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  //OTHER
  REGISTER_SUCCESS: 'Register successfully',
  LOGIN_SUCCESS: 'Login successfully',
  LOGIN_FAILED: 'Login failed',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  LOGOUT_SUCCESS: 'Logout successfully',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  OLD_PASSWORD_IS_INVALID: 'Old password is invalid',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User not verified',
  REFRESH_TOKEN_ROTATE_SUCCESS: 'Refresh token is rotated successfully',
  CHECK_EMAIL_TO_VERIFY_EMAIL: 'Check email to verify email',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  VERIFY_EMAIL_VERIFY_TOKEN_SUCCESS: 'Verify email verify token successfully',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token successfully',
  GET_ME_SUCCESS: 'Get my profile successfully',
  GET_USER_USERNAME_SUCCESS: 'Get user profile by username successfully',
  UPDATE_ME_SUCCESS: 'Update my profile successfully',
  USER_ID_MUST_BE_A_STRING: 'user_id must be a string',
  USER_ID_IS_REQUIRED: 'user_id is required',
  USER_ID_IS_INVALID: 'user_id is invalid',
  FOLLOW_SUCCESS: 'Follow user successfully',
  UNFOLLOW_SUCCESS: 'Unfollow user successfully',
  UNFOLLOW_ALREADY: 'Unfollow user already',
  //MEDIA
  UPLOAD_SUCCESSFULLY: 'Upload successfully',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successfully'
} as const

export const TWEET_MESSAGES = {
  //VALIDATING ERRORS
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_TYPE_IS_INVALID: 'Tweet type is invalid',
  NORMAL_TWEET_MUST_HAVE_NULL_PARENT_ID: 'A normal tweet must have a null parent_id',
  A_RETWEET_MUST_NOT_HAVE_MEDIAS: 'A retweet must not have medias attached',
  TWEET_AUDIENCE_IS_INVALID: 'Tweet audience is invalid',
  TWEET_CONTENT_MUST_BE_A_STRING: 'Tweet content must be a string',
  TWEET_CONTENT_MUST_NOT_BE_EMPTY: 'Tweet content must not be empty',
  TWEET_CONTENT_MUST_BE_EMPTY: 'Tweet content must be empty',
  TWEET_PARENT_ID_MUST_BE_NULL_OR_A_VALID_OBJECT_ID: 'Tweet parent_id must be null or a valid objectId',
  TWEET_HASHTAGS_MUST_BE_AN_ARRAY_OF_HASHTAG_OBJECT: 'Tweet hashtags must be an array of hashtag object',
  TWEET_HASHTAGS_NAMES_MUST_START_WITH_AN_ENGLISH_ALPHABET_CHARACTER: 'Tweet hashtags names must start with a-z or A-Z',
  TWEET_MENTIONS_MUST_BE_AN_ARRAY_OF_OBJECT_ID: 'Tweet mentions must be an array of objectId',
  TWEET_MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Tweet medias must be an array of media object',
  CREATE_TWEET_SUCCESSFULLY: 'Create tweet successfully',
  TWEET_ID_MUST_BE_A_STRING: 'Tweet_id must be a string',
  TWEET_ID_IS_INVALID: 'Tweet_id is invalid',
  GET_TWEET_SUCCESSFULLY: 'Get tweet successfully'
} as const

export const BOOKMARK_MESSAGES = {
  //VALIDATING ERRORS
  ALREADY_ADDED_TO_BOOKMARKS: 'Already added to bookmarks',
  ADD_TO_BOOKMARKS_SUCCESSFULLY: 'Add to bookmarks successfully',
  ADD_TO_BOOKMARKS_FAILED: 'Add to bookmarks failed',
  ID_MUST_BE_A_STRING: 'Id must be a string',
  ID_IS_INVALID: 'Id is invalid',
  ONLY_THE_OWNERS_CAN_REMOVE_FROM_BOOKMARKS: 'Only the owners can remove from their bookmarks',
  BOOKMARK_NOT_FOUND: 'Bookmark not found',
  REMOVE_FROM_BOOKMARKS_SUCCESSFULLY: 'Remove from bookmarks successfully',
  REMOVE_FROM_BOOKMARKS_FAILED: 'Remove from bookmarks failed'
} as const

export const LIKE_MESSAGES = {
  //VALIDATING ERRORS
  LIKE_SUCCESSFULLY: 'Like successfully',
  LIKE_FAILED: 'Like failed',
  LIKE_ID_MUST_BE_A_STRING: 'Like_id must be a string',
  LIKE_ID_IS_INVALID: 'Like_id is invalid',
  ONLY_THE_OWNERS_CAN_UNLIKE: 'Only the owners can unlike their liked tweets',
  LIKE_NOT_FOUND: 'Like not found',
  UNLIKE_SUCCESSFULLY: 'Unlike successfully',
  UNLIKE_FAILED: 'Unlike failed'
} as const
