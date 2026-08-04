<template>
  <!-- 當 store 的 isDrinkModalOpen 為 true 時顯示彈窗 -->
  <Transition name="fade">
    <div v-if="cartStore.isDrinkModalOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <div class="modal-header">
          <h3>請選擇飲料</h3>
          <span class="close-btn" @click="handleClose">&times;</span>
        </div>
        
        <p v-if="cartStore.selectedItemForDrink" class="current-item">
          {{ cartStore.selectedItemForDrink?.name }} 的飲料
        </p>

        <!-- 飲料選項列表 -->
        <div class="drink-options">
          <label 
            v-for="drink in drinkOptions" 
            :key="drink" 
            class="drink-option"
            :class="{ active: selectedDrink === drink }"
          >
            <input 
              type="radio" 
              name="drink" 
              :value="drink" 
              v-model="selectedDrink"
            />
            <span class="drink-name">{{ drink }}</span>
          </label>
        </div>

        <!-- 按鈕區塊 -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="handleClose">取消</button>
          <button type="button" class="btn-confirm" @click="handleConfirm">下一步：選擇調味</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCartStore } from '../stores/useCartStore'

const cartStore = useCartStore()

const drinkOptions = ref([])
const selectedDrink = ref('')

// 💡 改用 watch 針對 isDrinkModalOpen 開啟時才初始化資料，比 watchEffect 更穩定
watch(
  () => cartStore.selectedItemForDrink,
  (newItem) => {
    if (newItem) {
      // 讀取傳進來的 drinkOptions 陣列
      drinkOptions.value = Array.isArray(newItem.drinkOptions) && newItem.drinkOptions.length > 0
        ? newItem.drinkOptions
        : ['可樂', '雪碧']

      // 讀取預設飲料，沒傳就選陣列第一個
      selectedDrink.value = newItem.defaultDrink || drinkOptions.value[0]
    }
  },
  { immediate: true, deep: true }
)

const handleClose = () => {
  cartStore.closeDrinkModal()
}

const handleConfirm = () => {
  if (!cartStore.selectedItemForDrink) return

  // 1. 先複製一份完整商品，並把選好的飲料附加進去
  const itemWithDrink = {
    ...cartStore.selectedItemForDrink,
    selectedDrink: selectedDrink.value
  }
  
  // 2. 順序：先開啟下一個客製化 Modal，將帶有飲料資訊的 item 傳過去
  cartStore.openCustomModal(itemWithDrink)

  // 3. 再關閉目前的飲料 Modal
  cartStore.closeDrinkModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  width: 85%;
  max-width: 340px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
}

.current-item {
  font-size: 0.9rem;
  color: #4b5563;
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 18px;
}

.drink-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.drink-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.drink-option:hover {
  border-color: #3b82f6;
}

.drink-option.active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.drink-name {
  font-size: 1rem;
  font-weight: 500;
  margin-left: 12px;
}

.drink-option input[type="radio"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #2563eb;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
}

.btn-confirm {
  flex: 1.5;
  padding: 12px;
  background: #2563eb;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
}

.btn-confirm:hover {
  background: #1d4ed8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>