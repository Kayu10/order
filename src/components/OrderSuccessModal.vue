<template>
  <Transition name="fade">
    <!-- 點擊背景遮罩關閉彈窗 -->
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        
        <!-- 成功打勾圖示與標題 -->
        <div class="text-center py-2">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-extrabold text-gray-800">
            {{ currentLang === 'en' ? 'Order Submitted!' : '訂單送出成功！' }}
          </h2>
          <p class="text-xs text-gray-500 mt-1">
            {{ currentLang === 'en' ? 'Your order has been received and is being prepared.' : '店家已收到您的訂單，正在準備中' }}
          </p>
        </div>

        <!-- 核心訂單卡片 -->
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 my-4 space-y-3">
          
          <!-- 訂單編號 -->
          <div class="flex justify-between items-center border-b border-gray-200 pb-2">
            <span class="text-xs text-gray-500 font-medium">
              {{ currentLang === 'en' ? 'Order ID' : '訂單編號' }}
            </span>
            <span class="text-sm font-bold font-mono text-blue-600">{{ orderData?.orderId }}</span>
          </div>

          <!-- 用餐方式與預計時間 -->
          <div class="flex justify-between items-center border-b border-gray-200 pb-2">
            <span class="text-xs text-gray-500 font-medium">
              {{ currentLang === 'en' ? (orderData?.diningType === 'delivery' ? 'Est. Delivery' : 'Est. Pickup') : '預計取餐/送達' }}
            </span>
            <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {{ orderData?.pickupTime === 'ASAP' ? (currentLang === 'en' ? '⚡ ASAP' : '⚡ 儘快製作') : orderData?.pickupTime }}
            </span>
          </div>

          <!-- 用餐類型對應細節 -->
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-500 font-medium">
              {{ currentLang === 'en' ? 'Dining Option' : '用餐資訊' }}
            </span>
            <span class="font-bold text-gray-800">
              {{ diningTypeLabel }}
              <template v-if="orderData?.tableNumber">
                ({{ currentLang === 'en' ? 'Table:' : '桌號:' }} {{ orderData.tableNumber }})
              </template>
            </span>
          </div>

          <!-- 訂單備註 -->
          <div v-if="orderData?.orderNote && orderData?.orderNote !== '無'" class="flex justify-between items-start text-xs border-t border-gray-200 pt-2">
            <span class="text-gray-500 font-medium shrink-0">
              {{ currentLang === 'en' ? 'Order Note' : '訂單備註' }}
            </span>
            <span class="text-gray-700 text-right break-all ml-2">{{ orderData.orderNote }}</span>
          </div>

          <!-- 統編 -->
          <div v-if="orderData?.taxId && orderData?.taxId !== '無'" class="flex justify-between items-center text-xs border-t border-gray-200 pt-2">
            <span class="text-gray-500 font-medium">
              {{ currentLang === 'en' ? 'Tax ID' : '發票統編' }}
            </span>
            <span class="font-mono text-gray-800">{{ orderData.taxId }}</span>
          </div>
        </div>

        <!-- 取餐 QR Code 區塊 -->
        <div class="text-center bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-4">
          <p class="text-xs text-gray-600 font-bold mb-2">
            {{ currentLang === 'en' ? 'Please present this QR code to staff' : '請向店員出示此 QR Code 取餐' }}
          </p>
          <img 
            :src="qrCodeUrl" 
            alt="QR Code" 
            class="w-32 h-32 mx-auto bg-white p-1 rounded-lg border border-gray-200 shadow-sm"
          />
        </div>

        <!-- 餐點明細展開按鈕與內容 -->
        <div class="border-t pt-3 mb-4">
          <details class="text-xs text-gray-600">
            <summary class="font-bold cursor-pointer text-gray-700 hover:text-blue-600 flex justify-between">
              <span>
                {{ currentLang === 'en' ? `View Items (${orderData?.items?.length || 0})` : `觀看餐點明細 (共 ${orderData?.items?.length || 0} 項)` }}
              </span>
              <span>
                {{ currentLang === 'en' ? 'Subtotal:' : '小計：' }}${{ orderData?.totalPrice }}
              </span>
            </summary>
            
            <ul class="mt-2 space-y-2 pl-2 border-l-2 border-blue-200">
              <li v-for="item in orderData?.items" :key="item.cartItemId" class="flex flex-col">
                <div class="flex justify-between font-medium text-gray-800">
                  <span>{{ item.name }} x {{ item.quantity }}</span>
                  <span class="font-semibold">${{ item.price * item.quantity }}</span>
                </div>
                <!-- 客製化選項細節 -->
                <span v-if="item.customOptionsText" class="text-[11px] text-blue-500">
                  {{ item.customOptionsText }}
                </span>
              </li>
            </ul>
          </details>
        </div>

        <!-- 按鈕操作區 -->
        <button 
          type="button"
          @click="handleClose"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition cursor-pointer"
        >
          {{ currentLang === 'en' ? 'Back to Menu' : '回到主選單' }}
        </button>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, inject, ref } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// 💡 注入來自 App.vue 的語言狀態
const currentLang = inject('currentLang', ref('zh'))

// 用餐類型標籤對應
const diningTypeLabel = computed(() => {
  if (currentLang.value === 'en') {
    const mapEn = {
      'dine-in': '🍽️ Dine-In',
      'takeout': '🥡 Takeout',
      'delivery': '🛵 Delivery'
    }
    return mapEn[props.orderData?.diningType] || '🍽️ Dine-In'
  }

  const mapZh = {
    'dine-in': '🍽️ 內用',
    'takeout': '🥡 外帶',
    'delivery': '🛵 外送'
  }
  return mapZh[props.orderData?.diningType] || '🍽️ 內用'
})

// 使用免費 API 動態產生取餐 QR Code URL
const qrCodeUrl = computed(() => {
  const orderId = props.orderData?.orderId || 'ORD-0000'
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderId)}`
})

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #ffffff;
  padding: 24px;
  border-radius: 20px;
  width: 90%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>