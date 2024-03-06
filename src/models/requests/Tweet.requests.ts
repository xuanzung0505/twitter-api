import { TweetAudience, TweetType } from '~/constants/enums'

export interface CreateTweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  // medias: string[]
}
