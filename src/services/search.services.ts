import { TweetPaginationWithAdditionalData } from '~/utils/pipelines'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'

class SearchService {
  async search({ q, limit, page }: { q: string; limit: number; page: number }) {
    const result = await databaseService.tweets
      .aggregate<{ metadata: { totalDocs: number }; data: Tweet[] }>([
        {
          $match: {
            $text: {
              $search: q
            }
          }
        },
        ...TweetPaginationWithAdditionalData(limit, page)
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
