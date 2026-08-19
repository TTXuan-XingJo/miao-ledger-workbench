// 数据层 - localStorage 存储，账本隔离
// 所有数据都带 bookId 字段

const STORAGE_KEY = 'miao_ledger_data_v1';
const SCHEMA_VERSION = 2; // v2 = 空白初始状态，v1 = 演示数据初始状态

// 模块定义 & 头像分配（14个模块，9个头像循环分配，相邻不重复）
const MODULES = [
  { key: 'overview', name: '概览', icon: '🏠', subtitle: '今日收支一目了然', catAvatar: 1 },
  { key: 'detail', name: '明细', icon: '📋', subtitle: '每一笔都清清楚楚', catAvatar: 2 },
  { key: 'stats', name: '统计', icon: '📊', subtitle: '看看钱都花哪了', catAvatar: 3 },
  { key: 'report', name: '报表', icon: '📈', subtitle: '月度财务体检报告', catAvatar: 4 },
  { key: 'budget', name: '预算', icon: '🎯', subtitle: '管好钱包不超支', catAvatar: 5 },
  { key: 'account', name: '账户', icon: '💳', subtitle: '资产负债一目了然', catAvatar: 6 },
  { key: 'finance', name: '理财', icon: '💰', subtitle: '今日行情早知道', catAvatar: 7 },
  { key: 'loan', name: '借贷', icon: '🤝', subtitle: '人情往来不糊涂', catAvatar: 8 },
  { key: 'goal', name: '目标', icon: '🌟', subtitle: '小目标慢慢攒', catAvatar: 9 },
  { key: 'template', name: '模板', icon: '📝', subtitle: '一键秒记常用账', catAvatar: 1 },
  { key: 'recurring', name: '周期', icon: '🔄', subtitle: '周期账目自动补记', catAvatar: 2 },
  { key: 'book', name: '账本', icon: '📒', subtitle: '多账本独立管理', catAvatar: 3 },
  { key: 'calendar', name: '日历', icon: '📅', subtitle: '按日期查看账目', catAvatar: 4 },
  { key: 'settings', name: '设置', icon: '⚙️', subtitle: '数据只在你手机里', catAvatar: 5 },
  { key: 'mortgage', name: '贷款还款', icon: '📑', subtitle: '管理贷款每期还款', catAvatar: 6 },
];

// 分类定义
const CATEGORIES = [
  { key: 'housing', name: '居住', icon: '🏠', type: 'expense', color: 'housing' },
  { key: 'shopping', name: '购物', icon: '🛍️', type: 'expense', color: 'shopping' },
  { key: 'study', name: '学习', icon: '📚', type: 'expense', color: 'study' },
  { key: 'food', name: '餐饮', icon: '🍜', type: 'expense', color: 'food' },
  { key: 'beauty', name: '美妆', icon: '💄', type: 'expense', color: 'beauty' },
  { key: 'pet', name: '宠物', icon: '🐱', type: 'expense', color: 'pet' },
  { key: 'transport', name: '交通', icon: '🚗', type: 'expense', color: 'transport' },
  { key: 'entertainment', name: '娱乐', icon: '🎮', type: 'expense', color: 'entertainment' },
  { key: 'medical', name: '医疗', icon: '💊', type: 'expense', color: 'medical' },
  { key: 'other', name: '其他', icon: '✨', type: 'expense', color: 'other' },
  { key: 'salary', name: '工资', icon: '💼', type: 'income', color: 'income' },
  { key: 'bonus', name: '奖金', icon: '🎁', type: 'income', color: 'income' },
  { key: 'invest_income', name: '理财收益', icon: '📈', type: 'income', color: 'investment' },
  { key: 'parttime', name: '兼职', icon: '💻', type: 'income', color: 'income' },
  { key: 'redpacket', name: '红包', icon: '🧧', type: 'income', color: 'income' },
];

