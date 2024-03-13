import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'
import { ParamsDictionary } from 'express-serve-static-core'
import { Pagination } from './Common.requests'

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

export interface TweetQuery extends Pagination {
  type?: string
}
