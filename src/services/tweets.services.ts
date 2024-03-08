import { CreateTweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetsService {
  async createTweet(
    payload: CreateTweetRequestBody & {
      user_id: string
    }
  ) {
    const hashtags = await Promise.all(
      payload.hashtags.map(async (value) => {
        if (value._id) return new ObjectId(value._id)
        //add new hashtags to DB
        const newHashtag = new Hashtag({ name: value.name })
        await databaseService.hashtags.insertOne(newHashtag)
        return newHashtag._id
      })
    )
    const newTweet = new Tweet({
      user_id: new ObjectId(payload.user_id),
      type: payload.type,
      audience: payload.audience,
      content: payload.content,
      parent_id: payload.parent_id ? new ObjectId(payload.parent_id) : null,
      hashtags: hashtags,
      mentions: payload.mentions.map((value) => new ObjectId(value)),
      medias: payload.medias
    })
    const result = await databaseService.tweets.insertOne(newTweet)
    if (result.acknowledged === true) return newTweet
    return result
  }

  async getTweetByID(id: string) {
    const result = await databaseService.tweets.findOne({
      _id: new ObjectId(id)
    })
    return result
  }
}

const tweetsService = new TweetsService()
export default tweetsService