// 生成日期字符串 YYYY-MM-DD
function dateStr(daysAgo = 0, dateObj = null) {
  const d = dateObj || new Date();
  if (daysAgo) d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 生成唯一 ID
function uid(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// 默认演示数据 - 日常账本
function genDailyBookData(bookId) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  
  const transactions = [
    // 本月收入
    { id: uid('tx'), bookId, type: 'income', category: 'salary', amount: 12000, note: '8月工资', date: dateStr(0, new Date(y, m, 5)), accountId: 'acc_card1' },
    { id: uid('tx'), bookId, type: 'income', category: 'invest_income', amount: 328.5, note: '基金分红', date: dateStr(0, new Date(y, m, 10)), accountId: 'acc_yuebao' },
    { id: uid('tx'), bookId, type: 'income', category: 'redpacket', amount: 200, note: '爸爸生日红包', date: dateStr(0, new Date(y, m, 12)), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'income', category: 'parttime', amount: 800, note: '周末插画外包', date: dateStr(0, new Date(y, m, 15)), accountId: 'acc_alipay' },
    
    // 本月支出 - 居住
    { id: uid('tx'), bookId, type: 'expense', category: 'housing', amount: 2800, note: '房租（合租次卧）', date: dateStr(0, new Date(y, m, 1)), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'housing', amount: 150, note: '电费', date: dateStr(0, new Date(y, m, 8)), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'housing', amount: 80, note: '网费', date: dateStr(0, new Date(y, m, 3)), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'housing', amount: 45.8, note: '水费燃气', date: dateStr(0, new Date(y, m, 14)), accountId: 'acc_wechat' },
    
    // 餐饮
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 32.5, note: '午餐·沙拉轻食', date: dateStr(0, new Date(y, m, now.getDate())), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 28, note: '早餐·豆浆油条', date: dateStr(1, new Date(y, m, now.getDate())), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 68, note: '和闺蜜下午茶', date: dateStr(2), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 156, note: '火锅自助', date: dateStr(4), accountId: 'acc_card1' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 25.5, note: '奶茶', date: dateStr(5), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 128, note: '日料定食', date: dateStr(7), accountId: 'acc_card1' },
    
    // 购物
    { id: uid('tx'), bookId, type: 'expense', category: 'shopping', amount: 299, note: '夏季连衣裙', date: dateStr(3), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'shopping', amount: 89.9, note: '家居拖鞋*2', date: dateStr(6), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'shopping', amount: 45, note: '文具', date: dateStr(9), accountId: 'acc_wechat' },
    
    // 学习
    { id: uid('tx'), bookId, type: 'expense', category: 'study', amount: 199, note: '设计网课月卡', date: dateStr(1, new Date(y, m, 1)), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'study', amount: 68, note: '两本专业书', date: dateStr(10), accountId: 'acc_alipay' },
    
    // 美妆
    { id: uid('tx'), bookId, type: 'expense', category: 'beauty', amount: 168, note: '面膜一盒', date: dateStr(5), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'beauty', amount: 58, note: '唇釉', date: dateStr(12), accountId: 'acc_wechat' },
    
    // 宠物
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 128, note: '猫砂两袋', date: dateStr(2, new Date(y, m, 1)), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 256, note: '猫粮10kg', date: dateStr(0, new Date(y, m, 3)), accountId: 'acc_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 68, note: '小鱼干零食', date: dateStr(8), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 200, note: '猫咪体检', date: dateStr(14), accountId: 'acc_card1' },
    
    // 交通
    { id: uid('tx'), bookId, type: 'expense', category: 'transport', amount: 100, note: '地铁卡充值', date: dateStr(0, new Date(y, m, 2)), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'expense', category: 'transport', amount: 36, note: '打车回家', date: dateStr(6), accountId: 'acc_didi' },
    
    // 娱乐
    { id: uid('tx'), bookId, type: 'expense', category: 'entertainment', amount: 88, note: '电影票两张', date: dateStr(3), accountId: 'acc_wechat' },
    { id: uid('tx'), bookId, type: 'expense', category: 'entertainment', amount: 25, note: '视频会员月卡', date: dateStr(11), accountId: 'acc_alipay' },
  ];
  
  const accounts = [
    { id: 'acc_card1', bookId, name: '工商银行', type: 'card', balance: 28560.32, icon: '💳', color: '#f075a0' },
    { id: 'acc_alipay', bookId, name: '支付宝', type: 'digital', balance: 3256.78, icon: '💙', color: '#3a9cf5' },
    { id: 'acc_wechat', bookId, name: '微信钱包', type: 'digital', balance: 892.45, icon: '💚', color: '#3bb273' },
    { id: 'acc_yuebao', bookId, name: '余额宝', type: 'fund', balance: 15680.20, icon: '💰', color: '#e8a63c' },
    { id: 'acc_cash', bookId, name: '现金', type: 'cash', balance: 300, icon: '💵', color: '#a85ad9' },
    { id: 'acc_didi', bookId, name: '滴滴出行金', type: 'other', balance: 65.5, icon: '🚗', color: '#e87a3c' },
  ];
  
  const budgets = [
    { id: uid('bg'), bookId, category: 'housing', month: dateStr(0).slice(0,7), limit: 3500 },
    { id: uid('bg'), bookId, category: 'food', month: dateStr(0).slice(0,7), limit: 1500 },
    { id: uid('bg'), bookId, category: 'shopping', month: dateStr(0).slice(0,7), limit: 800 },
    { id: uid('bg'), bookId, category: 'study', month: dateStr(0).slice(0,7), limit: 300 },
    { id: uid('bg'), bookId, category: 'beauty', month: dateStr(0).slice(0,7), limit: 300 },
    { id: uid('bg'), bookId, category: 'pet', month: dateStr(0).slice(0,7), limit: 500 },
    { id: uid('bg'), bookId, category: 'transport', month: dateStr(0).slice(0,7), limit: 200 },
    { id: uid('bg'), bookId, category: 'entertainment', month: dateStr(0).slice(0,7), limit: 200 },
  ];
  
  const goals = [
    { id: uid('gl'), bookId, name: '新手机', icon: '📱', target: 6999, saved: 4200, deadline: dateStr(60) },
    { id: uid('gl'), bookId, name: '日本旅行', icon: '✈️', target: 15000, saved: 8500, deadline: dateStr(180) },
    { id: uid('gl'), bookId, name: '猫咪医疗金', icon: '🐱', target: 5000, saved: 3200, deadline: dateStr(365) },
  ];
  
  const loans = [
    { id: uid('ln'), bookId, type: 'lend', person: '小王', amount: 500, note: '上次吃饭他忘带钱包', date: dateStr(8), status: 'pending' },
    { id: uid('ln'), bookId, type: 'lend', person: '小美', amount: 2000, note: '她买手机差一点', date: dateStr(20), status: 'pending' },
    { id: uid('ln'), bookId, type: 'borrow', person: '妈妈', amount: 3000, note: '交房租不够', date: dateStr(15), status: 'pending' },
    { id: uid('ln'), bookId, type: 'lend', person: '阿杰', amount: 300, note: '充话费', date: dateStr(30), status: 'returned' },
  ];
  
  const templates = [
    { id: uid('tp'), bookId, name: '早餐', type: 'expense', category: 'food', amount: 12, icon: '🍞' },
    { id: uid('tp'), bookId, name: '午餐', type: 'expense', category: 'food', amount: 28, icon: '🍱' },
    { id: uid('tp'), bookId, name: '地铁', type: 'expense', category: 'transport', amount: 6, icon: '🚇' },
    { id: uid('tp'), bookId, name: '奶茶', type: 'expense', category: 'food', amount: 22, icon: '🧋' },
    { id: uid('tp'), bookId, name: '买菜', type: 'expense', category: 'food', amount: 50, icon: '🥬' },
    { id: uid('tp'), bookId, name: '工资', type: 'income', category: 'salary', amount: 12000, icon: '💼' },
    { id: uid('tp'), bookId, name: '房租', type: 'expense', category: 'housing', amount: 2800, icon: '🏠' },
    { id: uid('tp'), bookId, name: '猫砂', type: 'expense', category: 'pet', amount: 68, icon: '🐱' },
  ];
  
  const recurring = [
    { id: uid('rc'), bookId, name: '工资入账', type: 'income', category: 'salary', amount: 12000, cycle: 'monthly', day: 5, lastDone: dateStr(0, new Date(y, m, 5)), nextDate: dateStr(0, new Date(y, m + 1, 5)) },
    { id: uid('rc'), bookId, name: '房租', type: 'expense', category: 'housing', amount: 2800, cycle: 'monthly', day: 1, lastDone: dateStr(0, new Date(y, m, 1)), nextDate: dateStr(0, new Date(y, m + 1, 1)) },
    { id: uid('rc'), bookId, name: '视频会员', type: 'expense', category: 'entertainment', amount: 25, cycle: 'monthly', day: 15, lastDone: dateStr(0, new Date(y, m - 1, 15)), nextDate: dateStr(0, new Date(y, m, 15)), needRecord: true },
    { id: uid('rc'), bookId, name: '地铁充值', type: 'expense', category: 'transport', amount: 100, cycle: 'monthly', day: 1, lastDone: dateStr(0, new Date(y, m, 2)), nextDate: dateStr(0, new Date(y, m + 1, 1)) },
    { id: uid('rc'), bookId, name: '设计网课', type: 'expense', category: 'study', amount: 199, cycle: 'monthly', day: 1, lastDone: dateStr(0, new Date(y, m, 1)), nextDate: dateStr(0, new Date(y, m + 1, 1)) },
  ];
  
  return { transactions, accounts, budgets, goals, loans, templates, recurring, mortgageLoans: [] };
}

