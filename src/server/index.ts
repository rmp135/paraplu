import * as debug from 'debug'

import HTTP from './HTTP'
import SSDP from './SSDP'
import Scanner from './Scanner'
import Thumbnailer from './Thumbnailer'
import Cleaner from './Cleaner'

const log = debug('paraplu:main')

log('Starting.')
new SSDP().Start()
new HTTP().Start()
new Scanner().Start()
new Cleaner().Start()
new Thumbnailer().Start()
log('Started.')
