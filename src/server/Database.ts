/*
* This file was generated by a tool.
* To regenerate, run the command sql-ts -c sqlts-config.json
*/

export interface FileTagEntity {
  FileID: number
  TagID: number
}

export interface FolderEntity {
  ID?: number
  Path: string
  ScanStarted: string
  ScanFinished: string
  ScanRequested: string
}

export interface IPFilterEntity {
  ID?: number
  Address: string
}

export interface SettingsEntity {
  ID?: number
  Key: string
  Value: string
}

export interface FileEntity {
  ID?: number
  FilePath: string
  HasThumb: Boolean
  FolderID: number
  Deleted: number
}

export interface FileTempEntity {
  ID?: number
  FilePath: string
}

export interface TagEntity {
  ID?: number
  Name: string
  ParentID: number
  LBound: number
  UBound: number
  IncludeChildItems: number
  OrderBy: string
  OrderByDesc: number
}