// 旅行账本演示数据
function genTravelBookData(bookId) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  
  const transactions = [
    { id: uid('tx'), bookId, type: 'expense', category: 'transport', amount: 1580, note: '机票·北京-东京', date: dateStr(0, new Date(y, m, now.getDate())), accountId: 't_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'housing', amount: 890, note: '民宿3晚', date: dateStr(1, new Date(y, m, now.getDate())), accountId: 't_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 268, note: '寿司大餐', date: dateStr(2), accountId: 't_cash' },
    { id: uid('tx'), bookId, type: 'expense', category: 'shopping', amount: 1280, note: '药妆店扫货', date: dateStr(3), accountId: 't_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'entertainment', amount: 450, note: '迪士尼门票', date: dateStr(4), accountId: 't_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'food', amount: 88, note: '拉面', date: dateStr(4), accountId: 't_cash' },
    { id: uid('tx'), bookId, type: 'expense', category: 'transport', amount: 210, note: 'JR PASS 一日券', date: dateStr(1), accountId: 't_cash' },
    { id: uid('tx'), bookId, type: 'income', category: 'redpacket', amount: 5000, note: '旅行基金', date: dateStr(10), accountId: 't_card' },
  ];
  
  const accounts = [
    { id: 't_card', bookId, name: '旅行信用卡', type: 'card', balance: 15680, icon: '💳', color: '#f075a0' },
    { id: 't_cash', bookId, name: '日元现金', type: 'cash', balance: 3200, icon: '💴', color: '#e8a63c' },
  ];
  
  const budgets = [
    { id: uid('bg'), bookId, category: 'transport', month: dateStr(0).slice(0,7), limit: 2500 },
    { id: uid('bg'), bookId, category: 'housing', month: dateStr(0).slice(0,7), limit: 2000 },
    { id: uid('bg'), bookId, category: 'food', month: dateStr(0).slice(0,7), limit: 1500 },
    { id: uid('bg'), bookId, category: 'shopping', month: dateStr(0).slice(0,7), limit: 2000 },
    { id: uid('bg'), bookId, category: 'entertainment', month: dateStr(0).slice(0,7), limit: 800 },
  ];
  
  const goals = [
    { id: uid('gl'), bookId, name: '北海道滑雪', icon: '⛷️', target: 20000, saved: 6800, deadline: dateStr(120) },
  ];
  
  const loans = [
    { id: uid('ln'), bookId, type: 'lend', person: '旅行搭子', amount: 600, note: '她先垫的门票', date: dateStr(2), status: 'pending' },
  ];
  
  const templates = [
    { id: uid('tp'), bookId, name: '餐饮', type: 'expense', category: 'food', amount: 100, icon: '🍱' },
    { id: uid('tp'), bookId, name: '交通', type: 'expense', category: 'transport', amount: 50, icon: '🚃' },
    { id: uid('tp'), bookId, name: '门票', type: 'expense', category: 'entertainment', amount: 200, icon: '🎫' },
    { id: uid('tp'), bookId, name: '纪念品', type: 'expense', category: 'shopping', amount: 150, icon: '🎁' },
  ];
  
  const recurring = [];
  
  return { transactions, accounts, budgets, goals, loans, templates, recurring, mortgageLoans: [] };
}

