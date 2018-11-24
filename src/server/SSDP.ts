import * as ssdp from 'node-ssdp'
import * as debug from 'debug'

const log = debug('paraplu:ssdp')

export default class {
  SSDP = null
  constructor () {
    const server = new ssdp.Server({
        location: {
          port: 8080,
          path: '/description.xml'
        }
      })
    
    server.addUSN('upnp:rootdevice')
    server.addUSN('urn:schemas-upnp-org:device:MediaServer:1')
    server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1')
    server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1')
    
    this.SSDP = server
  }
  async Start () {
    // start server on all interfaces
    log('Starting discovery.')
    await this.SSDP.start()
  }
  async Restart () {
    await this.SSDP.stop()
    await this.SSDP.start()
  }
}