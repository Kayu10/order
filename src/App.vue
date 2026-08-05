<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { translations } from './data/i18n.js'
import { useCartStore } from './stores/useCartStore'
import { supabase } from './utils/supabase.js'

import AdminView from './components/AdminView.vue'
import MenuItem from './components/MenuItem.vue'
import Cart from './components/Cart.vue'
import CustomModal from './components/CustomizationModal.vue'
import DrinkModal from './components/DrinkModal.vue'

// 0. 當前切換頁面 (預設點餐頁面 customer，可切換 admin)
const currentTab = ref('customer')
const isStoreOpen = ref(true)
const fetchStoreStatus = async () => {
  const { data } = await supabase.from('store_settings').select('is_open').single()
  if (data) isStoreOpen.value = data.is_open
}
onMounted(() => {
  fetchMenuItems()
  fetchStoreStatus() // 初始化營業狀態
  // 1. 初始化讀取
  supabase.from('store_settings').select('is_open').single().then(({ data }) => {
    if (data) isStoreOpen.value = data.is_open
  })

  // 2. Realtime 訂閱：當店長後台一切換，前台不需重整理立刻連動！
  supabase
    .channel('public:store_settings')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings' }, (payload) => {
      isStoreOpen.value = payload.new.is_open
    })
    .subscribe()
})
// 🔒 頁面切換與密碼驗證邏輯
const switchTab = (targetTab) => {
  if (targetTab === 'admin') {
    // 預設密碼設定為 1234 (可自行修改)
    const adminPassword = '512204' 
    const inputPassword = prompt('🔒 請輸入員工/管理員後台密碼：')

    if (inputPassword === adminPassword) {
      currentTab.value = 'admin'
    } else if (inputPassword !== null) {
      alert('❌ 密碼錯誤，無法進入後台！')
    }
  } else {
    currentTab.value = 'customer'
  }
}

const cartStore = useCartStore()

// 1. 當前語言狀態
const currentLang = ref('zh')

// 2. 靜態翻譯字典 (提供系統標題與分類)
const t = computed(() => translations[currentLang.value])

// 3. 全域語言 Provider
provide('currentLang', currentLang)
provide('t', t)
provide('isStoreOpen', isStoreOpen)
// 4. 動態菜單資料庫狀態
const dbMenuItems = ref([])
const isLoading = ref(true)
const fetchError = ref(null)

// 5. 從 Supabase 抓取菜單資料
const fetchMenuItems = async () => {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    // 將資料庫資料格式化為符合前端組件要求的結構
    dbMenuItems.value = data || []
  } catch (err) {
    console.error('抓取 Supabase 菜單失敗:', err)
    fetchError.value = '無法載入菜單，請重新整理頁面'
  } finally {
    isLoading.value = false
  }
}

// 元件掛載時抓取一次
onMounted(() => {
  fetchMenuItems()
})

// 6. 依語言轉換後的動態菜單列表
const formattedMenuItems = computed(() => {
  return dbMenuItems.value.map(item => {
    const isEn = currentLang.value === 'en'
    return {
      id: item.id,
      name: isEn ? (item.name_en || item.name_zh) : item.name_zh,
      price: item.price,
      category: item.category,
      image: item.image || '/images/combo1.jpg',
      description: isEn ? (item.description_en || item.description_zh) : item.description_zh,
      isAvailable: item.is_available ?? true, // 是否售完 / 暫停販售
      hasDrink: item.has_drink ?? false,
      hasSide: item.has_side ?? false,
      defaultDrink: isEn ? (item.default_drink_en || item.default_drink_zh) : item.default_drink_zh,
      drinkOptions: isEn ? (item.drink_options_en || item.drink_options_zh) : item.drink_options_zh,
      defaultSide: isEn ? (item.default_side_en || item.default_side_zh) : item.default_side_zh,
      sideOptions: isEn ? (item.side_options_en || item.side_options_zh) : item.side_options_zh
    }
  })
})

// 7. 選中的分類 ID
const selectedCategory = ref('all')

// 8. 根據選中分類過濾後的餐點
const filteredMenuItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return formattedMenuItems.value
  }
  return formattedMenuItems.value.filter(item => item.category === selectedCategory.value)
})
</script>

<template>
  <!-- 若暫停營業，於菜單上方顯示提示橫幅 -->
<div v-if="!isStoreOpen" class="closed-banner">
  ⚠️ 本店目前暫停營業中，暫不開放線上點餐！
