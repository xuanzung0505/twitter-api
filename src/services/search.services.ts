import { TweetPaginationWithAdditionalData } from '~/utils/pipelines'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { FilterQuery, PeopleFilterQuery } from '~/constants/enums'
import { ObjectId } from 'mongodb'

class SearchService {
  async search({
    user_id,
    q,
    f,
    pf,
    limit,
    page
  }: {
    user_id: string
    q: string
    f: string
    pf: string | undefined
    limit: number
    page: number
  }) {
    const additionalPipelines = []
    const match: any = {
      $text: {
        $search: q
      },
      $nor: [
        {
          user_id: new ObjectId(user_id)
        }
      ]
    }
    switch (f) {
      case FilterQuery.TOP:
        additionalPipelines.push({
          $sort: { score: { $meta: 'textScore' } }
        })
        break
      case FilterQuery.LATEST:
        additionalPipelines.push({
          $sort: { created_at: -1 }
        })
        break
      case FilterQuery.MEDIA:
        match.$nor.push({
          medias: { $size: 0 }
        })
        break
      default:
        break
    }
    if (pf === PeopleFilterQuery.ON) {
      //retrieve all users whom the current user is following
      const following = await databaseService.followers
        .find({
          user_id: new ObjectId(user_id)
        })
        .toArray()
      const followingsIds = following.map((value) => value.followed_user_id)
      match.user_id = { $in: followingsIds }
    }
    const result = await databaseService.tweets
      .aggregate<{ metadata: { totalDocs: number }; data: Tweet[] }>([
        {
          $match: match
        },
        ...TweetPaginationWithAdditionalData(limit, page, additionalPipelines)
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

const searchService = new SearchService()
export default searchService
