# paraplu

A super simple media server for playback on web and DLNA devices.

## Building

Clone this repo.

Run the following for the dependencies. You'll need [yarn](https://yarnpkg.com/) for this.

`yarn`

Run the following to build the server and client. 

`yarn build` 

And the following to run the server in production mode.

`yarn start`

## External Dependencies

[ffmpeg](https://www.ffmpeg.org/) is required for thumbnail generation.

Online connectivity for Google Fonts. It can be used without but will look off.

## Usage

### Tags

Tags are designed to be hierarchical. The parent tag will contain all items that are contained within the children. This behaviour can be disabled in the tag settings.

Dragging a tag onto a file will add the tag to that file. Dragging a file onto a tag will _move_ the file into the tag, effectively removing all other tags from that file.

### Files

The only files that this supports are those that can played natively in the browser (.mp4 and .mkv containers). This limitation is by design.

Use the settings cog at the top right to add folders to scan or rescan existing folders. The path must be absolute. Folders will _not_ be rescanned unless manually requested. 

Folder scanning, thumbnail generation and thumbnail cleaning will occur every 10 seconds. 

### Settings

You can whitelist / blacklist IP addresses from the DLNA service in the settings. This does not hide the server, merely the ability to browse the contents.

## DLNA

A very basic DLNA service has been built in. This has only been tested on VLC and Oculus Go. As such, I can't guarantee this will work with all DLNA devices.

This will appear as "paraplu media server".

## Logging

For additional logging, set environment variable `DEBUG` to `paraplu:*`. Alternatively run `yarn debug` after building.
