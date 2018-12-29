import * as knex from 'knex';
import * as debug from 'debug'
import { ProvideUsing } from './DatabaseProvider';

const log = debug("paraplu:migrator");

const migrations = [
  async (db: knex) => {
    await db.schema.createTable("File", table => {
      table.increments("ID");
      table.string("FilePath").notNullable();
      table.integer("HasThumb").notNullable().defaultTo(0);
      table.integer("FolderID");
      table.integer("Deleted").notNullable().defaultTo(0);
      table.string("FoundAt");
      table.string("Name");
      table.integer("LastViewed");
      table.integer("PendingDeletion").defaultTo(0);
    });
    await db.schema.createTable("Tag", table => {
      table.increments("ID");
      table.string("Name").notNullable();
      table.integer("ParentID");
      table.integer("LBound").notNullable();
      table.integer("UBound").notNullable();
      table.integer("IncludeChildItems").notNullable().defaultTo(1);
      table.string("OrderBy").notNullable().defaultTo("Name");
      table.integer("OrderByDesc").notNullable().defaultTo(0);
    });
    await db.schema.createTable("FileTag", table => {
      table.integer("FileID");
      table.integer("TagID");
    });
    await db.schema.createTable("FileTemp", table => {
      table.increments("ID");
      table.string("FilePath").notNullable();
      table.string("Name");
    });
    await db.schema.createTable("Folder", table => {
      table.increments("ID");
      table.string("Path");
      table.integer("ScanStarted");
      table.integer("ScanFinished");
      table.integer("ScanRequested");
    });
    await db.schema.createTable("IPFilter", table => {
      table.increments("ID");
      table.string("Address");
    });
    await db.schema.createTable("Log", table => {
      table.increments("ID");
      table.integer("LogTime").notNullable();
      table.text("Message").notNullable();
      table.string("Worker").notNullable();
    });
    await db.schema.createTable("Settings", table => {
      table.increments("ID");
      table.string("Key").notNullable();
      table.string("Value");
    });
  },
  async (db: knex) => {
    await db("Settings").insert({ Key: "BlacklistMode", Value: 0 });
    await db("Settings").insert({ Key: "Version", Value: 1 });
    await db("Tag").insert({ Name: "Root", LBound: 1, UBound: 1, IncludeChildItems: 1 })
  }
]

export async function Migrate () {
  log("Migrating...");
  await ProvideUsing(async db => {
    const version = (await db("Settings").where({ Key: "Version" }).first("Value")).Version;
    for (let i = 0; i < migrations.length; i++) {
      if (version === null || version < i) {
        const migration = migrations[i];
        await migration(db);
      }
    }
    await db("Settings").update( { "Value": migrations.length }).where({ Key: "Version" });
  })
  log("Completed migration.");
}