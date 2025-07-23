<template>
  <div class="music-player" v-if="currentSong">
    <div class="player-content">
      <!-- 歌曲信息 -->
      <div class="song-info">
        <div class="song-cover">
          <img
            :src="currentSong.coverArt ? getCoverUrl(currentSong.coverArt) : defaultCover"
            :alt="currentSong.title"
          />
        </div>
        <div class="song-details">
          <div class="song-title">{{ currentSong.title }}</div>
          <div class="song-artist">{{ currentSong.artist }}</div>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="player-controls">
        <div class="control-buttons">
          <a-button
            type="text"
            size="large"
            @click="previousSong"
            :disabled="!hasPrevious"
          >
            <StepBackwardOutlined />
          </a-button>

          <a-button
            type="primary"
            shape="circle"
            size="large"
            @click="togglePlay"
          >
            <PlayCircleOutlined v-if="!isPlaying" />
            <PauseCircleOutlined v-else />
          </a-button>

          <a-button
            type="text"
            size="large"
            @click="nextSong"
            :disabled="!hasNext"
          >
            <StepForwardOutlined />
          </a-button>
        </div>

        <!-- 进度条 -->
        <div class="progress-container">
          <span class="time-text">{{ formatTime(currentTime) }}</span>
          <a-slider
            v-model:value="currentTime"
            :max="duration"
            :tip-formatter="formatTime"
            @change="handleSeek"
            class="progress-slider"
          />
          <span class="time-text">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- 音量和其他控制 -->
      <div class="player-extras">
        <a-button type="text" @click="togglePlayMode">
          <RetweetOutlined v-if="playMode === 'loop'" />
          <SwapOutlined v-else-if="playMode === 'random'" />  <!-- 这里替换 -->
          <OrderedListOutlined v-else />
        </a-button>

        <div class="volume-control">
          <a-button type="text">
            <SoundOutlined v-if="volume > 0.5" />
            <SoundOutlined v-else-if="volume > 0" />
            <SoundOutlined v-else />
          </a-button>
          <a-slider
            v-model:value="volume"
            :max="1"
            :step="0.01"
            :tip-formatter="(val) => Math.round(val * 100) + '%'"
            style="width: 100px"
          />
        </div>
      </div>
    </div>

    <!-- 隐藏的音频元素 -->
    <audio
      ref="audioRef"
      :src="audioSrc"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  RetweetOutlined,
  SwapOutlined,  // 替换 ShuffleOutlined
  OrderedListOutlined,
} from '@ant-design/icons-vue'
import { useMusicStore } from '@/stores/music'
import { subsonicClient } from '@/services/subsonic'

const musicStore = useMusicStore()
const audioRef = ref<HTMLAudioElement>()
const defaultCover = '/favicon.ico'

// 计算属性
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const volume = computed({
  get: () => musicStore.volume,
  set: (val) => musicStore.setVolume(val)
})
const playMode = computed(() => musicStore.playMode)
const currentTime = computed({
  get: () => musicStore.currentTime,
  set: (val) => musicStore.updateCurrentTime(val)
})
const duration = computed(() => musicStore.duration)
const hasNext = computed(() => musicStore.hasNext)
const hasPrevious = computed(() => musicStore.hasPrevious)

// 音频源URL
const audioSrc = computed(() => {
  if (currentSong.value) {
    return subsonicClient.getStreamUrl(currentSong.value.id)
  }
  return ''
})

/**
 * 监听播放状态变化
 */
watch(isPlaying, (playing) => {
  if (audioRef.value) {
    if (playing) {
      audioRef.value.play().catch(console.error)
    } else {
      audioRef.value.pause()
    }
  }
})

/**
 * 监听音量变化
 */
watch(volume, (vol) => {
  if (audioRef.value) {
    audioRef.value.volume = vol
  }
})

/**
 * 监听歌曲变化
 */
watch(currentSong, () => {
  if (audioRef.value && currentSong.value) {
    audioRef.value.load()
  }
})

/**
 * 播放/暂停切换
 */
const togglePlay = () => {
  musicStore.togglePlay()
}

/**
 * 上一首
 */
const previousSong = () => {
  musicStore.previousSong()
}

/**
 * 下一首
 */
const nextSong = () => {
  musicStore.nextSong()
}

/**
 * 切换播放模式
 */
const togglePlayMode = () => {
  musicStore.togglePlayMode()
}

/**
 * 处理进度条拖拽
 * @param time - 目标时间
 */
const handleSeek = (time: number) => {
  if (audioRef.value) {
    audioRef.value.currentTime = time
    musicStore.seekTo(time)
  }
}

/**
 * 格式化时间
 * @param seconds - 秒数
 * @returns 格式化的时间字符串
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 获取封面图片URL
 * @param coverArtId - 封面艺术ID
 * @returns 图片URL
 */
const getCoverUrl = (coverArtId: string): string => {
  return subsonicClient.getCoverArtUrl(coverArtId, 64)
}

/**
 * 音频元数据加载完成
 */
const handleLoadedMetadata = () => {
  if (audioRef.value) {
    musicStore.setDuration(audioRef.value.duration)
    audioRef.value.volume = volume.value
  }
}

/**
 * 音频时间更新
 */
const handleTimeUpdate = () => {
  if (audioRef.value) {
    musicStore.updateCurrentTime(audioRef.value.currentTime)
  }
}

/**
 * 音频播放结束
 */
const handleEnded = () => {
  musicStore.nextSong()
}

/**
 * 音频加载错误
 */
const handleError = (error: Event) => {
  console.error('音频加载错误:', error)
}

/**
 * 组件挂载
 */
onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: white;
  border-top: 1px solid #e8e8e8;
  z-index: 1000;
}

.player-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  gap: 24px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  flex: 1;
}

.song-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.song-artist {
  color: #666;
  font-size: 12px;
}

.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.progress-slider {
  flex: 1;
}

.time-text {
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: center;
}

.player-extras {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
