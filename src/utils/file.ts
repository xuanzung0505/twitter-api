import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

const MAX_IMAGES = 4
const MAX_VIDEOS = 3

/**
 * create /uploads folder
 */
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //allow creating nested dir, false -> error is raised
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: MAX_IMAGES,
    keepExtensions: true,
    maxFileSize: 300 * 1024, //300KB
    maxTotalFileSize: MAX_IMAGES * 300 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('Image is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (files.image) resolve(files.image)
      else return reject(new Error('File is empty'))
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: MAX_VIDEOS,
    keepExtensions: true,
    maxFileSize: 30 * 1024 * 1024, //3MB
    maxTotalFileSize: MAX_VIDEOS * 3 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) {
        form.emit('error' as any, new Error('Video is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (files.video) {
        resolve(files.video)
      } else return reject(new Error('File is empty'))
    })
  })
}

export const getNameFromFullName = (name: string) => {
  return path.parse(name).name
}

export const deleteFile = (filePath: string) => {
  fs.unlinkSync(filePath)
}
