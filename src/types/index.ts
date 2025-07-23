/**
 * Subsonic API 响应基础接口
 */
export interface SubsonicResponse {
  'subsonic-response': {
    status: 'ok' | 'failed'
    version: string
    error?: {
      code: number
      message: string
    }
  }
}

/**
 * 用户认证信息
 */
export interface AuthInfo {
  username: string
  token: string
  salt: string
  serverUrl: string
}

/**
 * 专辑信息
 */
export interface Album {
  id: string
  name: string
  artist: string
  artistId: string
  coverArt?: string
  songCount: number
  duration: number
  created: string
  year?: number
  genre?: string
}

/**
 * 歌曲信息
 */
export interface Song {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  coverArt?: string
  duration: number
  bitRate?: number
  track?: number
  year?: number
  genre?: string
  size: number
  suffix: string
  contentType: string
  path: string
}

/**
 * 艺术家信息
 */
export interface Artist {
  id: string
  name: string
  albumCount: number
  starred?: string
}

/**
 * 播放列表信息
 */
export interface Playlist {
  id: string
  name: string
  comment?: string
  owner: string
  public: boolean
  songCount: number
  duration: number
  created: string
  changed: string
  coverArt?: string
}