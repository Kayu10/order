<script setup>
// 💡 1. 補齊 computed 與 watch 的引入
import { ref, computed, watch } from 'vue'
import { useCartStore } from '../stores/useCartStore'
import OrderConfirmModal from './OrderConfirmModal.vue'
import OrderSuccessModal from './OrderSuccessModal.vue'

const cartStore = useCartStore()
const isConfirmModalOpen = ref(false)
const isSuccessModalOpen = ref(false)

// 1. 時間模式與自訂時間輸入狀態
const timeMode = ref('ASAP')
const customTimeInput = ref('')

// 2. 當切換用餐方式 (內用/外帶/外送) 時，將 UI 時間選單重置為儘快製作
watch(
  () => cartStore.diningType,
  () => {
    timeMode.value = 'ASAP'
    customTimeInput.value = ''
  }
)

// 3. 計算格式化時間字串 (如: 14:25)
const getTimeString = (addMinutes) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + addMinutes)
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 4. 計算「至少 20 分鐘後」的最早可預約時間
const minCustomTime = computed(() => {
  return getTimeString(20)
})

// 5. 切換下拉選單時同步更新到 Pinia Store
const handleTimeModeChange = () => {
  if (timeMode.value === 'ASAP') {
    cartStore.pickupTime = 'ASAP'
  } else if (timeMode.value === '30m') {
    cartStore.pickupTime = `30 分鐘後 (${getTimeString(30)})`
  } else if (timeMode.value === '45m') {
    cartStore.pickupTime = `45 分鐘後 (${getTimeString(45)})`
  } else if (timeMode.value === '1h') {
    cartStore.pickupTime = `1 小時後 (${getTimeString(60)})`
  } else if (timeMode.value === 'custom') {
    customTimeInput.value = minCustomTime.value
    cartStore.pickupTime = `自訂取餐時間 ${customTimeInput.value}`
  }
}

// 6. 驗證自訂時間是否低於 20 分鐘
const validateCustomTime = () => {
  if (customTimeInput.value < minCustomTime.value) {
    alert(`取餐時間過近！店家製作需要時間，請選擇至少 20 分鐘後（${minCustomTime.value} 以後）的時間。`)
    customTimeInput.value = minCustomTime.value
  }
  cartStore.pickupTime = `自訂取餐時間 ${customTimeInput.value}`
}

// 開啟確認彈窗前進行欄位檢查
const openConfirmModal = () => {
  if (cartStore.cartItems.length === 0) {
    alert('購物車是空的！')
    return
  }

  // 檢查內用桌號
  if (cartStore.diningType === 'dine-in' && !cartStore.tableNumber?.trim()) {
    alert('請輸入桌號！')
    return
  }

  // 檢查外帶電話
  if (cartStore.diningType === 'takeout' && !cartStore.contactPhone?.trim()) {
    alert('請輸入聯絡電話！')
    return
  }

  // 檢查外送電話與地址
  if (cartStore.diningType === 'delivery') {
    if (!cartStore.contactPhone?.trim()) {
      alert('請輸入外送聯絡電話！')
      return
    }
    if (!cartStore.deliveryAddress?.trim()) {
      alert('請輸入外送地址！')
      return
    }
  }

  isConfirmModalOpen.value = true
}

