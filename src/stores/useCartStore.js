import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore(
  'cart',
  () => {
    // 1. State
    const diningType = ref('dine-in')
    const tableNumber = ref('')
    const deliveryAddress = ref('')
    const contactPhone = ref('')
    const pickupTime = ref('ASAP')
    const cartItems = ref([])
    const orderNote = ref('')
    const taxId = ref('')
    const lastOrder = ref(null)

    // 一般客製化 Modal 狀態
    const isModalOpen = ref(false)
    const selectedItemForCustom = ref(null)

    // 飲料 Modal 狀態
    const isDrinkModalOpen = ref(false)
    const selectedItemForDrink = ref(null)

    // 2. Getters (Computed)
    const totalPrice = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    const totalCount = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    // 3. Actions - 工具與 Modal 操作
    const generateOrderId = () => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomCode = Math.floor(100 + Math.random() * 900)
      return `#ORD-${today}${randomCode}`
    }

    function setDiningType(type) {
      diningType.value = type
      pickupTime.value = 'ASAP' // 切換用餐類型時重置為盡快製作
    }

    const openCustomModal = (item) => {
      selectedItemForCustom.value = item
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
      selectedItemForCustom.value = null
    }

    function openDrinkModal(item) {
      selectedItemForDrink.value = item
      isDrinkModalOpen.value = true
    }

    function closeDrinkModal() {
      isDrinkModalOpen.value = false
      selectedItemForDrink.value = null
    }

    // 4. Actions - 購物車操作
    const addToCart = (customizedItem) => {
      const iceKey = customizedItem.ice || ''
      const sugarKey = customizedItem.sugar || ''
      const toppingsKey = Array.isArray(customizedItem.toppings)
        ? [...customizedItem.toppings].sort().join('-')
        : ''

      // 組合 unique key
      const cartItemId =
        customizedItem.cartItemId ||
        `${customizedItem.id}_ice:${iceKey}_sugar:${sugarKey}_top:${toppingsKey}`

      const addQty = customizedItem.quantity || 1

      // 檢查是否已存在
      const existingItem = cartItems.value.find((item) => item.cartItemId === cartItemId)

      if (existingItem) {
        existingItem.quantity += addQty
      } else {
        cartItems.value.push({
          ...customizedItem,
          cartItemId,
          quantity: addQty
        })
      }

      // 關閉彈窗
      closeModal()
      closeDrinkModal()
    }

    // 更新數量 (+1 / -1)
    const updateQuantity = (cartItemId, change) => {
      const index = cartItems.value.findIndex((item) => item.cartItemId === cartItemId)
      if (index !== -1) {
        cartItems.value[index].quantity += change
        if (cartItems.value[index].quantity <= 0) {
          cartItems.value.splice(index, 1)
        }
      }
    }

    // 直接移除品項
    const removeFromCart = (cartItemId) => {
      const index = cartItems.value.findIndex((item) => item.cartItemId === cartItemId)
      if (index !== -1) {
        cartItems.value.splice(index, 1)
      }
    }

    // 清空購物車與輸入資料
    function clearCart() {
      cartItems.value = []
      tableNumber.value = ''
      deliveryAddress.value = ''
      contactPhone.value = ''
      pickupTime.value = 'ASAP'
      orderNote.value = ''
      taxId.value = ''
    }

    // 送出訂單 (支援語系標示)
    async function submitOrder(lang = 'zh') {
      if (cartItems.value.length === 0) return null

      // 雙語預設文字處理
      const asapText = lang === 'en' ? '⚡ ASAP' : '⚡ 儘快製作'
      const defaultNoneText = lang === 'en' ? 'None' : '無'

      const payload = {
        orderId: generateOrderId(),
        diningType: diningType.value,
        pickupTime: pickupTime.value === 'ASAP' ? asapText : pickupTime.value,
        ...(diningType.value === 'dine-in' && { tableNumber: tableNumber.value }),
        ...(diningType.value === 'delivery' && { 
          deliveryAddress: deliveryAddress.value, 
          contactPhone: contactPhone.value 
        }),
        ...(diningType.value === 'takeout' && { contactPhone: contactPhone.value }),
        orderNote: orderNote.value.trim() || defaultNoneText,
        taxId: taxId.value.trim() || defaultNoneText,
        items: [...cartItems.value],
        totalPrice: totalPrice.value,
        createdAt: new Date().toLocaleString()
      }

      try {
        console.log('送出訂單 Payload:', payload)
        
        // 保存訂單資料並清空購物車
        lastOrder.value = payload
        clearCart()

        return payload // 回傳 payload 供 UI 開啟成功彈窗
      } catch (error) {
        console.error('送出訂單失敗:', error)
        return null
      }
    }

    return {
      pickupTime,
      orderNote,
      taxId,
      diningType,
      tableNumber,
      deliveryAddress,
      contactPhone,
      cartItems,
      isModalOpen,
      selectedItemForCustom,
      isDrinkModalOpen,
      selectedItemForDrink,
      totalPrice,
      totalCount,
      lastOrder,
      setDiningType,
      openCustomModal,
      closeModal,
      openDrinkModal,
      closeDrinkModal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      submitOrder
    }
  },
  {
    persist: true
  }
)