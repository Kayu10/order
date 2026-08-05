<template>
  <div class="cart-page">
    <h2>🛒 {{ currentLang === 'en' ? 'My Cart' : '我的購物車' }}</h2>

    <!-- 1. 用餐方式選擇 -->
    <section class="dining-type-section">
      <h3>{{ currentLang === 'en' ? 'Dining Option' : '選擇用餐方式' }}</h3>
      <div class="dining-buttons">
        <button 
          type="button"
          :class="{ active: cartStore.diningType === 'dine-in' }"
          @click="setDiningType('dine-in')"
        >
          🍽️ {{ currentLang === 'en' ? 'Dine-In' : '內用' }}
        </button>
        <button 
          type="button"
          :class="{ active: cartStore.diningType === 'takeout' }"
          @click="setDiningType('takeout')"
        >
          🥡 {{ currentLang === 'en' ? 'Takeout' : '外帶' }}
        </button>
        <button 
          type="button"
          :class="{ active: cartStore.diningType === 'delivery' }"
          @click="setDiningType('delivery')"
        >
          🛵 {{ currentLang === 'en' ? 'Delivery' : '外送' }}
        </button>
      </div>

      <!-- 2. 動態輸入框區塊 -->
      <div class="dining-inputs">
        <!-- 內用：桌號 -->
        <div v-if="cartStore.diningType === 'dine-in'" class="input-group">
          <label for="tableNo">
            {{ currentLang === 'en' ? 'Table No.' : '桌號' }} 
            <span class="required">*</span>
          </label>
          <input 
            id="tableNo"
            v-model.trim="cartStore.tableNumber" 
            type="text" 
            :placeholder="currentLang === 'en' ? 'e.g. A01' : '請輸入桌號（如：A01）'"
          />
        </div>

        <!-- 外帶：電話 -->
        <div v-else-if="cartStore.diningType === 'takeout'" class="input-group">
          <label for="takeoutPhone">
            {{ currentLang === 'en' ? 'Phone Number' : '聯絡電話' }} 
            <span class="required">*</span>
          </label>
          <input 
            id="takeoutPhone"
            v-model.trim="cartStore.contactPhone" 
            type="tel" 
            :placeholder="currentLang === 'en' ? 'Enter phone number' : '請輸入手機號碼'"
          />
        </div>

        <!-- 外送：電話 + 地址 -->
        <div v-else-if="cartStore.diningType === 'delivery'" class="input-group-wrapper">
          <div class="input-group">
            <label for="deliveryPhone">
              {{ currentLang === 'en' ? 'Phone Number' : '聯絡電話' }} 
              <span class="required">*</span>
            </label>
            <input 
              id="deliveryPhone"
              v-model.trim="cartStore.contactPhone" 
              type="tel" 
              :placeholder="currentLang === 'en' ? 'Enter phone number' : '請輸入手機號碼'"
            />
          </div>
          <div class="input-group">
            <label for="deliveryAddress">
              {{ currentLang === 'en' ? 'Delivery Address' : '外送地址' }} 
              <span class="required">*</span>
            </label>
            <input 
              id="deliveryAddress"
              v-model.trim="cartStore.deliveryAddress" 
              type="text" 
              :placeholder="currentLang === 'en' ? 'Enter delivery address' : '請輸入詳細地址'"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 購物車品項列表 -->
    <section class="cart-items-section">
      <h3>
        {{ currentLang === 'en' ? 'Order Summary' : '餐點內容' }} 
        ({{ currentLang === 'en' ? `${cartStore.totalCount} items` : `共 ${cartStore.totalCount} 件` }})
      </h3>
      
      <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
        {{ currentLang === 'en' ? 'Your cart is empty!' : '購物車內目前沒有餐點喔！' }}
      </div>

      <ul v-else class="cart-list">
        <li v-for="item in cartStore.cartItems" :key="item.cartItemId" class="cart-item">
          <div class="item-details">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-options" v-if="item.customOptionsText">{{ item.customOptionsText }}</span>
            <span class="item-price">${{ item.price }}</span>
          </div>

          <div class="quantity-controls">
            <button type="button" @click="cartStore.updateQuantity(item.cartItemId, -1)">-</button>
            <span>{{ item.quantity }}</span>
            <button type="button" @click="cartStore.updateQuantity(item.cartItemId, 1)">+</button>
            <button type="button" class="btn-delete" @click="cartStore.removeFromCart(item.cartItemId)">🗑️</button>
          </div>
        </li>
      </ul>
    </section>

    <!-- 4. 結帳按鈕 -->
    <div class="cart-footer">
      <div class="total-bar">
        <span>{{ currentLang === 'en' ? 'Total:' : '總金額：' }}</span>
        <span class="total-amount">${{ cartStore.totalPrice }}</span>
      </div>
      <button 
        type="button" 
        class="btn-checkout" 
        :disabled="cartStore.cartItems.length === 0"
        @click="openConfirmModal"
      >
        {{ currentLang === 'en' ? 'Proceed to Checkout' : '前往確認訂單' }}
      </button>
    </div>

    <!-- 5. 確認訂單彈窗 -->
    <OrderConfirmModal 
      :is-open="isConfirmModalOpen" 
      @close="isConfirmModalOpen = false"
      @submit-success="onOrderSuccess"
    />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useCartStore } from '@/stores/useCartStore'
import OrderConfirmModal from './OrderConfirmModal.vue'

// 注入來自 App.vue 的語言變數
const t = inject('t')
const currentLang = inject('currentLang', ref('zh'))

const cartStore = useCartStore()
const isConfirmModalOpen = ref(false)

// 切換用餐類型時的封裝（避免殘留舊資料）
const setDiningType = (type) => {
  cartStore.setDiningType(type)
}

const openConfirmModal = () => {
  if (cartStore.cartItems.length === 0) {
    alert(currentLang.value === 'en' ? 'Your cart is empty!' : '購物車是空的！')
    return
  }

  // 防護驗證與雙語提示
  if (cartStore.diningType === 'dine-in' && !cartStore.tableNumber?.trim()) {
    alert(currentLang.value === 'en' ? 'Please enter table number!' : '請填寫內用桌號！')
    return
  }

  if (cartStore.diningType === 'takeout' && !cartStore.contactPhone?.trim()) {
    alert(currentLang.value === 'en' ? 'Please enter phone number!' : '請填寫聯絡電話！')
    return
  }

  if (cartStore.diningType === 'delivery') {
    if (!cartStore.contactPhone?.trim()) {
      alert(currentLang.value === 'en' ? 'Please enter contact phone number!' : '請填寫外送聯絡電話！')
      return
    }
    if (!cartStore.deliveryAddress?.trim()) {
      alert(currentLang.value === 'en' ? 'Please enter delivery address!' : '請填寫外送地址！')
      return
    }
  }

  isConfirmModalOpen.value = true
}

const onOrderSuccess = () => {
  console.log(currentLang.value === 'en' ? 'Order submitted successfully!' : '訂單處理成功！')
}
</script>

<style scoped>
.cart-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.dining-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.dining-buttons button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.dining-buttons button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: bold;
}

.input-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.required {
  color: red;
}

.empty-cart {
  padding: 20px 0;
  text-align: center;
  color: #888;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: bold;
}

.item-options {
  font-size: 0.8rem;
  color: #2563eb;
}

.item-price {
  font-size: 0.9rem;
  color: #666;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-controls button {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background: transparent !important;
  border: none !important;
}

.cart-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.total-bar {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
}

.total-amount {
  color: #2563eb;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}

.btn-checkout:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>