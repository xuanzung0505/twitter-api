import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'
import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface CreateTweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: { name: string; _id?: string }[]
  mentions: string[]
  medias: Media[]
}

export interface TweetParam extends ParamsDictionary {
  id: string
}

export interface TweetQuery extends Query {
  type: string
  limit: string
  page: string
}
