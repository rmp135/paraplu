import * as fs from 'fs'
import * as path from 'path'
import * as debug from 'debug'
import { ProvideUsing } from './DatabaseProvider';


const log = debug('paraplu:cleaner')

export default class {
  async Start () {
    log("Starting cleaner.")
    await this.Clean()
    setTimeout(() => {
      this.Start()
    }, 10000);
  }
  
  async Clean () {
    log("Checking files to clean.")
    let deleted = []
    await ProvideUsing(async connection => {
      await connection.transaction(async transaction => {
        deleted = await connection("File").select("ID").where({ Deleted: true }).transacting(transaction)
        if (deleted.length > 0) {
          await connection("FileTag").delete().whereIn("FileID", connection("File").select("File.ID").where({ Deleted: true })).transacting(transaction)
          await connection("File").delete().where({ Deleted: true }).transacting(transaction)
        }
      })
    })
    for (const file of deleted) {
      log(`Attemping to remove thumbnail ${file.ID}.`)
      try {
        fs.unlinkSync(path.join(__dirname, "public", "thumbs", `${file.ID}.jpg`))
        log(`Succesfully removed thumbnail ${file.ID}.`)
      } catch (error) {
        log(`Failed to remove thumbnail ${file.ID}. ${error}`)
      }
    }
  }
}