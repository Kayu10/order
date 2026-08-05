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

// 🔒 頁面切換與密碼驗證邏輯
const switchTab = (targetTab) => {
  if (targetTab === 'admin') {
    // 預設密碼設定為 1234 (可自行修改)
    const adminPassword = '1234' 
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
/* 頂部切換列樣式 */
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
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.lang-switch button {
  margin-left: 8px;
  padding: 6px 14px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  font-weight: bold;
}

.lang-switch button.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.category-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-buttons button {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background-color: #f3f4f6;
  cursor: pointer;
}

.category-buttons button.active {
  background-color: #42b883;
  color: white;
  border-color: #42b883;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 16px;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>