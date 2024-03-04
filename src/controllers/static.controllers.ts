import { NextFunction, Request, RequestHandler, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import fs from 'fs'
import mime from 'mime'

export const serveImageController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoStreamController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires range header')
  }
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 2 ** 10 * 2 ** 10 //1MB -> 2^20 Byte

  const start = Number(range.replace(/\D+/g, ''))
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Range': `bytes`,
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

export const serveM3u8Controller: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveSegmentController: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  //segment: 0.ts, 1.ts,...
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