const handleConfirmSubmit = async () => {
  isConfirmModalOpen.value = false
  
  // 執行送出訂單，並拿到產生的訂單資料
  const result = await cartStore.submitOrder()
  
  if (result) {
    isSuccessModalOpen.value = true
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
    
    <!-- 標題與清空按鈕 -->
    <div class="flex justify-between items-center border-b pb-3 mb-4">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        🛒 已點餐點 
        <span v-if="cartStore.totalCount > 0" class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
          {{ cartStore.totalCount }}
        </span>
      </h2>
      <button 
        v-if="cartStore.cartItems.length > 0"
        @click="cartStore.clearCart"
        class="text-xs text-red-500 hover:underline cursor-pointer"
      >
        清空購物車
      </button>
    </div>

    <!-- 用餐類型選擇區 (內用 / 外帶 / 外送) -->
    <div class="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-3">
      <button 
        type="button"
        @click="cartStore.setDiningType('dine-in')"
        :class="[
          'py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
          cartStore.diningType === 'dine-in' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        🍽️ 內用
      </button>

      <button 
        type="button"
        @click="cartStore.setDiningType('takeout')"
        :class="[
          'py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
          cartStore.diningType === 'takeout' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        🛍️ 外帶
      </button>

      <button 
        type="button"
        @click="cartStore.setDiningType('delivery')"
        :class="[
          'py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
          cartStore.diningType === 'delivery' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        🛵 外送
      </button>
    </div>

    <!-- 動態輸入框與時間選單區塊 -->
    <div class="mb-4 space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
      <!-- 內用：桌號 -->
      <div v-if="cartStore.diningType === 'dine-in'" class="space-y-1">
        <label class="block text-xs font-bold text-gray-700">桌號 <span class="text-red-500">*</span></label>
        <input 
          v-model.trim="cartStore.tableNumber"
          type="text" 
          placeholder="例如：A01 桌"
          class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 外帶：聯絡電話 -->
      <div v-else-if="cartStore.diningType === 'takeout'" class="space-y-1">
        <label class="block text-xs font-bold text-gray-700">聯絡電話 <span class="text-red-500">*</span></label>
        <input 
          v-model.trim="cartStore.contactPhone"
          type="tel" 
          placeholder="請輸入手機號碼"
          class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 外送：電話 + 地址 -->
      <div v-else-if="cartStore.diningType === 'delivery'" class="space-y-2">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-gray-700">聯絡電話 <span class="text-red-500">*</span></label>
          <input 
            v-model.trim="cartStore.contactPhone"
            type="tel" 
            placeholder="請輸入手機號碼"
            class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-gray-700">外送地址 <span class="text-red-500">*</span></label>
          <input 
            v-model.trim="cartStore.deliveryAddress"
            type="text" 
            placeholder="請輸入完整地址"
            class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- 預計取餐 / 送達時間選單 -->
      <div class="pt-2 border-t border-gray-200 space-y-2">
        <label class="block text-xs font-bold text-gray-700">
          {{ cartStore.diningType === 'delivery' ? '希望送達時間' : '預計取餐時間' }}
        </label>

        <select 
          v-model="timeMode"
          @change="handleTimeModeChange"
          class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
        >
          <option value="ASAP">⚡ 儘快製作（立即處理）</option>
          <option value="30m">🕒 30 分鐘後取餐 ({{ getTimeString(30) }})</option>
          <option value="45m">🕒 45 分鐘後取餐 ({{ getTimeString(45) }})</option>
          <option value="1h">🕒 1 小時後取餐 ({{ getTimeString(60) }})</option>
          <option value="custom">✏️ 顧客自行填寫取餐時間</option>
        </select>

        <!-- 當選擇「自行填寫」時展開時間輸入框 -->
        <div v-if="timeMode === 'custom'" class="space-y-1 pt-1">
          <div class="flex items-center gap-2">
            <input 
              type="time" 
              v-model="customTimeInput"
              :min="minCustomTime"
              @change="validateCustomTime"
              class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          <p class="text-[10px] text-gray-400">⚠️ 取餐時間至少需為 20 分鐘後（最早為 {{ minCustomTime }}）</p>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="cartStore.cartItems.length === 0" class="text-center py-8 text-gray-400">
      <p class="text-sm">尚未選擇任何餐點</p>
    </div>

    <!-- 購物車清單區 -->
    <div v-else class="space-y-4">
      <div class="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
        <div 
          v-for="item in cartStore.cartItems" 
          :key="item.cartItemId" 
          class="flex items-center justify-between border-b border-gray-50 pb-3"
        >
          <div class="flex-1 pr-2">
            <h4 class="font-medium text-gray-800 text-sm">{{ item.name }}</h4>
            <p v-if="item.customOptionsText" class="text-xs text-blue-500 font-medium mt-0.5">
              {{ item.customOptionsText }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">${{ item.price }} / 份</p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button"
              @click="cartStore.updateQuantity(item.cartItemId, -1)"
              class="w-7 h-7 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold cursor-pointer"
            >
              -
            </button>
            <span class="text-sm font-semibold w-5 text-center">{{ item.quantity }}</span>
            <button 
              type="button"
              @click="cartStore.updateQuantity(item.cartItemId, 1)"
              class="w-7 h-7 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <!-- 💡 備註與發票統編欄位（僅有餐點時顯示） -->
      <div class="pt-3 border-t border-gray-100 space-y-3">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-gray-700 flex items-center gap-1">
            📝 訂單備註 <span class="text-gray-400 font-normal">(選填)</span>
          </label>
          <textarea 
            v-model="cartStore.orderNote"
            rows="2"
            placeholder="例如：請提供環保餐具、醬汁分開放、外送放管理室..."
            class="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        
      </div>

      <!-- 總計區 -->
      <div class="pt-2 border-t border-gray-200 space-y-2">
        <div class="flex justify-between text-lg font-bold text-gray-900">
          <span>總計金額</span>
          <span class="text-blue-600">${{ cartStore.totalPrice }}</span>
        </div>

        <button 
          type="button"
          @click="openConfirmModal"
          class="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow transition cursor-pointer"
        >
          確認送出訂單 (${{ cartStore.totalPrice }})
        </button>
      </div>
    </div>

    <!-- 彈窗掛載區 -->
    <OrderConfirmModal
      :is-open="isConfirmModalOpen"
      @close="isConfirmModalOpen = false"
      @confirm="handleConfirmSubmit"
    />
    <OrderSuccessModal 
      :is-open="isSuccessModalOpen"
      :order-data="cartStore.lastOrder"
      @close="isSuccessModalOpen = false"
    />
  </div>
</template>