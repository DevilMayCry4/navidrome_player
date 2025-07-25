import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Song } from '@/types'
import { subsonicClient } from '@/services/subsonic'

/**
 * 音乐播放器状态管理
 */
export const useMusicStore = defineStore('music', () => {
  // 当前播放的歌曲
  const currentSong = ref<Song | null>(null)
  // 播放列表
  const playlist = ref<Song[]>([])
  // 当前播放索引
  const currentIndex = ref(-1)
  // 播放状态
  const isPlaying = ref(false)
  // 音量
  const volume = ref(0.8)
  // 播放模式: 'sequence' | 'loop' | 'random'
  const playMode = ref<'sequence' | 'loop' | 'random'>('sequence')
  // 当前播放时间
  const currentTime = ref(0)
  // 歌曲总时长
  const duration = ref(0)
  // 所有歌曲列表
  const allSongs = ref<Song[]>([])
  // 当前页码
  const currentPage = ref(1)
  // 每页数量
  const pageSize = ref(10)
  // 是否还有更多歌曲
  const hasMoreSongs = ref(true)
  // 加载状态
  const isLoadingSongs = ref(false)

  // 计算属性
  const hasNext = computed(() => {
    if (playMode.value === 'loop') return true
    return currentIndex.value < playlist.value.length - 1
  })

  const hasPrevious = computed(() => {
    if (playMode.value === 'loop') return true
    return currentIndex.value > 0
  })

  /**
   * 播放指定歌曲
   * @param song - 要播放的歌曲
   * @param songList - 播放列表（可选）
   */
  const playSong = (song: Song, songList?: Song[]) => {
    if (songList) {
      playlist.value = songList
      currentIndex.value = songList.findIndex(s => s.id === song.id)
    } else {
      // 如果没有提供播放列表，添加到当前播放列表
      const existingIndex = playlist.value.findIndex(s => s.id === song.id)
      if (existingIndex >= 0) {
        currentIndex.value = existingIndex
      } else {
        playlist.value.push(song)
        currentIndex.value = playlist.value.length - 1
      }
    }
    
    currentSong.value = song
    isPlaying.value = true
  }

  /**
   * 播放/暂停切换
   */
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  /**
   * 下一首
   */
  const nextSong = () => {
    if (playlist.value.length === 0) return

    let nextIndex: number
    
    if (playMode.value === 'random') {
      nextIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === 'loop' && currentIndex.value === playlist.value.length - 1) {
      nextIndex = 0
    } else {
      nextIndex = currentIndex.value + 1
    }

    if (nextIndex < playlist.value.length) {
      currentIndex.value = nextIndex
      currentSong.value = playlist.value[nextIndex]
      isPlaying.value = true
    }
  }

  /**
   * 上一首
   */
  const previousSong = () => {
    if (playlist.value.length === 0) return

    let prevIndex: number
    
    if (playMode.value === 'random') {
      prevIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === 'loop' && currentIndex.value === 0) {
      prevIndex = playlist.value.length - 1
    } else {
      prevIndex = currentIndex.value - 1
    }

    if (prevIndex >= 0) {
      currentIndex.value = prevIndex
      currentSong.value = playlist.value[prevIndex]
      isPlaying.value = true
    }
  }

  /**
   * 设置音量
   * @param vol - 音量值 (0-1)
   */
  const setVolume = (vol: number) => {
    volume.value = Math.max(0, Math.min(1, vol))
  }

  /**
   * 切换播放模式
   */
  const togglePlayMode = () => {
    const modes: Array<'sequence' | 'loop' | 'random'> = ['sequence', 'loop', 'random']
    const currentModeIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentModeIndex + 1) % modes.length]
  }

  /**
   * 更新播放进度
   * @param time - 当前播放时间
   */
  const updateCurrentTime = (time: number) => {
    currentTime.value = time
  }

  /**
   * 设置歌曲总时长
   * @param dur - 总时长
   */
  const setDuration = (dur: number) => {
    duration.value = dur
  }

  /**
   * 跳转到指定时间
   * @param time - 目标时间
   */
  const seekTo = (time: number) => {
    currentTime.value = time
  }

  /**
   * 获取歌曲列表（分页）
   * @param page - 页码，默认为当前页
   * @param reset - 是否重置列表
   */
  const fetchSongs = async (page?: number, reset = false) => {
    if (isLoadingSongs.value) return
    
    const targetPage = page || currentPage.value
    isLoadingSongs.value = true
    
    try {
      const result = await subsonicClient.getSongs(targetPage, pageSize.value)
      
      if (reset || targetPage === 1) {
        allSongs.value = result.songs
      } else {
        allSongs.value.push(...result.songs)
      }
      
      currentPage.value = targetPage
      hasMoreSongs.value = result.hasMore
    } catch (error) {
      console.error('获取歌曲列表失败:', error)
    } finally {
      isLoadingSongs.value = false
    }
  }

  /**
   * 加载下一页歌曲
   */
  const loadMoreSongs = async () => {
    if (hasMoreSongs.value && !isLoadingSongs.value) {
      await fetchSongs(currentPage.value + 1)
    }
  }

  /**
   * 刷新歌曲列表
   */
  const refreshSongs = async () => {
    currentPage.value = 1
    hasMoreSongs.value = true
    await fetchSongs(1, true)
  }

  return {
    // 状态
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    currentTime,
    duration,
    allSongs,
    currentPage,
    pageSize,
    hasMoreSongs,
    isLoadingSongs,
    
    // 计算属性
    hasNext,
    hasPrevious,
    
    // 方法
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    setVolume,
    togglePlayMode,
    updateCurrentTime,
    setDuration,
    seekTo,
    fetchSongs,
    loadMoreSongs,
    refreshSongs,
  }
})