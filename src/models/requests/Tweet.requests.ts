import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'

export interface CreateTweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: { name: string; _id?: string }[]
  mentions: string[]
  medias: Media[]
}
