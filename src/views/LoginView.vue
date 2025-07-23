<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>MelodyFlow</h1>
        <p>连接到你的 Subsonic 服务器</p>
      </div>

      <a-form
        :model="loginForm"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <a-form-item label="服务器地址" name="serverUrl">
          <a-input
            v-model:value="loginForm.serverUrl"
            placeholder="https://your-server.com"
            size="large"
          />
        </a-form-item>

        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="loginForm.username"
            placeholder="请输入用户名"
            size="large"
          />
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="loginForm.password"
            placeholder="请输入密码"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { subsonicClient } from '@/services/subsonic'

const router = useRouter()
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  serverUrl: '',
  username: '',
  password: '',
})

// 表单验证规则
const rules = {
  serverUrl: [
    { required: true, message: '请输入服务器地址' },
    { type: 'url', message: '请输入有效的URL地址' },
  ],
  username: [
    { required: true, message: '请输入用户名' },
  ],
  password: [
    { required: true, message: '请输入密码' },
  ],
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  loading.value = true

  try {
    const success = await subsonicClient.login(
      loginForm.username,
      loginForm.password,
      loginForm.serverUrl
    )

    if (success) {
      message.success('登录成功')
      router.push('/')
    } else {
      message.error('登录失败，请检查用户名、密码和服务器地址')
    }
  } catch (error) {
    console.error('登录错误:', error)
    message.error('登录失败，请检查网络连接和服务器地址')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 24px;
}
</style>
