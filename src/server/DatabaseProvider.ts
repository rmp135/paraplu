import * as knex from 'knex'
import * as path from 'path'

export function Provide () {
  return knex({
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, 'db.sqlite3'),
    },
    debug: false,
    useNullAsDefault: true
  })
}

export async function ProvideUsing (fn: (db: knex) => any) {
  let db: knex = null
  try {
    db = Provide()
    await fn(db)
  } finally {
    if (db !== null)
      db.destroy()
  }
}