<template>
  <div class="admin-container">
    <header class="admin-header">
      <h2>⚙️ 俏王妃 - 員工/店長後台管理</h2>
      <button @click="fetchMenuItems" class="btn-refresh">🔄 重新整理菜單</button>
    </header>

    <!-- 1. 新增餐點區塊 -->
    <section class="add-item-card">
      <h3>➕ 新增菜單品項</h3>
      <form @submit.prevent="handleAddItem" class="item-form">
        <div class="form-grid">
          <div class="form-group">
            <label>中文名稱 <span class="required">*</span></label>
            <input v-model.trim="newItem.name_zh" type="text" placeholder="例：紐澳良雞排" required />
          </div>

          <div class="form-group">
            <label>英文名稱 <span class="required">*</span></label>
            <input v-model.trim="newItem.name_en" type="text" placeholder="例：New Orleans Chicken Cutlet" required />
          </div>

          <div class="form-group">
            <label>價格 ($) <span class="required">*</span></label>
            <input v-model.number="newItem.price" type="number" min="0" placeholder="例：80" required />
          </div>

          <div class="form-group">
            <label>分類 <span class="required">*</span></label>
            <select v-model="newItem.category" required>
              <option value="main">美式風味 (main)</option>
              <option value="Tai">泰式風味 (Tai)</option>
              <option value="dessert">精緻小品 (dessert)</option>
              <option value="combo">嚴選套餐 (combo)</option>
              <option value="drink">精選飲品 (drink)</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>圖片路徑 / 網址</label>
            <input v-model.trim="newItem.image" type="text" placeholder="例：/images/combo1.jpg" />
          </div>

          <div class="form-group full-width">
            <label>中文描述 (選填)</label>
            <input v-model.trim="newItem.description_zh" type="text" placeholder="例：鮮嫩多汁，微辣首選" />
          </div>

          <div class="form-group full-width">
            <label>英文描述 (選填)</label>
            <input v-model.trim="newItem.description_en" type="text" placeholder="例：Juicy and tender chicken cutlet" />
          </div>

          <!-- 套餐進階選單關聯 -->
          <div class="form-group full-width checkboxes">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newItem.has_drink" />
              包含飲料選單 (如套餐)
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="newItem.has_side" />
              包含副餐選單 (如薯條/甜不辣二選一)
            </label>
          </div>
        </div>

        <button type="submit" :disabled="isSubmitting" class="btn-submit">
          {{ isSubmitting ? '新增中...' : '確認新增品項' }}
        </button>
      </form>
    </section>

    <!-- 2. 品項管理與一鍵上下架清單 -->
    <section class="menu-management">
      <h3>📋 菜單上下架控制</h3>

      <div v-if="isLoading" class="loading-state">
        ⌛ 載入最新菜單中...
      </div>

      <div v-else class="menu-table-wrapper">
        <table class="menu-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名稱 (中 / 英)</th>
              <th>分類</th>
              <th>價格</th>
              <th>狀態 (販售 / 售完)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in menuItems" :key="item.id" :class="{ 'sold-out-row': !item.is_available }">
              <td>{{ item.id }}</td>
              <td>
                <div class="item-names">
                  <strong>{{ item.name_zh }}</strong>
                  <span class="sub-text">{{ item.name_en }}</span>
                </div>
              </td>
              <td><span class="category-badge">{{ item.category }}</span></td>
              <td class="price-cell">${{ item.price }}</td>
              <td>
                <!-- 💡 一鍵切換上下架開關 -->
                <label class="switch">
                  <input 
                    type="checkbox" 
                    :checked="item.is_available" 
                    @change="toggleAvailability(item)" 
                  />
                  <span class="slider round"></span>
                </label>
                <span :class="['status-text', item.is_available ? 'text-green' : 'text-red']">
                  {{ item.is_available ? '販售中' : '暫停販售 (已售完)' }}
                </span>
              </td>
              <td>
                <button @click="handleDeleteItem(item.id, item.name_zh)" class="btn-delete">
                  🗑️ 刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted ,onUnmounted} from 'vue'
