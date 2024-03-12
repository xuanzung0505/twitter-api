import { CreateTweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetAdditionalData } from '~/utils/pipelines'

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

  async increaseView(tweet_id: string, user_id: string | null) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    )
    return result
  }

  async getTweetChildren({
    id,
    type,
    limit,
    page
  }: {
    id: string
    type: number | undefined
    limit: number | undefined
    page: number | undefined
  }) {
    const filter: { parent_id: ObjectId; type?: number } = { parent_id: new ObjectId(id) }
    if (typeof type === 'number') filter.type = type

    const result = await databaseService.tweets
      .aggregate<{ metadata: { totalDocs: number }; data: Tweet[] }>([
        {
          $match: filter
        },
        {
          $facet: {
            metadata: [
              {
                $count: 'totalDocs'
              }
            ],
            data: [
              {
                $skip: ((page as number) - 1) * (limit as number)
              },
              {
                $limit: limit
              },
              ...TweetAdditionalData
            ]
          }
        },
        {
          $unwind: {
            path: '$metadata'
          }
        }
      ])
      .toArray()
    return result.length > 0
      ? result[0]
      : {
          metadata: {
            totalDocs: 0
          },
          data: []
        }
  }

  async getTweetsFromFollowing({
    user_id,
    type,
    limit,
    page
  }: {
    user_id: string
    type: number | undefined
    limit: number | undefined
    page: number | undefined
  }) {
    //retrieve all users whom the current user is following
    const following = await databaseService.followers
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()

    //get all the tweets from followed users
    const followingsIds = following.map((value) => value.followed_user_id)
    const filter: { user_id: any; type?: number } = { user_id: { $in: followingsIds } }
    if (typeof type === 'number') filter.type = type

    const result = await databaseService.tweets
      .aggregate<{ metadata: { totalDocs: number }; data: Tweet[] }>([
        {
          $match: filter
        },
        {
          $facet: {
            metadata: [
              {
                $count: 'totalDocs'
              }
            ],
            data: [
              {
                $skip: ((page as number) - 1) * (limit as number)
              },
              {
                $limit: limit
              },
              ...TweetAdditionalData
            ]
          }
        },
        {
          $unwind: {
            path: '$metadata'
          }
        }
      ])
      .toArray()
    return result.length > 0
      ? result[0]
      : {
          metadata: {
            totalDocs: 0
          },
          data: []
        }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
