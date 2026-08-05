// src/utils/printer.js

// ESC/POS 控制指令 (Hex)
const ESC = '\x1B'
const GS = '\x1D'

export const commands = {
  INIT: ESC + '@',                  // 初始化印表機
  ALIGN_LEFT: ESC + 'a0',           // 靠左
  ALIGN_CENTER: ESC + 'a1',         // 居中
  ALIGN_RIGHT: ESC + 'a2',          // 靠右
  TXT_BOLD_ON: ESC + 'E1',          // 加粗
  TXT_BOLD_OFF: ESC + 'E0',         // 取消加粗
  TXT_DOUBLE_HEIGHT: ESC + '!16',   // 字體倍高
  TXT_DOUBLE_WIDTH: ESC + '!32',    // 字體倍寬
  TXT_LARGE: ESC + '!48',           // 巨型字體 (品名/單號用)
  TXT_NORMAL: ESC + '!0',           // 標準字體
  CUT_PAPER: GS + 'V1',             // 切刀切紙
  BEEP: ESC + 'B\x03\x02'           // 逼逼叫聲 (蜂鳴 3 次)
}

// 將訂單資料轉為小票字串
export function generateReceiptBuffer(order) {
  let receipt = ''
  
  receipt += commands.INIT
  receipt += commands.ALIGN_CENTER
  receipt += commands.TXT_DOUBLE_HEIGHT + commands.TXT_BOLD_ON
  receipt += "俏王妃點餐小票\n"
  receipt += commands.TXT_NORMAL + commands.TXT_BOLD_OFF
  receipt += "--------------------------------\n"
  
  receipt += commands.ALIGN_LEFT
  receipt += `單號: #${order.id.toString().slice(-4)}\n`
  receipt += `時間: ${new Date().toLocaleTimeString('zh-TW')}\n`
  receipt += `類型: ${order.diningType || '外帶'}\n`
  receipt += "--------------------------------\n"
  
  // 餐點明細
  order.items.forEach(item => {
    receipt += commands.TXT_BOLD_ON + `${item.name} x ${item.quantity}\n` + commands.TXT_BOLD_OFF
    
    // 客製化備註 (例如：去冰/半糖/加辣)
    if (item.customizations && item.customizations.length) {
      receipt += `  └ ${item.customizations.join(', ')}\n`
    }
  })
  
  receipt += "--------------------------------\n"
  receipt += commands.ALIGN_RIGHT
  receipt += commands.TXT_DOUBLE_HEIGHT
  receipt += `總金額: $${order.totalPrice}\n`
  receipt += commands.TXT_NORMAL
  receipt += "--------------------------------\n\n\n"
  
  // 切紙與響鈴
  receipt += commands.BEEP
  receipt += commands.CUT_PAPER
  
  return receipt
}