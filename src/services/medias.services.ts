import { config } from 'dotenv'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { UPLOAD_DIR } from '~/constants/dir'
import { deleteFile, getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import { HOST, PORT } from '~/utils/getEnv'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    // console.log(file)
    const newName = getNameFromFullName(file.newFilename)
    const info = await sharp(file.filepath)
      .jpeg({
        // quality: 50
      })
      .toFile(path.resolve(UPLOAD_DIR, `${newName}.jpg`))
    deleteFile(file.filepath)
    return isProduction ? `http://${HOST}:4000/medias/${newName}.jpg` : `http://localhost:${PORT}/medias/${newName}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