// 宠物账本演示数据
function genPetBookData(bookId) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  
  const transactions = [
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 256, note: '猫粮10kg', date: dateStr(0, new Date(y, m, 3)), accountId: 'p_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 128, note: '猫砂两袋', date: dateStr(0, new Date(y, m, 1)), accountId: 'p_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 68, note: '小鱼干零食', date: dateStr(5), accountId: 'p_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'pet', amount: 200, note: '年度体检', date: dateStr(10), accountId: 'p_card' },
    { id: uid('tx'), bookId, type: 'expense', category: 'medical', amount: 380, note: '驱虫药', date: dateStr(2), accountId: 'p_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'shopping', amount: 158, note: '猫抓板', date: dateStr(7), accountId: 'p_alipay' },
    { id: uid('tx'), bookId, type: 'expense', category: 'other', amount: 120, note: '宠物保险月付', date: dateStr(0, new Date(y, m, 1)), accountId: 'p_card' },
    { id: uid('tx'), bookId, type: 'income', category: 'redpacket', amount: 88, note: '妈妈给咪咪的红包', date: dateStr(12), accountId: 'p_alipay' },
  ];
  
  const accounts = [
    { id: 'p_card', bookId, name: '宠物专用卡', type: 'card', balance: 2156, icon: '💳', color: '#3bb273' },
    { id: 'p_alipay', bookId, name: '宠物零花钱', type: 'digital', balance: 328.5, icon: '💰', color: '#e8a63c' },
  ];
  
  const budgets = [
    { id: uid('bg'), bookId, category: 'pet', month: dateStr(0).slice(0,7), limit: 800 },
    { id: uid('bg'), bookId, category: 'medical', month: dateStr(0).slice(0,7), limit: 400 },
    { id: uid('bg'), bookId, category: 'shopping', month: dateStr(0).slice(0,7), limit: 200 },
  ];
  
  const goals = [
    { id: uid('gl'), bookId, name: '咪咪医疗储备金', icon: '💉', target: 10000, saved: 4500, deadline: dateStr(365) },
    { id: uid('gl'), bookId, name: '自动喂食器', icon: '🍽️', target: 599, saved: 599, deadline: dateStr(0) },
  ];
  
  const loans = [];
  
  const templates = [
    { id: uid('tp'), bookId, name: '猫粮', type: 'expense', category: 'pet', amount: 128, icon: '🍗' },
    { id: uid('tp'), bookId, name: '猫砂', type: 'expense', category: 'pet', amount: 64, icon: '🐱' },
    { id: uid('tp'), bookId, name: '零食', type: 'expense', category: 'pet', amount: 30, icon: '🐟' },
  ];
  
  const recurring = [
    { id: uid('rc'), bookId, name: '宠物保险', type: 'expense', category: 'other', amount: 120, cycle: 'monthly', day: 1, lastDone: dateStr(0, new Date(y, m, 1)), nextDate: dateStr(0, new Date(y, m + 1, 1)) },
  ];
  
  return { transactions, accounts, budgets, goals, loans, templates, recurring, mortgageLoans: [] };
}

