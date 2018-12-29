import * as ffmpeg from 'fluent-ffmpeg'
import * as path from 'path'
import * as debug from 'debug'
import * as DatabaseProvider from './DatabaseProvider'
import { FileEntity } from './Database';
import { IntervalWorker } from './IntervalWorker';

const log = debug('paraplu:thumbnailer')

export default class implements IntervalWorker {
  Name = 'paraplu:thumbnailer'
  async Run () {
    log("Checking for thumbnails to generate.")
    await DatabaseProvider.ProvideUsing(async db => {
      const toGenerate = await db("File").where({ HasThumb: 0 })
      if (toGenerate.length === 0) return
      log(`Generating ${toGenerate.length} thumbs.`)
      for (let file of toGenerate) {
        try {
          await this.GenerateForFile(file)
          log(`Completed file: ${file.FilePath}.`)
        } catch (error) {
          log(`Failed on file: ${file.FilePath}.`)
        }
        await db("File").update({ HasThumb: 1 }).where({ ID: file.ID })
      }
    })
  }

  GenerateForFile (file: FileEntity): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(file.FilePath)
      .screenshots({
        timestamps: ['50%'],
        filename: `${file.ID}.jpg`,
        folder: path.join(__dirname, 'public', 'thumbs'),
        size: '320x?'
      }).autopad()
      .on('start', () => {
        log(`Starting file: ${file.FilePath}.`)
      })
      .on('error', (err) => {
        reject(err)
      })
      .on('end', () => {
        resolve()
      })
    })
  }
}
