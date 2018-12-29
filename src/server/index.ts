import * as debug from 'debug'

import HTTP from './HTTP'
import SSDP from './SSDP'
import Scanner from './Scanner'
import Thumbnailer from './Thumbnailer'
import Cleaner from './Cleaner'
import Deleter from './Deleter'
import { Start } from './Scheduler'
import { Handle } from './Handler'
import { Migrate } from './Migrator'

const log = debug('paraplu:main')

;(async () => {
  log('Starting.')
  await Migrate()
  
  const ssdp = new SSDP()
  Handle(ssdp.Start.bind(ssdp))
  Handle(new HTTP(ssdp).Start)
  
  Start(new Cleaner(), 10000)
  Start(new Scanner(), 10000)
  Start(new Deleter(), 10000)
  Start(new Thumbnailer(), 10000)
  
  log('Started.')
})()