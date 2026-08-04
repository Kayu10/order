<!-- src/App.vue -->
<script setup>
import { ref, computed } from 'vue'

// 1. 引入 Pinia Store
import { useCartStore } from './stores/useCartStore'

// 2. 引入分類與菜單靜態資料
import { categories, menuItems } from './data/menu'

// 3. 引入其他組件（包含 CustomModal）
import MenuItem from './components/MenuItem.vue'
import Cart from './components/Cart.vue'
import CustomModal from './components/CustomizationModal.vue'
import DrinkModal from './components/DrinkModal.vue'
// 4. 取得 cartStore 實例
const cartStore = useCartStore()

// 5. 記錄當前選中的分類 id（預設為 'all'）
const selectedCategory = ref('all')

// 6. 計算屬性：根據選中的分類動態過濾餐點
const filteredMenuItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return menuItems // 如果選「全部餐點」，回傳所有餐點
  }
  return menuItems.filter(item => item.category === selectedCategory.value)
})
</script>

<template>
  <div class="app-container">
    <h1>📱 俏王妃線上點餐系統</h1>

    <main class="main-content">
      <section class="menu-section">
        <!-- 分類按鈕區塊 -->
        <div class="category-buttons">
          <button 
            v-for="cat in categories" 
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

    <!-- 💡 7. 掛載客製化彈窗（這裡一定要放，彈窗才會真正顯示！） -->
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
/* 選中的按鈕高亮樣式範例 */
button.active {
  background-color: #42b883;
  color: white;
}
.category-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 16px; /* 卡片之間的間距 */
}
</style>