import { TweetAudience, TweetType } from '~/constants/enums'
import Hashtag from '../schemas/Hashtag.schema'
import { Media } from '../Others'

export interface CreateTweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: Hashtag[]
  mentions: string[]
  medias: Media[]
}
