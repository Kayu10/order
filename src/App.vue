<script setup>
import { ref, computed, provide } from 'vue'
import { translations } from './data/i18n.js'
import { useCartStore } from './stores/useCartStore'

import MenuItem from './components/MenuItem.vue'
import Cart from './components/Cart.vue'
import CustomModal from './components/CustomizationModal.vue'
import DrinkModal from './components/DrinkModal.vue'

const cartStore = useCartStore()

// 1. 當前語言狀態 (預設為中文 'zh')
const currentLang = ref('zh')

// 2. 響應式的當前語言字典 (包含 title, categories, menuItems)
const t = computed(() => translations[currentLang.value])

// 3. 將語言資訊提供給子組件 (如 MenuItem, Cart 等，如果他們需要讀取多語言)
provide('currentLang', currentLang)
provide('t', t)

// 4. 當前選中的分類 ID
const selectedCategory = ref('all')

// 5. 根據「當前語言」與「選中分類」動態過濾菜單
const filteredMenuItems = computed(() => {
  const items = t.value.menuItems || []
  if (selectedCategory.value === 'all') {
    return items
  }
  return items.filter(item => item.category === selectedCategory.value)
})
</script>

<template>
  <div class="app-container">
    <!-- 頂部語言切換按鈕區塊 -->
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
        <!-- 分類按鈕區塊：改從 t.categories 讀取 -->
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

        <!-- 菜單列表區塊 -->
        <div class="menu-grid">
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
</template>

<style scoped>
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