import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { deleteFile, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { HOST, PORT } from '~/utils/getEnv'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        await sharp(file.filepath)
          .jpeg({
            // quality: 50
          })
          .toFile(path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`))
        deleteFile(file.filepath)
        return {
          url: isProduction
            ? `http://${HOST}:4000/static/image/${newName}.jpg`
            : `http://localhost:${PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = file.newFilename
        return {
          url: isProduction
            ? `http://${HOST}:4000/static/video/${newName}`
            : `http://localhost:${PORT}/static/video/${newName}`,
          type: MediaType.Video
        }
      })
    )
    // const result = 'OK'
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
