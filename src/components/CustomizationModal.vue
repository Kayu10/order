<script setup>
import { ref, computed, watch, inject } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})

const emit = defineEmits(['close', 'add-to-cart'])

// 💡 注入來自 App.vue 的語言狀態
const currentLang = inject('currentLang', ref('zh'))

// 1. 中英文客製化選項字典
const spicyOptions = computed(() => {
  return currentLang.value === 'en'
    ? ['No Spicy', 'Mild', 'Medium', 'Hot']
    : ['不辣', '小辣', '中辣', '大辣']
})

const powderOptions = computed(() => {
  return currentLang.value === 'en'
    ? ['Pepper', 'Plum Powder', 'Cheese Powder', 'None']
    : ['胡椒', '梅粉', '起司粉', '都不加']
})

const nonePowderText = computed(() => currentLang.value === 'en' ? 'None' : '都不加')
const defaultSpicyText = computed(() => currentLang.value === 'en' ? 'No Spicy' : '不辣')

// 2. 客製化選項狀態 (預設選中「不辣」與「都不加」)
const selectedSpicy = ref('不辣')
const selectedPowders = ref(['都不加'])

// 當 Modal 打開時，重置所有選項為當前語言的預設值
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedSpicy.value = defaultSpicyText.value
    selectedPowders.value = [nonePowderText.value]
  }
})

// 語言切換時，同步更新目前已選的文字為對應語言
watch(currentLang, () => {
  selectedSpicy.value = defaultSpicyText.value
  selectedPowders.value = [nonePowderText.value]
})

// 處理調味粉選擇邏輯 (含「都不加 / None」的互斥處理)
const togglePowder = (powder) => {
  if (powder === nonePowderText.value) {
    selectedPowders.value = [nonePowderText.value]
    return
  }

  let updated = selectedPowders.value.filter(p => p !== nonePowderText.value)

  const index = updated.indexOf(powder)
  if (index > -1) {
    updated.splice(index, 1)
  } else {
    updated.push(powder)
  }

  if (updated.length === 0) {
    updated = [nonePowderText.value]
  }

  selectedPowders.value = updated
}

// 計算總價
const finalPrice = computed(() => {
  if (!props.item) return 0
  return props.item.price
})

// 確認加入購物車
const handleAddToCart = () => {
  const sortedPowders = [...selectedPowders.value].sort()

  // 1. 過濾有效選項
  const rawOptionsList = [
    props.item?.selectedDrink,
    selectedSpicy.value,
    ...sortedPowders
  ].filter(Boolean)

  // 2. 組合字串 (例: "小辣 / 胡椒" 或 "Mild / Pepper")
  const optionsText = rawOptionsList.join(' / ')

  // 3. 產生唯一的 cartItemId
  const customId = `${props.item?.id}_opts:${optionsText}`

  // 4. 觸發事件傳給 Pinia/父元件
  emit('add-to-cart', {
    ...props.item,
    cartItemId: customId,
    price: finalPrice.value,
    customOptionsText: optionsText,
    quantity: 1
  })
  
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Modal 標題區 -->
      <div class="p-4 border-b flex justify-between items-center bg-gray-50">
        <div>
          <h3 class="font-bold text-gray-800 text-lg">{{ item?.name }}</h3>
          <p class="text-xs text-gray-500">
            {{ currentLang === 'en' ? 'Price:' : '單價：' }}${{ item?.price }}
          </p>
          <p v-if="item?.description" class="text-sm text-gray-800 mt-2.5 leading-relaxed bg-blue-50/60 p-3 rounded-lg">
            📋 {{ item.description }}
          </p>
        </div>
        <button type="button" @click="emit('close')" class="text-gray-400 hover:text-gray-600 font-bold text-xl px-2">✕</button>
      </div>

      <div class="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <!-- 區塊一：辣度調整 -->
        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700 block">
            {{ currentLang === 'en' ? 'Spiciness' : '辣度調整' }}
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="spicy in spicyOptions"
              :key="spicy"
              type="button"
              @click="selectedSpicy = spicy"
              :class="[
                'py-2 text-xs rounded-lg border transition font-medium',
                selectedSpicy === spicy 
                  ? 'border-red-500 bg-red-50 text-red-600 font-bold' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              ]"
            >
              {{ spicy }}
            </button>
          </div>
        </div>

        <!-- 區塊二：調味粉選擇 -->
        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700 block">
            {{ currentLang === 'en' ? 'Seasoning Powder' : '調味粉選擇' }}
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="powder in powderOptions"
              :key="powder"
              type="button"
              @click="togglePowder(powder)"
              :class="[
                'py-2.5 px-3 text-xs rounded-xl border transition flex items-center justify-between',
                selectedPowders.includes(powder)
                  ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span>{{ powder }}</span>
              <span v-if="selectedPowders.includes(powder)" class="text-blue-600">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部確認按鈕 -->
      <div class="p-4 border-t bg-gray-50 flex items-center justify-between gap-4">
        <div>
          <span class="text-xs text-gray-500 block">
            {{ currentLang === 'en' ? 'Subtotal' : '小計' }}
          </span>
          <span class="text-xl font-extrabold text-blue-600">${{ finalPrice }}</span>
        </div>
        <button
          type="button"
          @click="handleAddToCart"
          class="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl shadow transition"
        >
          {{ currentLang === 'en' ? 'Add to Cart' : '加入購物車' }}
        </button>
      </div>

    </div>
  </div>
</template>