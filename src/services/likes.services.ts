import { ObjectId } from 'mongodb'
import Like from '~/models/schemas/Like.schema'
import databaseService from './database.services'

class LikesService {
  async like(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      { $setOnInsert: { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) } },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }

  async unlike(id: string) {
    const result = await databaseService.likes.findOneAndDelete({
      _id: new ObjectId(id)
    })
    return result
  }
}

const likesService = new LikesService()
export default likesService
