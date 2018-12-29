import * as fs from 'fs'
import * as path from 'path'
import * as debug from 'debug'
import { ProvideUsing } from './DatabaseProvider';
import { IntervalWorker } from './IntervalWorker';


const log = debug('paraplu:deleter')

export default class implements IntervalWorker {
  Name = 'paraplu:deleter'
  async Run () {
    log("Checking files to delete.")
    let pendingDeletion = []
    await ProvideUsing(async connection => {
      pendingDeletion = await connection("File").select("ID", "FilePath").where({ PendingDeletion: true })
    })
    for (const file of pendingDeletion) {
      log(`Attemping to remove file ${file.ID}.`)
      try {
        fs.unlinkSync(file.FilePath)
        await ProvideUsing(async connection => {
          await connection("File").update({ Deleted: true, PendingDeletion: false }).where({ ID: file.ID })
        })
        log(`Succesfully removed file ${file.ID}.`)
      } catch (error) {
        log(`Failed to remove file ${file.ID}. ${error}`)
      }
    }
  }
}