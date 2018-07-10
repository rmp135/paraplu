import * as path from 'path'

const map = [
  {
    ext: ["avc", "mp4", "m4v", "mov"],
    mimeType: 'video/mp4',
    dlnaProfiles: [
      "AVC_MP4_MP_SD_AAC_MULT5",
      "AVC_MP4_HP_HD_AAC",
      "AVC_MP4_HP_HD_DTS",
      "AVC_MP4_LPCM",
      "AVC_MP4_MP_SD_AC3",
      "AVC_MP4_MP_SD_DTS",
      "AVC_MP4_MP_SD_MPEG1_L3",
      "AVC_TS_HD_50_LPCM_T",
      "AVC_TS_HD_DTS_ISO",
      "AVC_TS_HD_DTS_T",
      "AVC_TS_HP_HD_MPEG1_L2_ISO",
      "AVC_TS_HP_HD_MPEG1_L2_T",
      "AVC_TS_HP_SD_MPEG1_L2_ISO",
      "AVC_TS_HP_SD_MPEG1_L2_T",
      "AVC_TS_MP_HD_AAC_MULT5",
      "AVC_TS_MP_HD_AAC_MULT5_ISO",
      "AVC_TS_MP_HD_AAC_MULT5_T",
      "AVC_TS_MP_HD_AC3",
      "AVC_TS_MP_HD_AC3_ISO",
      "AVC_TS_MP_HD_AC3_T",
      "AVC_TS_MP_HD_MPEG1_L3",
      "AVC_TS_MP_HD_MPEG1_L3_ISO",
      "AVC_TS_MP_HD_MPEG1_L3_T",
      "AVC_TS_MP_SD_AAC_MULT5",
      "AVC_TS_MP_SD_AAC_MULT5_ISO",
      "AVC_TS_MP_SD_AAC_MULT5_T",
      "AVC_TS_MP_SD_AC3",
      "AVC_TS_MP_SD_AC3_ISO",
      "AVC_TS_MP_SD_AC3_T",
      "AVC_TS_MP_SD_MPEG1_L3",
      "AVC_TS_MP_SD_MPEG1_L3_ISO",
      "AVC_TS_MP_SD_MPEG1_L3_T"
    ]
  },
  {
    ext: ["mkv", "matroska", "mk3d", "webm"],
    mimeType: 'video/x-matroska',
    dlnaProfiles: [
      "MATROSKA"
    ]
  },
]

export function MapFileToMime (filename: string): string {
  const ext = path.extname(filename).slice(1)
  return map.find(m => m.ext.includes(ext)).mimeType
}

export function MapFileToDLNA (filename: string): string {
  const ext = path.extname(filename).slice(1)
  return map.find(m => m.ext.includes(ext)).dlnaProfiles[0]
}

export function AllExtensions (): string[] {
  return map.map(m => m.ext).reduce((e1, e2) => e1.concat(e2))
}