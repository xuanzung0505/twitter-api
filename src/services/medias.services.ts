import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { EncodeStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { deleteFile, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { HOST, PORT } from '~/utils/getEnv'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

class EncodeQueue {
  private items: string[]
  private encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  public async enqueue(item: string) {
    this.items.push(item)
    const idName = getNameFromFullName(item.split('/').pop() as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodeStatus.Pending
      })
    )
    this.encode()
  }

  public dequeue() {
    this.items.shift()
  }

  public async encode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullName(videoPath.split('/').pop() as string)
      try {
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodeStatus.Processing
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
      } catch (error) {
        console.error(`Update video status ${idName} failed`, error)
      }
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.dequeue()
        //delete the original video
        await fsPromise.unlink(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodeStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${idName} successfully`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodeStatus.Failed,
                message: error as string
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error(`Update video status ${idName} failed`, err)
          })
        console.error(`Encode video ${idName} failed`)
        console.error(error)
      }
      this.encoding = false
      this.encode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

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
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        encodeQueue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `http://${HOST}:4000/static/video-hls/${newName}`
            : `http://localhost:${PORT}/static/video-hls/${newName}`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const result = await databaseService.videoStatus.findOne({
      name: id
    })
    return result
  }
}

const mediasService = new MediasService()
const encodeQueue = new EncodeQueue()
export default mediasService
