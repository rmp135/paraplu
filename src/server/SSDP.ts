import * as ssdp from 'node-ssdp'
import * as debug from 'debug'

const log = debug('paraplu:ssdp')

export default class {
  Start () {
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
    
    // start server on all interfaces
    log('Starting discovery.')
    server.start()
    return server
  }
}