import axios, { type AxiosInstance } from 'axios'
import CryptoJS from 'crypto-js'
import type { AuthInfo, Album, Song, Artist, Playlist, SubsonicResponse } from '@/types'

/**
 * Subsonic API 客户端类
 */
export class SubsonicClient {
  private api: AxiosInstance
  private authInfo: AuthInfo | null = null

  constructor() {
    this.api = axios.create({
      timeout: 10000,
    })
  }

  /**
   * 生成认证参数
   * @param password - 用户密码
   * @returns 认证信息
   */
  private generateAuth(username: string, password: string, serverUrl: string): AuthInfo {
    const salt = Math.random().toString(36).substring(2, 15)
    const token = CryptoJS.MD5(password + salt).toString()
    
    return {
      username,
      token,
      salt,
      serverUrl: serverUrl.replace(/\/$/, ''), // 移除末尾斜杠
    }
  }

  /**
   * 构建API请求URL
   * @param endpoint - API端点
   * @param params - 额外参数
   * @returns 完整的请求URL
   */
  private buildUrl(endpoint: string, params: Record<string, string | number> = {}): string {
    if (!this.authInfo) {
      throw new Error('未认证，请先登录')
    }

    const baseParams = {
      u: this.authInfo.username,
      t: this.authInfo.token,
      s: this.authInfo.salt,
      v: '1.16.1',
      c: 'MelodyFlow',
      f: 'json',
      ...params,
    }

    const queryString = Object.entries(baseParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')

    return `${this.authInfo.serverUrl}/rest/${endpoint}?${queryString}`
  }

  /**
   * 用户登录认证
   * @param username - 用户名
   * @param password - 密码
   * @param serverUrl - 服务器地址
   * @returns 认证结果
   */
  async login(username: string, password: string, serverUrl: string): Promise<boolean> {
    try {
      this.authInfo = this.generateAuth(username, password, serverUrl)
      
      const url = this.buildUrl('ping.view')
      const response = await this.api.get<SubsonicResponse>(url)
      
      if (response.data['subsonic-response'].status === 'ok') {
        // 保存认证信息到本地存储
        localStorage.setItem('subsonic_auth', JSON.stringify(this.authInfo))
        return true
      } else {
        this.authInfo = null
        return false
      }
    } catch (error) {
      this.authInfo = null
      console.error('登录失败:', error)
      return false
    }
  }

  /**
   * 从本地存储恢复认证信息
   * @returns 是否成功恢复
   */
  restoreAuth(): boolean {
    try {
      const stored = localStorage.getItem('subsonic_auth')
      if (stored) {
        this.authInfo = JSON.parse(stored)
        return true
      }
    } catch (error) {
      console.error('恢复认证信息失败:', error)
    }
    return false
  }

  /**
   * 用户登出
   */
  logout(): void {
    this.authInfo = null
    localStorage.removeItem('subsonic_auth')
  }

  /**
   * 检查是否已认证
   * @returns 认证状态
   */
  isAuthenticated(): boolean {
    return this.authInfo !== null
  }

  /**
   * 获取专辑列表
   * @param type - 专辑类型
   * @param size - 返回数量
   * @param offset - 偏移量
   * @returns 专辑列表
   */
  async getAlbumList(type: 'newest' | 'recent' | 'frequent' | 'random' = 'newest', size = 20, offset = 0): Promise<Album[]> {
    try {
      const url = this.buildUrl('getAlbumList2.view', { type, size, offset })
      const response = await this.api.get(url)
      
      const albumList = response.data['subsonic-response'].albumList2?.album || []
      return albumList
    } catch (error) {
      console.error('获取专辑列表失败:', error)
      return []
    }
  }

  /**
   * 获取专辑详情
   * @param albumId - 专辑ID
   * @returns 专辑详情和歌曲列表
   */
  async getAlbum(albumId: string): Promise<{ album: Album; songs: Song[] }> {
    try {
      const url = this.buildUrl('getAlbum.view', { id: albumId })
      const response = await this.api.get(url)
      
      const albumData = response.data['subsonic-response'].album
      return {
        album: albumData,
        songs: albumData.song || [],
      }
    } catch (error) {
      console.error('获取专辑详情失败:', error)
      throw error
    }
  }

  /**
   * 搜索音乐
   * @param query - 搜索关键词
   * @returns 搜索结果
   */
  async search(query: string): Promise<{ artists: Artist[]; albums: Album[]; songs: Song[] }> {
    try {
      const url = this.buildUrl('search3.view', { query, artistCount: 10, albumCount: 20, songCount: 50 })
      const response = await this.api.get(url)
      
      const searchResult = response.data['subsonic-response'].searchResult3 || {}
      return {
        artists: searchResult.artist || [],
        albums: searchResult.album || [],
        songs: searchResult.song || [],
      }
    } catch (error) {
      console.error('搜索失败:', error)
      return { artists: [], albums: [], songs: [] }
    }
  }

  /**
   * 获取封面图片URL
   * @param coverArtId - 封面艺术ID
   * @param size - 图片尺寸
   * @returns 图片URL
   */
  getCoverArtUrl(coverArtId: string, size = 300): string {
    if (!this.authInfo || !coverArtId) {
      return ''
    }
    return this.buildUrl('getCoverArt.view', { id: coverArtId, size })
  }

  /**
   * 获取音频流URL
   * @param songId - 歌曲ID
   * @returns 音频流URL
   */
  getStreamUrl(songId: string): string {
    if (!this.authInfo) {
      throw new Error('未认证，请先登录')
    }
    return this.buildUrl('stream.view', { id: songId })
  }

  /**
   * 获取用户信息
   * @returns 用户信息
   */
  getUserInfo(): AuthInfo | null {
    return this.authInfo
  }
}

// 导出单例实例
export const subsonicClient = new SubsonicClient()