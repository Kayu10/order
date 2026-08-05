<template>
  <div 
    class="menu-item-card"
    :class="{ 'sold-out': !item.isAvailable }"
  >
    <!-- 餐點圖片與售完遮罩 -->
    <div class="image-container">
      <img :src="item.image" :alt="item.name" />
      <div v-if="!item.isAvailable" class="sold-out-overlay">
        <span>{{ currentLang === 'en' ? 'SOLD OUT' : '已售完' }}</span>
      </div>
    </div>

    <div class="item-info">
      <h3>{{ item.name }}</h3>
      <p v-if="item.description" class="description">{{ item.description }}</p>
      <div class="item-footer">
        <span class="price">${{ item.price }}</span>
        <button 
          type="button"
          :disabled="!item.isAvailable"
          @click="handleSelect"
          class="btn-add"
        >
          <template v-if="!item.isAvailable">
            {{ currentLang === 'en' ? 'Sold Out' : '暫停販售' }}
          </template>
          <template v-else>
            {{ currentLang === 'en' ? 'Add' : '點餐' }}
          </template>
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
const cartStore = useCartStore()

const handleSelect = () => {
  if (!props.item.isAvailable) return

  // 如果包含飲料選項（例如套餐），開啟飲料 Modal；否則開啟標準客製化 Modal
  if (props.item.hasDrink) {
    cartStore.openDrinkModal(props.item)
  } else {
    cartStore.openCustomModal(props.item)
  }
}
</script>

<style scoped>
.menu-item-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.menu-item-card.sold-out {
  opacity: 0.7;
}

.image-container {
  position: relative;
  width: 100%;
  height: 160px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.item-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-info h3 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.description {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 12px;
}

.item-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2563eb;
}

.btn-add {
  padding: 6px 14px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-add:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>