// 数据存储与管理
const DataStore = {
  data: null,
  
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        // 版本号不匹配时，重置为空白状态
        if (!this.data.__schemaVersion || this.data.__schemaVersion < SCHEMA_VERSION) {
          this.resetToBlank();
        }
      } else {
        this.data = this.initBlankData();
        this.save();
      }
    } catch (e) {
      console.error('load data error', e);
      this.data = this.initBlankData();
      this.save();
    }
    return this.data;
  },
  
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('save error', e);
    }
  },
  
  initDefaultData() {
    const daily = genDailyBookData('book_daily');
    const travel = genTravelBookData('book_travel');
    const pet = genPetBookData('book_pet');
    
    return {
      books: [
        { id: 'book_daily', name: '日常账本', icon: '🏠', color: '#ff8fb3' },
        { id: 'book_travel', name: '旅行账本', icon: '✈️', color: '#7bc8f0' },
        { id: 'book_pet', name: '宠物账本', icon: '🐱', color: '#8fd9b3' },
      ],
      currentBookId: 'book_daily',
      currentBgIndex: 0,
      transactions: [...daily.transactions, ...travel.transactions, ...pet.transactions],
      accounts: [...daily.accounts, ...travel.accounts, ...pet.accounts],
      budgets: [...daily.budgets, ...travel.budgets, ...pet.budgets],
      goals: [...daily.goals, ...travel.goals, ...pet.goals],
      loans: [...daily.loans, ...travel.loans, ...pet.loans],
      templates: [...daily.templates, ...travel.templates, ...pet.templates],
      recurring: [...daily.recurring, ...travel.recurring, ...pet.recurring],
      mortgageLoans: [...daily.mortgageLoans, ...travel.mortgageLoans, ...pet.mortgageLoans],
    };
  },

  // 重置为纯空白状态：仅一个默认账本，无任何业务数据
  initBlankData() {
    return {
      __schemaVersion: SCHEMA_VERSION,
      books: [
        { id: 'book_default', name: '默认账本', icon: '📒', color: '#ff8fb3' },
      ],
      currentBookId: 'book_default',
      currentBgIndex: 0,
      transactions: [],
      accounts: [],
      budgets: [],
      goals: [],
      loans: [],
      templates: [],
      recurring: [],
      mortgageLoans: [],
    };
  },

  // 清空所有数据并重置为空白状态
  resetToBlank() {
    this.data = this.initBlankData();
    this.save();
  },
  
  // 账本相关
  getBooks() { return this.data.books; },
  getCurrentBook() {
    return this.data.books.find(b => b.id === this.data.currentBookId);
  },
  switchBook(bookId) {
    this.data.currentBookId = bookId;
    this.save();
  },
  addBook(name, icon = '📒', color = '#ff8fb3') {
    const book = { id: uid('book'), name, icon, color };
    this.data.books.push(book);
    this.save();
    return book;
  },
  
  // 按当前账本过滤
  getTransactions() {
    return this.data.transactions.filter(t => t.bookId === this.data.currentBookId);
  },
  getAccounts() {
    return this.data.accounts.filter(a => a.bookId === this.data.currentBookId);
  },
  getBudgets() {
    return this.data.budgets.filter(b => b.bookId === this.data.currentBookId);
  },
  getGoals() {
    return this.data.goals.filter(g => g.bookId === this.data.currentBookId);
  },
  getLoans() {
    return this.data.loans.filter(l => l.bookId === this.data.currentBookId);
  },
  getTemplates() {
    return this.data.templates.filter(t => t.bookId === this.data.currentBookId);
  },
  getRecurring() {
    return this.data.recurring.filter(r => r.bookId === this.data.currentBookId);
  },
  
  // ===== 交易 =====
  addTransaction(tx) {
    const item = { id: uid('tx'), bookId: this.data.currentBookId, ...tx };
    this.data.transactions.unshift(item);
    this.save();
    return item;
  },
  
  updateTransaction(id, updates) {
    const item = this.data.transactions.find(t => t.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    this.save();
  },
  
  // ===== 账户 =====
  addAccount(acc) {
    const item = { id: uid('acc'), bookId: this.data.currentBookId, ...acc };
    this.data.accounts.push(item);
    this.save();
    return item;
  },
  
  updateAccount(id, updates) {
    const item = this.data.accounts.find(a => a.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  deleteAccount(id) {
    this.data.accounts = this.data.accounts.filter(a => a.id !== id);
    this.save();
  },
  
  // ===== 预算 =====
  setBudget(category, month, limit) {
    let item = this.data.budgets.find(b => b.bookId === this.data.currentBookId && b.category === category && b.month === month);
    if (item) {
      item.limit = limit;
    } else {
      item = { id: uid('bg'), bookId: this.data.currentBookId, category, month, limit };
      this.data.budgets.push(item);
    }
    this.save();
    return item;
  },
  
  deleteBudget(id) {
    this.data.budgets = this.data.budgets.filter(b => b.id !== id);
    this.save();
  },
  
  // ===== 目标 =====
  addGoal(goal) {
    const item = { id: uid('gl'), bookId: this.data.currentBookId, saved: 0, ...goal };
    this.data.goals.push(item);
    this.save();
    return item;
  },
  
  updateGoal(id, updates) {
    const item = this.data.goals.find(g => g.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  addToGoal(id, amount) {
    const item = this.data.goals.find(g => g.id === id);
    if (item) {
      item.saved = Math.min(item.target, item.saved + amount);
      this.save();
    }
    return item;
  },
  
  deleteGoal(id) {
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    this.save();
  },
  
  // ===== 借贷 =====
  addLoan(loan) {
    const item = { id: uid('ln'), bookId: this.data.currentBookId, status: 'pending', ...loan };
    this.data.loans.push(item);
    this.save();
    return item;
  },
  
  updateLoan(id, updates) {
    const item = this.data.loans.find(l => l.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  toggleLoan(id) {
    const item = this.data.loans.find(l => l.id === id);
    if (item) {
      item.status = item.status === 'pending' ? 'returned' : 'pending';
      this.save();
    }
  },
  
  deleteLoan(id) {
    this.data.loans = this.data.loans.filter(l => l.id !== id);
    this.save();
  },
  
  // ===== 模板 =====
  addTemplate(tpl) {
    const item = { id: uid('tp'), bookId: this.data.currentBookId, ...tpl };
    this.data.templates.push(item);
    this.save();
    return item;
  },
  
  updateTemplate(id, updates) {
    const item = this.data.templates.find(t => t.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  deleteTemplate(id) {
    this.data.templates = this.data.templates.filter(t => t.id !== id);
    this.save();
  },
  
  // ===== 周期账 =====
  addRecurring(r) {
    const item = { id: uid('rc'), bookId: this.data.currentBookId, ...r };
    this.data.recurring.push(item);
    this.save();
    return item;
  },
  
  updateRecurring(id, updates) {
    const item = this.data.recurring.find(r => r.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  deleteRecurring(id) {
    this.data.recurring = this.data.recurring.filter(r => r.id !== id);
    this.save();
  },
  
  // ===== 贷款还款管理 =====
  getMortgageLoans() {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    return this.data.mortgageLoans.filter(l => l.bookId === this.data.currentBookId);
  },
  
  addMortgageLoan(loan) {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    const item = {
      id: uid('mtg'),
      bookId: this.data.currentBookId,
      name: loan.name || '未命名贷款',
      principal: Number(loan.principal) || 0,
      annualRate: Number(loan.annualRate) || 0,
      repaymentMethod: loan.repaymentMethod || 'equal',
      startDate: loan.startDate || dateStr(0),
      totalMonths: Number(loan.totalMonths) || 12,
      monthlyPayDay: Number(loan.monthlyPayDay) || 15,
      monthlyPayment: Number(loan.monthlyPayment) || 0,
      bankNote: loan.bankNote || '',
      remainingPrincipal: Number(loan.principal) || 0,
      paidPrincipal: 0,
      paidInterest: 0,
      settled: false,
      records: [],
      createdAt: Date.now(),
    };
    this.data.mortgageLoans.push(item);
    this.save();
    return item;
  },
  
  updateMortgageLoan(id, updates) {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    const item = this.data.mortgageLoans.find(l => l.id === id);
    if (item) {
      // 如果改了本金，同步调整剩余本金（仅当没有还款记录时）
      if (updates.principal !== undefined && item.records.length === 0) {
        updates.remainingPrincipal = Number(updates.principal) || 0;
      }
      Object.assign(item, updates);
      // 数值字段保证为数字
      ['principal', 'annualRate', 'totalMonths', 'monthlyPayDay', 'monthlyPayment', 'remainingPrincipal', 'paidPrincipal', 'paidInterest'].forEach(k => {
        if (item[k] !== undefined) item[k] = Number(item[k]) || 0;
      });
      this.save();
    }
    return item;
  },
  
  deleteMortgageLoan(id) {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    this.data.mortgageLoans = this.data.mortgageLoans.filter(l => l.id !== id);
    this.save();
  },
  
  // 记录一次还款
  addMortgageRecord(loanId, record) {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    const loan = this.data.mortgageLoans.find(l => l.id === loanId);
    if (!loan) return null;
    const rec = {
      id: uid('mtgr'),
      date: record.date || dateStr(0),
      totalAmount: Number(record.totalAmount) || 0,
      principal: Number(record.principal) || 0,
      interest: Number(record.interest) || 0,
    };
    loan.records.push(rec);
    loan.paidPrincipal = (Number(loan.paidPrincipal) || 0) + rec.principal;
    loan.paidInterest = (Number(loan.paidInterest) || 0) + rec.interest;
    loan.remainingPrincipal = Math.max(0, (Number(loan.remainingPrincipal) || 0) - rec.principal);
    if (loan.remainingPrincipal <= 0) {
      loan.settled = true;
    }
    this.save();
    return rec;
  },
  
  updateMortgageRecord(loanId, recordId, updates) {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    const loan = this.data.mortgageLoans.find(l => l.id === loanId);
    if (!loan) return null;
    const rec = loan.records.find(r => r.id === recordId);
    if (!rec) return null;
    // 先扣掉旧的影响
    loan.paidPrincipal = (Number(loan.paidPrincipal) || 0) - rec.principal;
    loan.paidInterest = (Number(loan.paidInterest) || 0) - rec.interest;
    loan.remainingPrincipal = (Number(loan.remainingPrincipal) || 0) + rec.principal;
    // 应用更新
    Object.assign(rec, updates);
    ['totalAmount', 'principal', 'interest'].forEach(k => {
      if (rec[k] !== undefined) rec[k] = Number(rec[k]) || 0;
    });
    // 再加回新值
    loan.paidPrincipal = (Number(loan.paidPrincipal) || 0) + rec.principal;
    loan.paidInterest = (Number(loan.paidInterest) || 0) + rec.interest;
    loan.remainingPrincipal = Math.max(0, (Number(loan.remainingPrincipal) || 0) - rec.principal);
    loan.settled = loan.remainingPrincipal <= 0 && loan.records.length > 0;
    this.save();
    return rec;
  },
  
  deleteMortgageRecord(loanId, recordId) {
    if (!this.data.mortgageLoans) this.data.mortgageLoans = [];
    const loan = this.data.mortgageLoans.find(l => l.id === loanId);
    if (!loan) return false;
    const rec = loan.records.find(r => r.id === recordId);
    if (!rec) return false;
    loan.paidPrincipal = (Number(loan.paidPrincipal) || 0) - rec.principal;
    loan.paidInterest = (Number(loan.paidInterest) || 0) - rec.interest;
    loan.remainingPrincipal = (Number(loan.remainingPrincipal) || 0) + rec.principal;
    loan.records = loan.records.filter(r => r.id !== recordId);
    loan.settled = loan.remainingPrincipal <= 0 && loan.records.length > 0;
    this.save();
    return true;
  },
  
  // 背景图切换
  getBgIndex() { return this.data.currentBgIndex || 0; },
  nextBg(total) {
    this.data.currentBgIndex = ((this.data.currentBgIndex || 0) + 1) % total;
    this.save();
    return this.data.currentBgIndex;
  },
  
  // ===== 账本 =====
  updateBook(id, updates) {
    const item = this.data.books.find(b => b.id === id);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },
  
  deleteBook(id) {
    // 不能删除当前账本
    if (this.data.currentBookId === id) return false;
    this.data.books = this.data.books.filter(b => b.id !== id);
    // 同时清理该账本的所有数据
    this.data.transactions = this.data.transactions.filter(t => t.bookId !== id);
    this.data.accounts = this.data.accounts.filter(a => a.bookId !== id);
    this.data.budgets = this.data.budgets.filter(b => b.bookId !== id);
    this.data.goals = this.data.goals.filter(g => g.bookId !== id);
    this.data.loans = this.data.loans.filter(l => l.bookId !== id);
    this.data.templates = this.data.templates.filter(t => t.bookId !== id);
    this.data.recurring = this.data.recurring.filter(r => r.bookId !== id);
    this.data.mortgageLoans = (this.data.mortgageLoans || []).filter(l => l.bookId !== id);
    this.save();
    return true;
  },
  
  // 工具方法：计算本月收支
  getMonthSummary(monthStr = null) {
    const txs = this.getTransactions();
    const now = new Date();
    const y = now.getFullYear();
    const m = monthStr ? monthStr.slice(5, 7) - 1 : now.getMonth();
    const targetMonth = monthStr ? monthStr.slice(0, 7) : dateStr(0).slice(0, 7);
    
    const monthTxs = txs.filter(t => t.date.slice(0, 7) === targetMonth);
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const savingRate = income > 0 ? (balance / income) * 100 : 0;
    
    return { income, expense, balance, savingRate, count: monthTxs.length };
  },
  
  // 各分类支出
  getExpenseByCategory(monthStr = null) {
    const txs = this.getTransactions();
    const targetMonth = monthStr || dateStr(0).slice(0, 7);
    const result = {};
    txs.filter(t => t.type === 'expense' && t.date.slice(0, 7) === targetMonth).forEach(t => {
      result[t.category] = (result[t.category] || 0) + t.amount;
    });
    return result;
  },
  
  // 总资产
  getTotalAssets() {
    return this.getAccounts().reduce((s, a) => s + a.balance, 0);
  },
};

// 立即加载数据，确保 React 渲染时数据已就绪
DataStore.load();

// 暴露到 window
Object.assign(window, { DataStore, MODULES, CATEGORIES, dateStr, uid });
