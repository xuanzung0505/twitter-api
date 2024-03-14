import { TweetPaginationWithAdditionalData } from '~/utils/pipelines'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { SearchQueryField } from '~/constants/enums'
import { ObjectId } from 'mongodb'

class SearchService {
  async search({ user_id, q, f, limit, page }: { user_id: string; q: string; f: string; limit: number; page: number }) {
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
      case SearchQueryField.TOP:
        additionalPipelines.push({
          $sort: { score: { $meta: 'textScore' } }
        })
        break
      case SearchQueryField.LATEST:
        additionalPipelines.push({
          $sort: { created_at: -1 }
        })
        break
      case SearchQueryField.MEDIA:
        match.$nor.push({
          medias: { $size: 0 }
        })
        break
      default:
        break
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
