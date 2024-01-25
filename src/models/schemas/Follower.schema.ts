import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'

interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date

  constructor(follower: FollowerType) {
    this._id = follower._id || undefined
    this.user_id = follower.user_id || ''
    this.followed_user_id = follower.followed_user_id || ''
    this.created_at = follower.created_at || new Date()
  }

  getId() {
    return this._id
  }

  getUserId() {
    return this.user_id
  }

  getFollowedUserId() {
    return this.followed_user_id
  }

  getCreatedAt() {
    return this.created_at
  }
}
