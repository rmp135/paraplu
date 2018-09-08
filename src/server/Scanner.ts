import * as glob from 'glob'
import * as path from 'path'
import * as util from 'util'
import * as debug from 'debug'
import * as knex from 'knex'
import { ProvideUsing } from './DatabaseProvider';
import { GetFolderToScan } from './Repository';
import { FolderEntity } from './Database';

import * as MimeMapper from './MimeMapper'

const log = debug('paraplu:scanner')

export default class {
  async Start () {
    log("Starting scanner.")
    await this.Scan()
    setTimeout(() => {
      this.Start()
    }, 10000);
  }
  
  async Scan () {
    log("Checking folders to scan.")
    await ProvideUsing(async db => {
      const folder = await GetFolderToScan(db)
      if (folder !== undefined) {
        await db("Folder").update({ ScanStarted: Date.now() }).where({ ID: folder.ID })
        const files = await this.ScanForFiles(folder)
        await this.ImportFiles(files, folder, db)
        await db("Folder").update({ ScanFinished: Date.now(), ScanRequested: null }).where({ ID: folder.ID })
      }
    })
  }

  async ScanForFiles (folder: FolderEntity): Promise<string[]> {
    log(`Starting scan of "${folder.Path}".`)
    
    const files = await util.promisify(glob)(path.join(folder.Path, '**', `**.*(${MimeMapper.AllExtensions().join('|')})`), { nodir: true })
    log(`Completed scan of "${folder.Path}".`)
    return files
  }

  async ImportFiles (files: string[], folder: FolderEntity, connection: knex) {
    await connection.transaction(async transaction => {
      await Promise.all(files.map(async file => {
        log(`Found file: ${file}`)
        await connection("FileTemp").insert({ FilePath: file, Name: path.basename(file, path.extname(file)) }).transacting(transaction)
      }))
      await connection("File").update({ Deleted: true }).whereNotIn("FilePath", connection("FileTemp").select("FilePath")).where({ FolderID: folder.ID }).transacting(transaction)
      await connection(connection.raw('?? (??, ??, ??, ??)', ['File', 'FilePath', 'FolderID', 'FoundAt', 'Name'])).insert(connection("FileTemp").select("FilePath", connection.raw(folder.ID), connection.raw(Date.now()), 'Name').whereNotIn("FilePath", connection("File").select("FilePath"))).transacting(transaction)
      await connection("FileTemp").delete().transacting(transaction)
    })
  }
}