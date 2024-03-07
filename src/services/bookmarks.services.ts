import { ObjectId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'

class BookmarksService {
  async addToBookmarks(user_id: string, tweet_id: string) {
    const bookmark = new Bookmark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: {
          ...bookmark
        }
      },
      { upsert: true, returnDocument: 'after' }
    )
    return result
  }

  async removeFromBookmarks(id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({ _id: new ObjectId(id) })
    return result
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