import { supabase } from '../utils/supabase.js'
import { generateReceiptBuffer } from '../utils/printer.js'
const menuItems = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
// 出單機的局域網 IP (請設定為印表機靜態 IP)
const PRINTER_IP = ref('192.168.1.200')
const PRINTER_PORT = 9100 // 熱感應出單機標準 Port
// 發送列印請求至出單機
const sendToPrinter = async (order) => {
  try {
    const rawReceipt = generateReceiptBuffer(order)
    
    // 透過 HTTP / Raw Socket 傳送至熱感應印表機
    const response = await fetch(`http://${PRINTER_IP.value}:${PRINTER_PORT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: rawReceipt
    })
    
    console.log('✅ 出單成功！')
  } catch (err) {
    console.error('❌ 出單機連線失敗，請檢查網路與 IP:', err)
  }
}

// 實時監聽 Supabase 新訂單 (Realtime)
let orderSubscription = null

onMounted(() => {
  orderSubscription = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      const newOrder = payload.new
      console.log('🔔 收到新訂單，準備自動出單：', newOrder)
      
      // 自動觸發出單機
      sendToPrinter(newOrder)
    })
    .subscribe()
})

onUnmounted(() => {
  if (orderSubscription) supabase.removeChannel(orderSubscription)
})
// 新增品項表單預設值
const newItem = ref({
  name_zh: '',
  name_en: '',
  price: 0,
  category: 'main',
  image: '/images/combo1.jpg',
  description_zh: '',
  description_en: '',
  is_available: true,
  has_drink: false,
  has_side: false
})

// 讀取所有餐點
const fetchMenuItems = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    menuItems.value = data || []
  } catch (err) {
    alert('讀取菜單失敗：' + err.message)
  } finally {
    isLoading.value = false
  }
}

// 💡 核心功能 1：一鍵切換上下架 (is_available)
const toggleAvailability = async (item) => {
  const newStatus = !item.is_available
  
  // 先更新本地 UI，提升反應速度
  item.is_available = newStatus

  try {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: newStatus })
      .eq('id', item.id)

    if (error) {
      // 若更新失敗，倒回原狀態
      item.is_available = !newStatus
      throw error
    }
  } catch (err) {
    alert('更新上下架狀態失敗：' + err.message)
  }
}

// 💡 核心功能 2：新增餐點
const handleAddItem = async () => {
  isSubmitting.value = true
  try {
    const payload = {
      ...newItem.value,
      // 若包含飲料，可賦予預設可選陣列
      ...(newItem.value.has_drink && {
        default_drink_zh: '可樂',
        default_drink_en: 'Coke',
        drink_options_zh: ['可樂', '雪碧', '蘋果汁', '柳橙汁', '無糖綠茶'],
        drink_options_en: ['Coke', 'Sprite', 'Apple Juice', 'Orange Juice', 'Green Tea']
      }),
      // 若包含副餐，可賦予預設可選陣列
      ...(newItem.value.has_side && {
        default_side_zh: '波霸薯條',
        default_side_en: 'French Fries',
        side_options_zh: ['波霸薯條', '甜不辣'],
        side_options_en: ['French Fries', 'Tempura']
      })
    }

    const { error } = await supabase
      .from('menu_items')
      .insert([payload])

    if (error) throw error

    alert('新增餐點成功！')
    
    // 重置表單並重新整理清單
    newItem.value = {
      name_zh: '',
      name_en: '',
      price: 0,
      category: 'main',
      image: '/images/combo1.jpg',
      description_zh: '',
      description_en: '',
      is_available: true,
      has_drink: false,
      has_side: false
    }
    
    await fetchMenuItems()
  } catch (err) {
    alert('新增失敗：' + err.message)
  } finally {
    isSubmitting.value = false
  }
}

// 💡 核心功能 3：刪除餐點
const handleDeleteItem = async (id, name) => {
  if (!confirm(`確定要刪除「${name}」嗎？此操作無法復原。`)) return

  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    alert('刪除成功！')
    await fetchMenuItems()
  } catch (err) {
    alert('刪除失敗：' + err.message)
  }
}

onMounted(() => {
  fetchMenuItems()
})
</script>

<style scoped>
.admin-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.btn-refresh {
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* 卡片與表單樣式 */
.add-item-card, .menu-management {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.add-item-card h3, .menu-management h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1rem;
  color: #334155;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: bold;
  color: #475569;
}

.required {
  color: #ef4444;
}

.form-group input, .form-group select {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
}

.checkboxes {
  display: flex;
  gap: 20px;
  flex-direction: row !important;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

/* 菜單表格樣式 */
.menu-table-wrapper {
  overflow-x: auto;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.menu-table th, .menu-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.menu-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: bold;
}

.sold-out-row {
  background: #fef2f2;
}

.item-names {
  display: flex;
  flex-direction: column;
}

.sub-text {
  font-size: 0.75rem;
  color: #94a3b8;
}

.category-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.price-cell {
  font-weight: bold;
  color: #16a34a;
}

.status-text {
  margin-left: 8px;
  font-size: 0.85rem;
  font-weight: bold;
}

.text-green { color: #16a34a; }
.text-red { color: #dc2626; }

.btn-delete {
  padding: 6px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

/* Switch 開關樣式 */
.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
  vertical-align: middle;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

input:checked + .slider {
  background-color: #16a34a;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>