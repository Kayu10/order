<!-- src/components/MenuItem.vue -->
<script setup>
import { useCartStore } from '../stores/useCartStore'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

// 點擊事件處理
const handleAddToCart = () => {
  if (props.item.hasDrink) {
    // 1. 套餐：先打開選飲料 Modal
    cartStore.openDrinkModal(props.item)
  } else if (props.item.category === 'drink') {
    // 2. 單點飲料：直接加入購物車（補上簡短文字說明，讓購物車顯示更完整）
    cartStore.addToCart({
      ...props.item,
      customOptionsText: '單點飲料',
      cartItemId: `${props.item.id}_single_drink`
    })
  } else {
    // 3. 其他品項（炸雞、薯條等）：打開調味 Modal
    cartStore.openCustomModal(props.item)
  }
}
</script>

<template>
  <div class="card">
    <!-- 防破圖處理 -->
    <img 
      :src="item.image" 
      :alt="item.name" 
      class="card-img"
      @error="(e) => e.target.style.display = 'none'" 
    />

    <div class="card-body">
      <div class="card-header">
        <h3 class="title">{{ item.name }}</h3>
        
        <p v-if="item.description" class="description">
          {{ item.description }}
        </p>

        <span class="price">${{ item.price }}</span>
      </div>

      <!-- 💡 補上 type="button"，防止在 Form 標籤內部造成自動 Submit 刷新頁面 -->
      <button type="button" class="add-btn" @click="handleAddToCart">
        + 加入購物車
      </button>
    </div>
  </div>
</template>

<style scoped>
.description {
  font-size: 1rem;
  color: #6b7280;
  margin: 4px 0;
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.card-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.title {
  margin: 0;
  font-size: 1rem;
}

.price {
  color: #2563eb;
  font-weight: bold;
}

.add-btn {
  width: 100%;
  padding: 8px;
  background-color: #1d4ed8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-btn:hover {
  background-color: #1e40af;
}
</style>