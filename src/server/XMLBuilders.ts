import { TagEntity, FileEntity } from "./Database"
import * as path from 'path'
import * as js2xmlparser from 'js2xmlparser'
import * as MimeMapper from './MimeMapper'

export function BuildTagsXMLDefinition(tags: TagEntity[]): Object[] {
  return tags.map(tag => (
    {
      "@": {
        "restricted": 0,
        "childCount": 0,
        "id": tag.ID,
        "parentID": tag.ParentID
      },
      "dc:title": tag.Name,
      "upnp:class": "object.container"
    }
  ))
}

export function BuildItemsXMLDefinition(items: FileEntity[], ip: string): Object[] {
  return items.map(item => (
    {
      "@": {
        "restricted": "1",
        "id": item.ID,
        "parentID": 0
      },
      "upnp:class": "object.item.videoItem.movie",
      "dc:date": "2017-10-25T20:18:46.0000000Z",
      "dc:title": path.basename(item.FilePath, path.extname(item.FilePath)),
      "res": [
        {
          "@": {
          "protocolInfo": `http-get:*:${MimeMapper.MapFileToMime(item.FilePath)}:DLNA.ORG_PN=${MimeMapper.MapFileToDLNA(item.FilePath)};DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=21700000000000000000000000000000;`
          },
          "#": `http://${ip}:8080/file/${item.ID}`
        },
        {
          "@": {
            "protocolInfo": "http-get:*:image/jpeg:DLNA.ORG_PN=JPG_TN;DLNA.ORG_OP=01;DLNA.ORG_CI=1;DLNA.ORG_FLAGS=20F00000000000000000000000000000",
          },          
          "#": `http://${ip}:8080/thumbs/${item.ID}.jpg`
        }
      ],
      "upnp:albumArtURI": {
        "@": {
          "dlna:profileID": "JPEG_TN",
        },
        "#": `http://${ip}:8080/thumbs/${item.ID}.jpg`
      }
    }
  ))

}

export function BuildResponse (tagXMLDefinition: Object[], itemXMLDefinition: Object[]): string {
  const options = {
    declaration: {
      include: false
    }
  }
  const innerResponse = js2xmlparser.parse("DIDL-Lite", {
    "@": {
      "xmlns:dc": "http://purl.org/dc/elements/1.1/",
      "xmlns:dlna": "urn:schemas-dlna-org:metadata-1-0/",
      "xmlns:upnp": "urn:schemas-upnp-org:metadata-1-0/upnp/",
      "xmlns:sec": "http://www.sec.co.kr/",
      "xmlns": "urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/",
    },
    "container": tagXMLDefinition,
    "item": itemXMLDefinition
  }, options)

  const wrapper = {
    "@": {
      "SOAP-ENV:encodingStyle": "http://schemas.xmlsoap.org/soap/encoding/",
      "xmlns:SOAP-ENV": "http://schemas.xmlsoap.org/soap/envelope/"
    },
    "SOAP-ENV:Body": {
        "u:BrowseResponse": {
            "@": { "xmlns:u": "urn:schemas-upnp-org:service:ContentDirectory:1" },
            "Result": innerResponse,
            "NumberReturned": + tagXMLDefinition.length +  itemXMLDefinition.length,
            "TotalMatches": tagXMLDefinition.length +  itemXMLDefinition.length,
            "UpdateID": 1
        }
    }
  }
  return js2xmlparser.parse("SOAP-ENV:Envelope", wrapper)
}