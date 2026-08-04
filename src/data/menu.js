// src/data/menu.js
export const categories = [
  { id: 'all', name: '全部餐點' },
  { id: 'main', name: '美式風味' },
  { id: 'Tai', name: '泰式風味' },
  { id: 'dessert', name: '精緻小品' },
  { id: 'combo', name: '嚴選套餐' },
  { id: 'drink', name: '精選飲品' }
]
export const menuItems = [
  { id: 1, name: '紐澳良雞排', price: 80,image: '/images/combo1.jpg', category: 'main' },
  { id: 2, name: '雞腿', price: 55, image: '/images/combo1.jpg',category: 'main' },
  { id: 3, name: '雞塊', price: 50,image: '/images/combo1.jpg', category: 'main' },
  { id: 4, name: '雞翅', price: 35,image: '/images/combo1.jpg', category: 'main' },
  { id: 5, name: '雞米花', price: 50, image: '/images/combo1.jpg',category: 'main' },
  { id: 6, name: '麥克雞塊(5個)', price: 45, image: '/images/combo1.jpg',category: 'main' },
  { id: 7, name: '泰式雞排', price: 85,image: '/images/combo1.jpg', category: 'Tai' },
  { id: 8, name: '泰式雞米花', price: 60,image: '/images/combo1.jpg', category: 'Tai' },
  { id: 9, name: '泰式雞翅(4支)', price: 150, image: '/images/combo1.jpg',category: 'Tai' },
  { id: 10, name: '甜不辣', price: 40,image: '/images/combo1.jpg', category: 'dessert' },
  { id: 11, name: '花枝丸(4個)', price: 45, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 12, name: '山藥捲(4個)', price: 45, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 13, name: '洋蔥圈(5個)', price: 40, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 14, name: '披薩球(4個)', price: 50, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 15, name: '芝麻芋香球(4個)', price: 45, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 16, name: '薯餅(4個)', price: 45, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 17, name: '波霸薯條', price: 40, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 18, name: '米血', price: 40, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 19, name: '百頁豆腐', price: 40,image: '/images/combo1.jpg', category: 'dessert' },
  { id: 20, name: '玉米筍', price: 40,image: '/images/combo1.jpg', category: 'dessert' },
  { id: 21, name: '蝦捲', price: 30, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 22, name: '四季豆', price: 40,image: '/images/combo1.jpg', category: 'dessert' },
  { id: 23, name: '檸檬雞柳條', price: 60, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 24, name: '柳葉魚(5條)', price: 60, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 25, name: '杏鮑菇', price: 50, image: '/images/combo1.jpg',category: 'dessert' },
  { id: 26, name: '地瓜條', price: 50,image: '/images/combo1.jpg', category: 'dessert' },
  { id: 27, name: '三角骨', price: 55,image: '/images/combo1.jpg', category: 'dessert' },
  {
    id: 101,
    name: '1號餐',
    category: 'combo', // 套餐類別
    price: 105,
    image: '/images/combo1.jpg',
    description: '雞塊+雞翅+飲料',
    hasDrink: true,
    defaultDrink: '可樂',
    drinkOptions: ['可樂', '雪碧','蘋果汁','柳橙汁', '無糖綠茶', '兩罐瓶裝水']
  },
   {
    id: 102,
    name: '2號餐',
    category: 'combo', // 套餐類別
    price: 125,
    image: '/images/combo1.jpg',
    description: '雞腿+雞塊+飲料',
    hasDrink: true,
    defaultDrink: '可樂',
    drinkOptions: ['可樂', '雪碧','蘋果汁','柳橙汁', '無糖綠茶', '兩罐瓶裝水']
  },
   {
    id: 103,
    name: '3號餐',
    category: 'combo', // 套餐類別
    price: 155,
    image: '/images/combo1.jpg',
    description: '薯條+麥克雞塊+雞米花+飲料',
    hasDrink: true,
    defaultDrink: '可樂',
    drinkOptions:['可樂', '雪碧','蘋果汁','柳橙汁', '無糖綠茶', '兩罐瓶裝水']
  },
   {
    id: 104,
    name: '4號餐',
    category: 'combo', // 套餐類別
    price: 160,
    image: '/images/combo1.jpg',
    description: '雞腿+雞塊+雞翅+飲料',
    hasDrink: true,
    defaultDrink: '可樂',
    drinkOptions: ['可樂', '雪碧','蘋果汁','柳橙汁', '無糖綠茶', '兩罐瓶裝水']
  },
   {
    id: 105,
    name: '5號餐',
    category: 'combo', // 套餐類別
    price: 140,
    image: '/images/combo1.jpg',
    description: '雞排+薯條或甜不辣(二選一)+飲料',
    hasDrink: true,
    defaultDrink: '可樂',
    drinkOptions: ['可樂', '雪碧','蘋果汁','柳橙汁', '無糖綠茶', '兩罐瓶裝水']
  },
   {
    id: 106,
    name: '分享餐',
    category: 'combo', // 套餐類別
    price: 269,
    image: '/images/combo1.jpg',
    description: '2雞腿+2雞塊+2雞翅'
  },
   {
    id: 107,
    name: '全家餐',
    category: 'combo', // 套餐類別
    price: 339,
    image: '/images/combo1.jpg',
    description: '2雞腿+3雞塊+3雞翅'
  },
   {
    id: 108,
    name: '全家特餐',
    category: 'combo', // 套餐類別
    price: 449,
    image: '/images/combo1.jpg',
    description: '全家餐+兩份薯條+1.25L飲料',
    hasDrink: true,
    defaultDrink: '可樂',
    drinkOptions: ['可樂', '雪碧']
  },
   {
    id: 109,
    name: '均衡餐',
    category: 'combo', // 套餐類別
    price: 400,
    image: '/images/combo1.jpg',
    description: '4雞腿+4雞塊'
  },
   {
    id: 110,
    name: '全腿餐',
    category: 'combo', // 套餐類別
    price: 420,
    image: '/images/combo1.jpg',
    description: '8支雞腿'
  },
   {
    id: 111,
    name: '全塊餐',
    category: 'combo', // 套餐類別
    price: 380,
    image: '/images/combo1.jpg',
    description: '8塊雞塊'
  }, 
  { id: 37, name: '可樂', price: 25,image: '/images/combo1.jpg', category: 'drink' },
  { id: 38, name: '雪碧', price: 25,image: '/images/combo1.jpg', category: 'drink' },
  { id: 39, name: '柳橙汁', price: 25,image: '/images/combo1.jpg', category: 'drink' },
  { id: 40, name: '頻果汁', price: 25,image: '/images/combo1.jpg', category: 'drink' }, 
  { id: 41, name: '原翠綠茶', price: 25,image: '/images/combo1.jpg', category: 'drink' },
  { id: 42, name: '瓶裝水', price: 10,image: '/images/combo1.jpg', category: 'drink' },
  { id: 43, name: '1.25L可樂', price: 50,image: '/images/combo1.jpg', category: 'drink' },
  { id: 44, name: '1.25L雪碧', price: 50,image: '/images/combo1.jpg', category: 'drink' },
]