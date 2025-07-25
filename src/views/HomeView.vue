<template>
  <div class="home-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>MelodyFlow</h2>
        <p>清新音乐，轻松生活</p>
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        theme="light"
        class="sidebar-menu"
      >
        <a-menu-item key="discover">
          <template #icon>
            <HomeOutlined />
          </template>
          发现音乐
        </a-menu-item>

        <a-menu-item key="music">
          <template #icon>
            <CustomerServiceOutlined />
          </template>
          音乐馆
        </a-menu-item>

        <a-menu-item key="ranking">
          <template #icon>
            <TrophyOutlined />
          </template>
          排行榜
        </a-menu-item>

        <a-menu-item key="favorite">
          <template #icon>
            <HeartOutlined />
          </template>
          精品歌单
        </a-menu-item>

        <a-menu-item key="artist">
          <template #icon>
            <UserOutlined />
          </template>
          歌手
        </a-menu-item>
      </a-menu>

      <div class="sidebar-section">
        <h4>我的音乐</h4>
        <a-menu mode="inline" theme="light">
          <a-menu-item key="local">
            <template #icon>
              <FolderOutlined />
            </template>
            本地音乐
          </a-menu-item>

          <a-menu-item key="download">
            <template #icon>
              <DownloadOutlined />
            </template>
            下载管理
          </a-menu-item>

          <a-menu-item key="cloud">
            <template #icon>
              <CloudOutlined />
            </template>
            我的音乐云盘
          </a-menu-item>

          <a-menu-item key="history">
            <template #icon>
              <HistoryOutlined />
            </template>
            播放历史
          </a-menu-item>
        </a-menu>
      </div>

      <div class="sidebar-section">
        <h4>我的歌单</h4>
        <a-menu mode="inline" theme="light">
          <a-menu-item key="liked">
            <template #icon>
              <StarOutlined />
            </template>
            最爱的旋律
          </a-menu-item>

          <a-menu-item key="fresh">
            <template #icon>
              <ThunderboltOutlined />
            </template>
            夏日清新歌单
          </a-menu-item>

          <a-menu-item key="seaside">
            <template #icon>
              <EnvironmentOutlined />
            </template>
            沿海公路
          </a-menu-item>

          <a-menu-item key="coffee">
            <template #icon>
              <CoffeeOutlined />
            </template>
            咖啡与雨声
          </a-menu-item>

          <a-menu-item key="work">
            <template #icon>
              <LaptopOutlined />
            </template>
            放松工作
          </a-menu-item>
        </a-menu>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部搜索栏 -->
      <div class="header">
        <div class="search-container">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="搜索音乐、歌手、专辑"
            size="large"
            style="width: 400px"
            @search="handleSearch"
          />
        </div>

        <div class="user-info">
          <a-dropdown>
            <a-button type="text" size="large">
              <UserOutlined />
              {{ username }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <!-- 音乐库标题区 -->
      <div class="music-library-section">
        <div class="library-header">
          <h1 class="library-title">我的音乐库</h1>
          <p class="library-subtitle">发现和播放你喜爱的音乐</p>
          <div class="library-actions">
            <a-button type="primary" size="large" @click="playAllSongs" :disabled="allSongs.length === 0">
              <PlayCircleOutlined />
              播放全部
            </a-button>
            <a-button size="large" @click="refreshSongs" :loading="isLoadingSongs">
              <ReloadOutlined />
              刷新
            </a-button>
          </div>
        </div>
      </div>

      <!-- 歌曲列表 -->
      <div class="song-list-section">
        <div class="section-header">
          <h3>歌曲列表 ({{ allSongs.length }} 首)</h3>
          <div class="section-actions">
            <a-button type="text">
              <UnorderedListOutlined />
              排序
            </a-button>
          </div>
        </div>

        <div class="song-list">
          <div class="song-list-header">
            <div class="song-number">#</div>
            <div class="song-title">歌曲</div>
            <div class="song-artist">歌手</div>
            <div class="song-album">专辑</div>
            <div class="song-duration">时长</div>
            <div class="song-actions"></div>
          </div>

          <div
            v-for="(song, index) in allSongs"
            :key="song.id"
            class="song-item"
            :class="{ active: currentSong?.id === song.id }"
            @click="playSong(song)"
          >
            <div class="song-number">
              <span v-if="currentSong?.id !== song.id">{{ index + 1 }}</span>
              <SoundOutlined v-else class="playing-icon" />
            </div>
            <div class="song-title">
              <div class="song-info">
                <span class="song-name">{{ song.title }}</span>
                <span v-if="song.genre" class="song-genre">{{ song.genre }}</span>
              </div>
            </div>
            <div class="song-artist">{{ song.artist }}</div>
            <div class="song-album">{{ song.album }}</div>
            <div class="song-duration">{{ formatDuration(song.duration) }}</div>
            <div class="song-actions">
              <a-button type="text" size="small">
                <HeartOutlined />
              </a-button>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div class="load-more-section" v-if="hasMoreSongs || isLoadingSongs">
          <a-button 
            type="primary" 
            size="large" 
            :loading="isLoadingSongs"
            @click="loadMoreSongs"
            :disabled="!hasMoreSongs"
          >
            <template v-if="!isLoadingSongs">
              <DownOutlined />
              加载更多歌曲
            </template>
            <template v-else>
              加载中...
            </template>
          </a-button>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="allSongs.length === 0 && !isLoadingSongs">
          <a-empty description="暂无歌曲">
            <a-button type="primary" @click="refreshSongs">
              <ReloadOutlined />
              重新加载
            </a-button>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  HeartOutlined,
  UserOutlined,
  FolderOutlined,
  DownloadOutlined,
  CloudOutlined,
  HistoryOutlined,
  StarOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  CoffeeOutlined,
  LaptopOutlined,
  DownOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined,
  SoundOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { subsonicClient } from '@/services/subsonic'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/types'

const router = useRouter()
const musicStore = useMusicStore()

// 响应式数据
const selectedKeys = ref(['discover'])
const searchQuery = ref('')
const username = ref('')

// 计算属性
const currentSong = computed(() => musicStore.currentSong)
const allSongs = computed(() => musicStore.allSongs)
const isLoadingSongs = computed(() => musicStore.isLoadingSongs)
const hasMoreSongs = computed(() => musicStore.hasMoreSongs)

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  // 检查认证状态
  if (!subsonicClient.isAuthenticated()) {
    if (!subsonicClient.restoreAuth()) {
      router.push('/login')
      return
    }
  }

  // 获取用户信息
  const userInfo = subsonicClient.getUserInfo()
  if (userInfo) {
    username.value = userInfo.username
  }

  // 加载歌曲数据
  await musicStore.fetchSongs(1, true)
})

