import { app } from '~/app'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'
import { PORT } from './utils/getEnv'

initFolder()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexVideoStatus()
  databaseService.indexBookmarks()
  databaseService.indexLikes()
  databaseService.indexTweets()
  databaseService.indexHashtags()
})
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
