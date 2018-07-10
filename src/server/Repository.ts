import * as Database from "./Database"
import * as knex from 'knex'
import { TagEntity, FileEntity } from "./Database";
import { FolderEntity, IPFilterEntity } from "./Database";

export async function GetChildTags (tagID: number, connection: knex): Promise<Database.TagEntity[]> {
  return await connection("Tag").where({ ParentID: tagID })
}

export async function GetChildItems (tagID: number, connection: knex): Promise<Database.FileEntity[]> {
  return await connection("File")
  .distinct("File.*")
  .join("FileTag", "FileTag.FileID", "=", "File.ID")
  .join("Tag", "Tag.ID", "=", "FileTag.TagID")
  .joinRaw("cross join Tag as T2")
  .where("Tag.LBound", ">=", connection.raw("T2.LBound"))
  .andWhere("Tag.UBound", "<=", connection.raw("T2.UBound"))
  .andWhere({ "T2.ID": tagID, Deleted: false, "T2.IncludeChildItems": true })
  .union(function () {
    return this.distinct("File.*")
    .from("File")
    .join("FileTag", "FileTag.FileID", "File.ID")
    .join("Tag", "FileTag.TagID", "Tag.ID")
    .where({ "FileTag.TagID": tagID, Deleted: false, "Tag.IncludeChildItems": false })
  })
}

export async function InsertTag (tag: { Name: string, ParentID: number }, connection: knex): Promise<number> {
  await connection("Tag").insert(tag)
  const id = (await connection("sqlite_sequence").first().where({ name: "Tag" })).seq
  return id
}

export async function InsertFile (file: { FilePath: string }, connection: knex): Promise<number> {
  await connection("File").insert(file)
  const id = (await connection("sqlite_sequence").first().where({ name: "File" })).seq
  return id
}

export async function GetAllTags (connection: knex): Promise<TagEntity[]> {
  return await connection("Tag").select()
}

export async function InsertFileTag (fileID: number, tagID: number, connection: knex) {
  await connection("FileTag").insert({ FileID: fileID, TagID: tagID })
}

export async function GetFileByID (fileID: number, connection: knex): Promise<FileEntity> {
  return await connection("File").first().where({ ID: fileID })
}

export async function GetUntaggedFiles (connection: knex): Promise<FileEntity[]> {
  return await connection("File").where({ Deleted: false }).whereNotExists(function() { this.select("*").from("FileTag").whereRaw("FileID = File.ID") })
}

export async function AddFileToTag (fileid: number, tagid: number, connection: knex) {
  await connection("FileTag").delete().where({ FileID: fileid })
  await connection("FileTag").insert({ FileID: fileid, TagID: tagid })
}

export async function AddTagToTag (tagid: number, tagname: string, connection: knex): Promise<number> {
  const parentTag: TagEntity = await connection("Tag").first().where({ ID: tagid })
  await connection("Tag").update({ UBound: connection.raw('UBound + 1') }).where('UBound', '>=', parentTag.LBound).andWhere('LBound', '<=', parentTag.LBound)
  await connection("Tag").update({ UBound: connection.raw('UBound + 1'), LBound: connection.raw('LBound + 1') }).where('LBound', '>', parentTag.UBound)
  await connection("Tag").insert({ Name: tagname, ParentID: tagid, LBound: parentTag.UBound + 1, UBound: parentTag.UBound + 1 })
  return (await connection("sqlite_sequence").first().where({ name: "Tag" })).seq
}

export async function GetFolderToScan (connection: knex) : Promise<FolderEntity> {
  return await connection("Folder").first().whereNull("ScanStarted").orWhereNotNull("ScanRequested")
}

export async function GetSettings (connection: knex): Promise<{ folders: FolderEntity[], ips: IPFilterEntity[], blacklistMode: boolean }> {
  const folders = await connection("Folder").select("ID", "Path")
  const { ips, blacklistMode } = await GetBlacklistSettings(connection)
  return { folders, ips, blacklistMode }
}

export async function GetBlacklistSettings (connection: knex): Promise<{ ips: IPFilterEntity[], blacklistMode: boolean }> {
  const ips = await connection("IPFilter").select()
  const blacklistMode = (await connection("Settings").first().where({ Key: "BlacklistMode"})).Value === "1"
  return { ips, blacklistMode }
}