import app from '~/app'
import databaseService from './services/database.services'
import { config } from 'dotenv'

config()
const PORT = process.env.PORT

databaseService.connect()
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
