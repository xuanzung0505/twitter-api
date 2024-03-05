import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import {
  DB_PASSWORD,
  DB_USERNAME,
  DB_NAME,
  DB_USERS_COLLECTION,
  DB_REFRESH_TOKENS_COLLECTION,
  DB_FOLLOWERS_COLLECTION,
  DB_VIDEO_STATUS_COLLECTION
} from '~/utils/getEnv'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@root.8d0hemf.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })

    this.db = this.client.db(DB_NAME)
  }
  /**
   * connect to mongoDB
   */
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
    }
  }

  async indexUsers() {
    const exists = await this.users.indexExists('email_1')
    if (!exists) this.users.createIndex({ email: 1 }, { unique: true })
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists('token_1')
    if (!exists) this.refreshTokens.createIndex({ token: 1 })
  }

  async indexFollowers() {
    const exists = await this.followers.indexExists('user_id_1_followed_user_id_1')
    if (!exists) this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists('name_1')
    if (!exists) this.videoStatus.createIndex({ name: 1 })
  }

  get users(): Collection<User> {
    return this.db.collection(DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(DB_FOLLOWERS_COLLECTION as string)
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(DB_VIDEO_STATUS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
