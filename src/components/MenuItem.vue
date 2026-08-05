<template>
  <div class="menu-item-card" :class="{ 'sold-out': !item.isAvailable || !isStoreOpen }">
    <!-- 餐點圖片 -->
    <div class="image-container">
      <img 
        :src="item.image" 
        :alt="item.name" 
        @error="handleImageError"
      />
      <!-- 打烊或售完遮罩 -->
      <div v-if="!isStoreOpen" class="sold-out-overlay">
        <span>打烊中</span>
      </div>
      <div v-else-if="!item.isAvailable" class="sold-out-overlay">
        <span>{{ currentLang === 'en' ? 'SOLD OUT' : '已售完' }}</span>
      </div>
    </div>

    <!-- 餐點資訊 -->
    <div class="item-info">
      <h3 class="item-title">{{ item.name }}</h3>
      <p v-if="item.description" class="description">{{ item.description }}</p>
      
      <div class="item-footer">
        <span class="price">${{ item.price }}</span>
        <!-- 💡 禁用按鈕：當打烊或售完時變灰且不可點 -->
        <button 
          type="button"
          :disabled="!isStoreOpen || !item.isAvailable"
          @click="handleSelect"
          class="btn-add"
        >
          <template v-if="!isStoreOpen">打烊</template>
          <template v-else-if="!item.isAvailable">售完</template>
          <template v-else>{{ currentLang === 'en' ? 'Add' : '點餐' }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import { useCartStore } from '../stores/useCartStore'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const currentLang = inject('currentLang', ref('zh'))
// 💡 注入全域營業狀態
const isStoreOpen = inject('isStoreOpen', ref(true))
const cartStore = useCartStore()

const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
}

const handleSelect = () => {
  // 💡 關鍵修復：打烊時直接回傳，絕對不打開彈窗
  if (!isStoreOpen.value) {
    alert('❌ 本店目前暫停營業中，暫不開放點餐！')
    return
  }

  if (!props.item.isAvailable) return

  if (props.item.hasDrink) {
    cartStore.openDrinkModal(props.item)
  } else {
    cartStore.openCustomModal(props.item)
  }
}
</script>

<style scoped>
/* 原本的 CSS 保持不變 */
.menu-item-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.menu-item-card.sold-out {
  opacity: 0.65;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
}

.item-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-title {
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: #1f2937;
  line-height: 1.2;
}

.description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
}

.price {
  font-weight: bold;
  font-size: 0.95rem;
  color: #2563eb;
}

.btn-add {
  padding: 4px 10px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

/* 灰色禁用按鈕樣式 */
.btn-add:disabled {
  background-color: #9ca3af !important;
  cursor: not-allowed;
}
</style>