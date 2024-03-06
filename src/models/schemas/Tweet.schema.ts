import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'

interface TweetContructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  createdAt: Date
  updatedAt: Date
}

export default class Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    user_id,
    type,
    audience,
    content,
    parent_id,
    hashtags,
    mentions,
    medias,
    guest_views,
    user_views,
    createdAt,
    updatedAt
  }: TweetContructor) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id
    this.hashtags = hashtags
    this.mentions = mentions
    this.medias = medias
    this.guest_views = guest_views | 0
    this.user_views = user_views | 0
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
  }
}
