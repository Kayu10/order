import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 1. 先註冊 Pinia
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 2. 最後才掛載應用程式
app.mount('#app')