/**
 * 刷新歌曲列表
 */
const refreshSongs = async () => {
  await musicStore.refreshSongs()
}

/**
 * 加载更多歌曲
 */
const loadMoreSongs = async () => {
  await musicStore.loadMoreSongs()
}

/**
 * 播放歌曲
 * @param song - 要播放的歌曲
 */
const playSong = (song: Song) => {
  musicStore.playSong(song, allSongs.value)
}

/**
 * 播放所有歌曲
 */
const playAllSongs = () => {
  if (allSongs.value.length > 0) {
    musicStore.playSong(allSongs.value[0], allSongs.value)
  }
}

/**
 * 格式化时长
 * @param seconds - 秒数
 * @returns 格式化的时长字符串
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}



/**
 * 处理搜索
 * @param value - 搜索关键词
 */
const handleSearch = async (value: string) => {
  if (!value.trim()) return

  try {
    const results = await subsonicClient.search(value)
    // 这里可以显示搜索结果
    console.log('搜索结果:', results)
  } catch (error) {
    console.error('搜索失败:', error)
    message.error('搜索失败')
  }
}

/**
 * 处理登出
 */
const handleLogout = () => {
  subsonicClient.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;  /* 修改此处 */
  height: 100vh;
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.logo {
  padding: 24px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.logo h2 {
  color: #52c41a;
  margin: 0;
  font-size: 20px;
}

.logo p {
  color: #666;
  margin: 4px 0 0 0;
  font-size: 12px;
}

.sidebar-menu {
  border: none;
}

.sidebar-section {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.sidebar-section h4 {
  color: #666;
  font-size: 12px;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  margin-left: 200px;
  padding: 0 10px;  /* 添加左右边距 */
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

/* 音乐库标题区样式 */
.music-library-section {
  padding: 32px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.library-header {
  text-align: center;
}

.library-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: white;
}

.library-subtitle {
  font-size: 18px;
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.library-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 歌曲列表样式 */
.song-list-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.song-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.song-list-header {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 80px 60px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 500;
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
}

.song-item {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 80px 60px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #f5f5f5;
}

.song-item.active {
  background-color: #e6f7ff;
}

.song-number {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.playing-icon {
  color: #1890ff;
}

.song-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-name {
  font-weight: 500;
  color: #333;
}

.song-genre {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
  width: fit-content;
}

.song-artist,
.song-album,
.song-duration {
  display: flex;
  align-items: center;
  color: #666;
}

.song-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载更多按钮样式 */
.load-more-section {
  padding: 24px;
  text-align: center;
  background: white;
  border-radius: 0 0 8px 8px;
}

/* 空状态样式 */
.empty-state {
  padding: 48px 24px;
  text-align: center;
  background: white;
  border-radius: 0 0 8px 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .song-list-header,
  .song-item {
    grid-template-columns: 40px 2fr 1fr 60px 40px;
  }
  
  .song-album {
    display: none;
  }
  
  .library-title {
    font-size: 32px;
  }
  
  .library-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
