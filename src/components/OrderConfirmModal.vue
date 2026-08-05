<template>
  <Transition name="fade">
    <!-- 當 isOpen 為 true 時才顯示遮罩與彈窗 -->
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        
        <!-- 頂部標題與關閉 X -->
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="text-base font-bold text-gray-800">
            {{ currentLang === 'en' ? 'Confirm Your Order Details' : '請再次確認您的餐點與資訊' }}
          </h3>
          <button 
            type="button" 
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- 用餐資訊卡片 -->
        <div class="bg-gray-50 p-3 rounded-xl space-y-2 mb-4 text-xs border border-gray-100">
          <div class="flex justify-between">
            <span class="text-gray-500">{{ currentLang === 'en' ? 'Dining Option' : '用餐方式' }}</span>
            <span class="font-bold text-blue-600">{{ diningTypeLabel }}</span>
          </div>

          <div v-if="cartStore.diningType === 'dine-in'" class="flex justify-between">
            <span class="text-gray-500">{{ currentLang === 'en' ? 'Table No.' : '桌號' }}</span>
            <span class="font-bold text-gray-800">{{ cartStore.tableNumber }}</span>
          </div>

          <div v-else-if="cartStore.diningType === 'takeout'" class="flex justify-between">
            <span class="text-gray-500">{{ currentLang === 'en' ? 'Phone Number' : '聯絡電話' }}</span>
            <span class="font-bold text-gray-800">{{ cartStore.contactPhone }}</span>
          </div>

          <template v-else-if="cartStore.diningType === 'delivery'">
            <div class="flex justify-between">
              <span class="text-gray-500">{{ currentLang === 'en' ? 'Phone Number' : '聯絡電話' }}</span>
              <span class="font-bold text-gray-800">{{ cartStore.contactPhone }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ currentLang === 'en' ? 'Delivery Address' : '外送地址' }}</span>
              <span class="font-bold text-gray-800 break-all ml-2">{{ cartStore.deliveryAddress }}</span>
            </div>
          </template>

          <div class="flex justify-between border-t border-gray-200 pt-2">
            <span class="text-gray-500">
              {{ currentLang === 'en' ? (cartStore.diningType === 'delivery' ? 'Delivery Time' : 'Pickup Time') : '取餐/送達時間' }}
            </span>
            <span class="font-bold text-green-600">
              {{ cartStore.pickupTime === 'ASAP' ? (currentLang === 'en' ? '⚡ ASAP' : '⚡ 儘快製作') : cartStore.pickupTime }}
            </span>
          </div>

          <div v-if="cartStore.orderNote" class="flex justify-between border-t border-gray-200 pt-2">
            <span class="text-gray-500">{{ currentLang === 'en' ? 'Order Note' : '訂單備註' }}</span>
            <span class="text-gray-700 break-all ml-2">{{ cartStore.orderNote }}</span>
          </div>
        </div>

        <!-- 餐點列表 -->
        <div class="space-y-2 max-h-[30vh] overflow-y-auto mb-4 pr-1">
          <div 
            v-for="item in cartStore.cartItems" 
            :key="item.cartItemId"
            class="flex justify-between items-center text-xs border-b border-gray-50 pb-2"
          >
            <div>
              <p class="font-bold text-gray-800">{{ item.name }} x {{ item.quantity }}</p>
              <p v-if="item.customOptionsText" class="text-[11px] text-blue-500">{{ item.customOptionsText }}</p>
            </div>
            <span class="font-semibold text-gray-700">${{ item.price * item.quantity }}</span>
          </div>
        </div>

        <!-- 總金額 -->
        <div class="flex justify-between items-center border-t pt-3 mb-5 text-sm font-extrabold text-gray-900">
          <span>{{ currentLang === 'en' ? 'Total Amount' : '總計金額' }}</span>
          <span class="text-lg text-blue-600">${{ cartStore.totalPrice }}</span>
        </div>

        <!-- 操作按鈕區 -->
        <div class="flex gap-2">
          <button 
            type="button"
            @click="handleClose"
            class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {{ currentLang === 'en' ? 'Edit Order' : '返回修改' }}
          </button>
          
          <button 
            type="button"
            @click="handleFinalSubmit"
            class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            {{ currentLang === 'en' ? 'Confirm & Submit' : '確認送出訂單' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useCartStore } from '../stores/useCartStore'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

// 💡 注入來自 App.vue 的語言狀態
const currentLang = inject('currentLang', ref('zh'))
const cartStore = useCartStore()

const diningTypeLabel = computed(() => {
  if (currentLang.value === 'en') {
    const mapEn = {
      'dine-in': '🍽️ Dine-In',
      'takeout': '🥡 Takeout',
      'delivery': '🛵 Delivery'
    }
    return mapEn[cartStore.diningType] || 'Not Selected'
  }

  const mapZh = {
    'dine-in': '🍽️ 內用',
    'takeout': '🥡 外帶',
    'delivery': '🛵 外送'
  }
  return mapZh[cartStore.diningType] || '未選擇'
})

const handleClose = () => {
  emit('close')
}

// 單純通知父組件，不自行執行 submitOrder()
const handleFinalSubmit = () => {
  emit('confirm')
}
</script>

<style scoped>
/* 半透明滿版背景遮罩 */
.modal-overlay {
  position: fixed;
  top: 0; 
  left: 0;
  width: 100vw; 
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* 居中白色卡片樣式 */
.modal-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>