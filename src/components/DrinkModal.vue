<template>
  <Transition name="fade">
    <div v-if="cartStore.isDrinkModalOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ currentLang === 'en' ? 'Select Options' : '請選擇套餐內容' }}</h3>
          <span class="close-btn" @click="handleClose">&times;</span>
        </div>
        
        <p v-if="cartStore.selectedItemForDrink" class="current-item">
          {{ cartStore.selectedItemForDrink?.name }}
        </p>

        <div class="modal-body space-y-4">
          <!-- 1. 副餐二選一 (若餐點有 hasSide 才顯示) -->
          <div v-if="cartStore.selectedItemForDrink?.hasSide" class="option-section">
            <h4 class="option-title">
              🍟 {{ currentLang === 'en' ? 'Select Side (1 Choice)' : '選擇副餐 (二選一)' }}
            </h4>
            <div class="drink-options">
              <label 
                v-for="side in sideOptions" 
                :key="side" 
                class="drink-option"
                :class="{ active: selectedSide === side }"
              >
                <input 
                  type="radio" 
                  name="side" 
                  :value="side" 
                  v-model="selectedSide"
                />
                <span class="drink-name">{{ side }}</span>
              </label>
            </div>
          </div>

          <!-- 2. 飲料選擇 -->
          <div class="option-section">
            <h4 class="option-title">
              🥤 {{ currentLang === 'en' ? 'Select Beverage' : '選擇飲料' }}
            </h4>
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
          </div>
        </div>

        <!-- 按鈕區塊 -->
        <div class="modal-actions mt-4">
          <button type="button" class="btn-cancel" @click="handleClose">
            {{ currentLang === 'en' ? 'Cancel' : '取消' }}
          </button>
          <button type="button" class="btn-confirm" @click="handleConfirm">
            {{ currentLang === 'en' ? 'Next: Customization' : '下一步：選擇調味' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import { useCartStore } from '../stores/useCartStore'

const currentLang = inject('currentLang', ref('zh'))
const cartStore = useCartStore()

const drinkOptions = ref([])
const selectedDrink = ref('')

const sideOptions = ref([])
const selectedSide = ref('')

watch(
  () => cartStore.selectedItemForDrink,
  (newItem) => {
    if (newItem) {
      // 初始化飲料
      const fallbackDrinks = currentLang.value === 'en' ? ['Coke', 'Sprite'] : ['可樂', '雪碧']
      drinkOptions.value = Array.isArray(newItem.drinkOptions) && newItem.drinkOptions.length > 0
        ? newItem.drinkOptions
        : fallbackDrinks
      selectedDrink.value = newItem.defaultDrink || drinkOptions.value[0]

      // 初始化副餐 (若有)
      if (newItem.hasSide) {
        const fallbackSides = currentLang.value === 'en' ? ['French Fries', 'Tempura'] : ['波霸薯條', '甜不辣']
        sideOptions.value = Array.isArray(newItem.sideOptions) && newItem.sideOptions.length > 0
          ? newItem.sideOptions
          : fallbackSides
        selectedSide.value = newItem.defaultSide || sideOptions.value[0]
      }
    }
  },
  { immediate: true, deep: true }
)

const handleClose = () => {
  cartStore.closeDrinkModal()
}

const handleConfirm = () => {
  if (!cartStore.selectedItemForDrink) return

  // 打包選好的飲料與副餐資訊
  const itemWithDrink = {
    ...cartStore.selectedItemForDrink,
    selectedDrink: selectedDrink.value,
    selectedSide: cartStore.selectedItemForDrink.hasSide ? selectedSide.value : null
  }
  
  // 開啟下一個辣度/調味粉選擇 Modal
  cartStore.openCustomModal(itemWithDrink)
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
  max-width: 360px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
}

.current-item {
  font-size: 0.85rem;
  color: #2563eb;
  background: #eff6ff;
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 14px;
}

.option-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 8px;
}

.drink-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.drink-option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.drink-option.active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.drink-name {
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 6px;
}

.drink-option input[type="radio"] {
  accent-color: #2563eb;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-confirm {
  flex: 1.5;
  padding: 10px;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>