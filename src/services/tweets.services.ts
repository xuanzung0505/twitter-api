import { CreateTweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'

class TweetService {
  async createTweet(
    payload: CreateTweetRequestBody & {
      user_id: string
    }
  ) {
    const { user_id } = payload
    // const result = await databaseService.tweets.insertOne()
    const result = true
    return result
  }
}

const tweetService = new TweetService()
export default tweetService
