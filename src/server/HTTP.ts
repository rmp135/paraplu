import * as express from 'express'
import * as bodyParser from 'express-xml-bodyparser'
import * as fs from 'fs'
import * as path from 'path'
import * as debug from 'debug'
import * as compression from 'compression'
import * as util from 'util'

import * as MimeMapper from './MimeMapper'

import * as DatabaseProvider from './DatabaseProvider'
import * as Repository from './Repository'
import * as XMLBuilders from './XMLBuilders'
import { TagEntity } from './Database';

const webpackConfig = require('../webpack.config.js')(null, {})
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import SSDP from './SSDP';

const log = debug('paraplu:http')

const compiler = webpack(webpackConfig)

export default class {
  SSDP: SSDP = null
  constructor (ssdp) {
    this.SSDP = ssdp
  }
  Start () {
    const app = express()
    
    app.use(compression())
    app.use(bodyParser())
    app.use(express.json())

    if (process.env.NODE_ENV !== 'production') {
      app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        compress: true,
        noInfo: true,
        path: '/__webpack_hmr'
      }))
      app.use(webpackHotMiddleware(compiler))
    }
    
    app.use(express.static(path.join(__dirname, 'public')))

    // File
    app.get('/file/:itemId', async (req, res) => {
      let fileInfo
      await DatabaseProvider.ProvideUsing(async db => {
        fileInfo = await Repository.GetFileByID(req.params.itemId, db)
      })
      
      const filePath = fileInfo.FilePath
      let stat;
      try {
        stat = await util.promisify(fs.stat)(filePath)
      } catch (error) {
        await DatabaseProvider.ProvideUsing(async db => {
          await db("File").update({ Deleted: true }).where({ ID: req.params.itemId })
        })
        return res.sendStatus(404)
      }
      
      await DatabaseProvider.ProvideUsing(async db => {
        await db("File").update({ LastViewed: Date.now() }).where({ ID: req.params.itemId })
      })

      const fileSize = stat.size
      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = (end-start)+1
        const file = fs.createReadStream(filePath, { start: Math.min(start, end), end })
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": MimeMapper.MapFileToMime(filePath),
        }
        res.writeHead(206, head)
        file.pipe(res)
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type":  MimeMapper.MapFileToMime(filePath)
        }
        res.writeHead(200, head)
        fs.createReadStream(filePath).pipe(res)
      }
    })
    app.post('/api/restartssdp', async (_, res) => {
      this.SSDP.Restart()
      res.sendStatus(200)
    })
    app.post('/api/file/:fileid/addtag', async (req, res) => {
      const fileid = req.params.fileid
      await DatabaseProvider.ProvideUsing(async db => {
        await db("FileTag").insert({ TagID: req.body.ID, FileID: fileid })
      })
      res.sendStatus(200)
    })
    app.get('/api/file/:fileid', (req, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        const tags = await db('File').select("Tag.ID", "T2.Name")
        .join("FileTag", { "FileTag.FileID": "File.ID" })
        .join("Tag", { "Tag.ID": "FileTag.TagID" })
        .joinRaw("cross join Tag as T2")
        .where("Tag.LBound", ">=", db.raw("T2.LBound"))
        .andWhere("Tag.UBound", "<=", db.raw("T2.UBound"))
        .andWhere({ "File.ID": req.params.fileid })
        .whereNotNull("T2.ParentID") as { ID: number, Name: string }[]
        
        const grouped:Map<number, string[]> = new Map()

        for (const tag of tags) {
          if (!grouped.has(tag.ID))
            grouped.set(tag.ID, [])
          grouped.get(tag.ID).push(tag.Name)
        }
        const reduced = []
        grouped.forEach((value, key) => {
          reduced.push({
            id: key,
            name: value.join("/")
          })
        })
        res.json(reduced)
      })
    })

    // Tags
    app.get('/api/tags', (_, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        const tags = await Repository.GetAllTags(db)
        function BuildTree (array) {
          function _BuildTree (root) {
            return ({ ...root, children: tags.filter(tt => tt.ParentID === root.ID).map(tt => _BuildTree(tt)) })
          }
          return array.filter(t => t.ParentID === null).map(t => _BuildTree(t))
        }
        res.json(BuildTree(tags)[0].children)
      })
    })
    app.post('/api/tags/addchild', async (req, res) => {
      await DatabaseProvider.ProvideUsing(async db => {
        const rootTag: TagEntity = await db("Tag").first().whereNull("ParentID")
        const newtagid = await Repository.AddTagToTag(rootTag.ID, req.body.name, db)
        res.json(newtagid)
      })
    })
    app.post('/api/tags/:tagid/addfiles', async (req, res) => {
      const tagid = req.params.tagid
      await DatabaseProvider.ProvideUsing(async db => {
        for (let file of req.body) {
          await Repository.AddFileToTag(file, tagid, db)
        }
      })
      res.sendStatus(200)
    })
    app.post('/api/tags/:tagid/removefiles', async (req, res) => {
      const tagid = req.params.tagid
      await DatabaseProvider.ProvideUsing(async db => {
        for (let file of req.body) {
          await db("FileTag").delete().where({ FileID: file, TagID: tagid })
        }
      })
      res.sendStatus(200)
    })
    app.post('/api/tags/:tagid/delete', async (req, res) => {
      const tagid = req.params.tagid
      await DatabaseProvider.ProvideUsing(async db => {
        const tag = await db("Tag").first().where({ ID: tagid })
        const children = await db("Tag").where({ ParentID: tagid })
        for (const child of children) {
          await db("Tag").update({ ParentID: tag.ParentID }).where({ ID: child.ID })
        }
        await db("Tag").delete().where({ ID: tagid })
      })
      res.sendStatus(200)
    })
    app.post('/api/tags/:tagid/update', async (req, res) => {
      const tagid = req.params.tagid
      await DatabaseProvider.ProvideUsing(async db => {
        await db("Tag").update({ Name: req.body.Name, IncludeChildItems: req.body.IncludeChildItems, OrderBy: req.body.OrderBy, OrderByDesc: req.body.OrderByDesc }).where({ ID: tagid })
      })
      res.sendStatus(200)
    })
    app.post('/api/tags/:tagid/addchild', async (req, res) => {
      const tagid = req.params.tagid
      await DatabaseProvider.ProvideUsing(async db => {
        const newtagid = await Repository.AddTagToTag(tagid, req.body.name, db)
        res.json(newtagid)
      })
    })

    // Tagged
    app.get('/api/tagged/untagged', (_, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        const files = await Repository.GetUntaggedFiles(db)
        res.json(files)
      })
    })
    app.get('/api/tagged/history', (_, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        const files = await Repository.GetHistory(db)
        res.json(files)
      })
    })
    app.get('/api/tagged/:id', (req, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        const files = await Repository.GetChildItems(req.params.id, db)
        res.json(files)
      })
    })

    // Settings
    app.get('/api/settings', (_, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        res.json(await Repository.GetSettings(db))
      })
    })
    app.post('/api/settings', (req, res) => {
      DatabaseProvider.ProvideUsing(async (db) => {
        const folders = req.body.folders
        const ips = req.body.ips
        
        for (const folder of folders.filter(f => !f.Deleted )) {
          if (folder.ID === undefined)
            await db("Folder").insert({ Path: folder.Path })
          else 
            await db("Folder").update({ Path: folder.Path }).where({ ID: folder.ID })
        }
        await db("File").update({ Deleted: true }).whereIn('FolderID', folders.filter(f => f.Deleted).map(f => f.ID))
        await db("Folder").delete().whereIn("ID", folders.filter(f => f.Deleted).map(f => f.ID))

        for (const ip of ips.filter(ip => !ip.Deleted )) {
          if (ip.ID === undefined)
          await db("IPFilter").insert({ Address: ip.Address })
          else 
          await db("IPFilter").update({ Address: ip.Address }).where({ ID: ip.ID })
        }
        await db("IPFilter").delete().whereIn("ID", ips.filter(ip => ip.Deleted).map(ip => ip.ID))
        await db("Settings").update({ Value: req.body.blacklistMode }).where({ Key: 'BlacklistMode' })
        res.json(await Repository.GetSettings(db))
      })
    })
    app.post('/api/requestscan', (req, res) => {
      const folderid = req.body.ID
      DatabaseProvider.ProvideUsing(async (db) => {
        await db("Folder").update({ ScanRequested: new Date() }).where({ ID: folderid })
      })
      res.sendStatus(200)
    })

    // Control
    app.post('/control', async (req, res) => {
      log(JSON.stringify(req.body))
      const id = parseInt(req.body['s:envelope']['s:body'][0]['u:browse'][0]['objectid'][0])
      try {
        await DatabaseProvider.ProvideUsing(async db => {
          let tags = []
          let items = []
          const hostname = req.ip.split(":").pop()
          log(`${hostname} attempting to connect.`)
          const ipsettings = await Repository.GetBlacklistSettings(db)
          let allowed = ipsettings.blacklistMode
          if (ipsettings.blacklistMode) {
            allowed = !ipsettings.ips.some(ip => ip.Address === hostname)
          } else {
            allowed = ipsettings.ips.some(ip => ip.Address === hostname)
          }
          if (allowed) {
            log(`${hostname} is permitted.`)
            if (id === 0) { // Root
              tags = [
                {
                  Name: "Untagged",
                  ID: -1
                },
                ...await db("Tag").select().where("ParentID", "=", db("Tag").select("ID").whereNull("ParentID"))
              ]
            } else if (id === -1) { // Untagged
              items = await Repository.GetUntaggedFiles(db)
            } else {
              tags = await Repository.GetChildTags(id, db)
              items = await Repository.GetChildItems(id, db)
            }
          }
          else {
            log(`${hostname} is not permitted.`)
          }
          const response = XMLBuilders.BuildResponse(
            XMLBuilders.BuildTagsXMLDefinition(tags),
            XMLBuilders.BuildItemsXMLDefinition(items, req.hostname)
          )
          res.setHeader('Content-Type', 'text/xml')
          res.send(response)
        })
      } catch (err) {
        return res.sendStatus(500)
      }
    })
    log('Starting HTTP.')
    app.listen(8080)
    console.log("Running at http://localhost:8080/.")
  }
}