</div>
  <div class="main-wrapper">
    <!-- 頂部頁面切換列 -->
    <nav class="top-nav">
      <button 
        :class="{ active: currentTab === 'customer' }" 
        @click="switchTab('customer')">
        📱 顧客點餐畫面
      </button>
      <button 
        :class="{ active: currentTab === 'admin' }" 
        @click="switchTab('admin')">
        ⚙️ 員工管理後台
      </button>
    </nav>

    <!-- 根據當前頁面切換顯示 -->
    <AdminView v-if="currentTab === 'admin'" />
    
    <div v-else class="app-container">
      <!-- 頂部語言切換區塊 -->
      <header class="header">
        <h1>{{ t.title }}</h1>
        <div class="lang-switch">
          <button 
            :class="{ active: currentLang === 'zh' }" 
            @click="currentLang = 'zh'">
            中文
          </button>
          <button 
            :class="{ active: currentLang === 'en' }" 
            @click="currentLang = 'en'">
            English
          </button>
        </div>
      </header>

      <main class="main-content">
        <section class="menu-section">
          <!-- 分類按鈕區塊 -->
          <div class="category-buttons">
            <button 
              v-for="cat in t.categories" 
              :key="cat.id"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectedCategory = cat.id"
            >
              {{ cat.name }}
            </button>
          </div>

          <!-- 載入中狀態 -->
          <div v-if="isLoading" class="text-center py-12 text-gray-500">
            <p class="text-sm font-bold">⌛ {{ currentLang === 'en' ? 'Loading menu...' : '菜單載入中...' }}</p>
          </div>

          <!-- 錯誤提示 -->
          <div v-else-if="fetchError" class="text-center py-12 text-red-500">
            <p class="text-sm font-bold">{{ fetchError }}</p>
            <button @click="fetchMenuItems" class="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1 rounded">
              重新嘗試
            </button>
          </div>

          <!-- 菜單列表區塊 -->
          <div v-else class="menu-grid">
            <MenuItem 
              v-for="item in filteredMenuItems" 
              :key="item.id" 
              :item="item" 
            />
          </div>
        </section>

        <!-- 購物車區塊 -->
        <section class="cart-section">
          <Cart />
        </section>
      </main>

      <!-- 掛載客製化彈窗與飲料彈窗 -->
      <CustomModal 
        :is-open="cartStore.isModalOpen"
        :item="cartStore.selectedItemForCustom"
        @close="cartStore.closeModal"
        @add-to-cart="(customizedItem) => cartStore.addToCart(customizedItem)"
      />
      <DrinkModal v-if="cartStore.isDrinkModalOpen" />
    </div>
  </div>
</template>

<style scoped>
.closed-banner {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 16px;
}
/* 頂部頁面切換列 */
.top-nav {
  background-color: #1e293b;
  padding: 10px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.top-nav button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #334155;
  color: #cbd5e1;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-nav button.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.app-container {
  padding: 12px !important;
  max-width: 1200px;
  margin: 0 auto;
}

/* 標題與語言切換區塊修復 */
.header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 16px !important;
  gap: 8px !important;
}

.header h1 {
  font-size: 1.1rem !important; /* 縮小標題字體，防止手機擠壓 */
  line-height: 1.2 !important;
  margin: 0 !important;
  white-space: nowrap !important; /* 絕不換行重疊 */
  color: #0f172a !important;
}

.lang-switch {
  display: flex !important;
  gap: 4px !important;
  flex-shrink: 0 !important;
}

.lang-switch button {
  padding: 4px 8px !important;
  font-size: 0.75rem !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  background: white !important;
  cursor: pointer !important;
}

.lang-switch button.active {
  background-color: #2563eb !important;
  color: white !important;
  border-color: #2563eb !important;
}

/* 分類按鈕區塊 (橫向滑動) */
.category-buttons {
  display: flex !important;
  gap: 8px !important;
  margin-bottom: 16px !important;
  overflow-x: auto !important; /* 手機端可左右滑動 */
  padding-bottom: 6px !important;
  white-space: nowrap !important;
  -webkit-overflow-scrolling: touch;
}

.category-buttons button {
  padding: 6px 14px !important;
  font-size: 0.85rem !important;
  border-radius: 20px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #f1f5f9 !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
}

.category-buttons button.active {
  background-color: #10b981 !important;
  color: white !important;
  border-color: #10b981 !important;
}

/* 電腦端 3 欄 / 手機端 2 欄卡片 */
.menu-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important; 
  gap: 16px !important;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1rem !important;
  }
  
  /* 📱 手機端強制顯示 2 欄精緻小卡片 */
  .menu-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }
}
</style>