// 模块 1-7：概览、明细、统计、报表、预算、账户、理财（含增删改功能）

// 背景图 URL（生成的 5 张）
const BG_IMAGES = [
  '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwnmbdkco_ve_miaoda',
  '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwly5r6aq_ve_miaoda',
  '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwlq326fq_ve_miaoda',
  '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwlbd5cbi_ve_miaoda',
  '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwnby44co_ve_miaoda',
];

// 理财模块 - 6张封面图
const FINANCE_COVERS = [
  { key: 'gold', name: '今日金价', category: '贵金属', url: 'https://gold.eastmoney.com/',
    cover: '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwnf25scq_ve_miaoda',
    desc: '实时行情 涨跌幅', accent: '#d4a543' },
  { key: 'silver', name: '今日银价', category: '贵金属', url: 'https://gold.eastmoney.com/',
    cover: '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwkfgaaoq_ve_miaoda',
    desc: '白银T+D 走势分析', accent: '#6b9dc8' },
  { key: 'fund', name: '基金排行', category: '基金', url: 'https://www.fund123.cn/',
    cover: '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwl3t2qfg_ve_miaoda',
    desc: '热门基金 收益排行', accent: '#3bb273' },
  { key: 'stock', name: '股票行情', category: '股票', url: 'https://quote.eastmoney.com/center/',
    cover: '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwki3ekco_ve_miaoda',
    desc: '沪深A股 实时行情', accent: '#c94545' },
  { key: 'forex', name: '外汇牌价', category: '外汇', url: 'https://www.boc.cn/sourcedb/whpj/',
    cover: '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwm5ht2gg_ve_miaoda',
    desc: '中国银行 实时汇率', accent: '#9b59d6' },
  { key: 'finpick', name: '理财精选', category: '理财工具', url: 'https://www.fund123.cn/',
    cover: '/spark/app/app_17cefrjc5e9/runtime/api/v1/storage/object/bucket_aadkqwr5uhsno_static/static%2Faadkqwocc5kei_ve_miaoda',
    desc: '优选理财 稳健收益', accent: '#ff8fb3' },
];

// ===== 1. 概览模块 =====
function OverviewModule({ refresh, onNavigate, onBookClick }) {
  const summary = DataStore.getMonthSummary();
  const totalAssets = DataStore.getTotalAssets();
  const accounts = DataStore.getAccounts();
  const txs = DataStore.getTransactions().slice(0, 5);
  const book = DataStore.getCurrentBook();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 总资产卡片 */}
      <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(255,143,179,0.85), rgba(255,214,231,0.9))', color: '#fff' }}>
        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>总资产（{book.icon} {book.name}）</div>
        <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>¥ {formatMoney(totalAssets)}</div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>本月收入</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>¥ {formatMoney(summary.income)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>本月支出</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>¥ {formatMoney(summary.expense)}</div>
          </div>
        </div>
      </div>
      
      {/* 快捷操作 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}>✨ 快捷记账</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {CATEGORIES.filter(c => c.type === 'expense').slice(0, 8).map(cat => (
            <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={() => onNavigate('detail')}>
              <div className={`icon-circle cat-${cat.color}`}>{cat.icon}</div>
              <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 账户预览 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>💳 账户概览</div>
          <span style={{ fontSize: '12px', color: 'var(--pink-500)', cursor: 'pointer' }} onClick={() => onNavigate('account')}>全部 ›</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {accounts.slice(0, 3).map(acc => (
            <div key={acc.id} className="row-between">
              <div className="row" style={{ gap: '10px' }}>
                <div className="icon-circle" style={{ background: acc.color + '20', color: acc.color, width: '36px', height: '36px', fontSize: '16px' }}>
                  {acc.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{acc.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-mute)' }}>余额</div>
                </div>
              </div>
              <div className="amount amount-primary" style={{ fontSize: '15px' }}>¥ {formatMoney(acc.balance)}</div>
            </div>
          ))}
        </div>
      </div>
      
       {/* 最近交易 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>📋 最近记录</div>
          <span style={{ fontSize: '12px', color: 'var(--pink-500)', cursor: 'pointer' }} onClick={() => onNavigate('detail')}>全部 ›</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {txs.map(tx => (
            <div key={tx.id} className="tx-item">
              <CategoryIcon category={tx.category} size={40} />
              <div className="tx-info">
                <div className="tx-cat-name">{CATEGORIES.find(c => c.key === tx.category)?.name || tx.category}</div>
                <div className="tx-note">{tx.date} · {tx.note || '无备注'}</div>
              </div>
              <div className={`tx-amount ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                {tx.type === 'income' ? '+' : '-'}¥{formatMoney(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 贷款还款管理入口 */}
      <div 
        className="card" 
        style={{ 
          padding: '16px', 
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(255,214,231,0.6), rgba(255,236,243,0.8))',
        }}
        onClick={() => onNavigate('mortgage')}
      >
        <div className="row-between">
          <div className="row" style={{ gap: '12px', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'rgba(255,143,179,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>📑</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>贷款还款管理</div>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px' }}>
                管理贷款、记录每期还款、可同步生成支出
              </div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--pink-500)' }}>›</span>
        </div>
      </div>
    </div>
  );
}

// ===== 2. 明细模块（含增删改）=====
function DetailModule({ refresh }) {
  const [filter, setFilter] = React.useState('all');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null); // null=新增, 对象=编辑
  const [form, setForm] = React.useState({
    type: 'expense', category: 'food', amount: 0, note: '', date: dateStr(0), accountId: '',
  });
  
  const allTxs = DataStore.getTransactions();
  const filtered = filter === 'all' ? allTxs : allTxs.filter(t => t.type === filter);
  
  // 按日期分组
  const groups = {};
  filtered.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  const dates = Object.keys(groups).sort().reverse();
  
  const openAdd = () => {
    const accounts = DataStore.getAccounts();
    setEditing(null);
    setForm({
      type: 'expense', category: 'food', amount: 0, note: '', date: dateStr(0),
      accountId: accounts[0]?.id || '',
    });
    setModalOpen(true);
  };
  
  const openEdit = (tx) => {
    setEditing(tx);
    setForm({ ...tx });
    setModalOpen(true);
  };
  
  const handleSubmit = () => {
    if (!form.amount || form.amount <= 0) {
      showToast('请输入金额');
      return;
    }
    if (editing) {
      DataStore.updateTransaction(editing.id, form);
      showToast('修改成功');
    } else {
      DataStore.addTransaction(form);
      showToast('添加成功');
    }
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (tx) => {
    showConfirm({
      title: '删除记录',
      message: `确定删除「${tx.note || '无备注'}」¥${formatMoney(tx.amount)} 吗？`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteTransaction(tx.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 筛选标签 */}
      <div className="card" style={{ padding: '6px', display: 'flex', gap: '4px' }}>
        {[
          { key: 'all', label: '全部' },
          { key: 'expense', label: '支出' },
          { key: 'income', label: '收入' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '14px',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: filter === f.key ? 'var(--pink-500)' : 'transparent',
              color: filter === f.key ? '#fff' : 'var(--text-sub)',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >{f.label}</button>
        ))}
      </div>
      
      {/* 交易列表 */}
      {dates.length === 0 ? (
        <div className="card empty">
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
          还没有记录，点击右下角 + 记一笔吧～
        </div>
      ) : dates.map(date => {
        const dayTxs = groups[date];
        const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return (
          <div key={date} className="card" style={{ padding: '12px 16px' }}>
            <div className="row-between" style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed rgba(255,143,179,0.2)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{date}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
                收 ¥{formatMoney(dayIncome)} · 支 ¥{formatMoney(dayExpense)}
              </div>
            </div>
            {dayTxs.map(tx => (
              <div
                key={tx.id}
                className="tx-item"
                onClick={() => openEdit(tx)}
                style={{ cursor: 'pointer' }}
              >
                <CategoryIcon category={tx.category} size={40} />
                <div className="tx-info">
                  <div className="tx-cat-name">{CATEGORIES.find(c => c.key === tx.category)?.name || tx.category}</div>
                  <div className="tx-note">{tx.note || '无备注'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className={`tx-amount ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}¥{formatMoney(tx.amount)}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(tx); }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-mute)', fontSize: '14px',
                      cursor: 'pointer', padding: '4px 6px',
                    }}
                    title="删除"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      
      {/* 浮动添加按钮 */}
      <FabButton onClick={openAdd} />
      
      {/* 编辑/新增弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '编辑记录' : '新增记录'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存修改' : '添加'}
      >
        <FormField label="类型">
          <TypeToggle value={form.type} onChange={v => setForm({ ...form, type: v, category: CATEGORIES.find(c => c.type === v)?.key })} />
        </FormField>
        <FormField label="分类">
          <CategoryPicker value={form.category} onChange={v => setForm({ ...form, category: v })} type={form.type} />
        </FormField>
        <FormField label="金额">
          <NumberInput value={form.amount} onChange={v => setForm({ ...form, amount: v })} prefix="¥" />
        </FormField>
        <FormField label="日期">
          <TextInput type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} />
        </FormField>
        <FormField label="备注">
          <TextInput value={form.note} onChange={v => setForm({ ...form, note: v })} placeholder="备注（选填）" />
        </FormField>
      </FormModal>
    </div>
  );
}

// ===== 3. 统计模块（支出构成：柱状图 + 6分类卡片）=====
function StatsModule({ refresh, version }) {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);
  const expenseByCat = DataStore.getExpenseByCategory();
  const summary = DataStore.getMonthSummary();
  
  const mainCats = ['housing', 'shopping', 'study', 'food', 'beauty', 'pet'];
  
  const catData = mainCats.map(key => {
    const cat = CATEGORIES.find(c => c.key === key);
    const amount = expenseByCat[key] || 0;
    const percent = summary.expense > 0 ? (amount / summary.expense) * 100 : 0;
    return { key, name: cat.name, icon: cat.icon, amount, percent };
  });
  
  const catColors = {
    housing: '#e87a3c', shopping: '#f075a0', study: '#5a82d9',
    food: '#e8a63c', beauty: '#a85ad9', pet: '#3bb273',
  };
  
  React.useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current);
    
    const option = {
      grid: { top: 20, bottom: 30, left: 10, right: 10, containLabel: true },
      xAxis: {
        type: 'category',
        data: catData.map(d => d.name),
        axisLine: { lineStyle: { color: '#ffd6e7' } },
        axisTick: { show: false },
        axisLabel: { color: '#8a6b78', fontSize: 11, fontFamily: 'Nunito, sans-serif' },
      },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar',
        data: catData.map(d => ({
          value: d.amount,
          itemStyle: { color: catColors[d.key], borderRadius: [6, 6, 0, 0] },
        })),
        barWidth: '50%',
        label: {
          show: true, position: 'top', fontSize: 10, fontWeight: 600, color: '#4a2e3a',
          formatter: params => '¥' + params.value.toFixed(0),
        },
      }],
    };
    
    chartInstance.current.setOption(option);
    
    const handleResize = () => chartInstance.current && chartInstance.current.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) chartInstance.current.dispose();
    };
  }, [summary.expense, version]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 顶部汇总 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">📊 本月支出构成</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '12px' }}>
          本月总支出 <span style={{ color: 'var(--pink-600)', fontWeight: 700, fontSize: '14px' }}>¥ {formatMoney(summary.expense)}</span>
        </div>
        
        {/* 左右等宽：柱状图 + 6卡片 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 左：柱状图 */}
          <div style={{ flex: 1, minWidth: 0, height: '220px' }}>
            <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
          
          {/* 右：6个小卡片 */}
          <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', alignContent: 'start' }}>
            {catData.map(d => (
              <div key={d.key} style={{
                padding: '8px 6px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                border: `1px solid ${catColors[d.key]}22`,
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: catColors[d.key] + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', margin: '0 auto 4px',
                }}>{d.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-sub)' }}>{d.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: catColors[d.key], marginTop: '1px' }}>
                  ¥{d.amount.toFixed(0)}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-mute)' }}>{d.percent.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 月度复盘 */}
      <MonthlyReview version={version} />
      
      {/* 收支趋势 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">📈 近7天收支</div>
        <MiniTrendChart version={version} />
      </div>
    </div>
  );
}

// ===== 月度复盘组件 =====
function MonthlyReview({ version }) {
  const [monthOffset, setMonthOffset] = React.useState(0);
  
  // 计算当前选中的月份
  const monthKey = React.useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [monthOffset]);
  
  const summary = DataStore.getMonthSummary(monthKey);
  const allTxs = DataStore.getTransactions();
  const monthTxs = allTxs.filter(t => t.date.startsWith(monthKey));
  
  // 支出Top3分类
  const expenseByCat = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
  });
  const expenseTop3 = Object.entries(expenseByCat)
    .map(([key, amount]) => {
      const cat = CATEGORIES.find(c => c.key === key);
      return { key, name: cat?.name || key, icon: cat?.icon || '✨', color: cat?.color || 'pink', amount };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  
  // 收入Top3来源
  const incomeByCat = {};
  monthTxs.filter(t => t.type === 'income').forEach(t => {
    incomeByCat[t.category] = (incomeByCat[t.category] || 0) + t.amount;
  });
  const incomeTop3 = Object.entries(incomeByCat)
    .map(([key, amount]) => {
      const cat = CATEGORIES.find(c => c.key === key);
      return { key, name: cat?.name || key, icon: cat?.icon || '✨', color: cat?.color || 'green', amount };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  
  const maxExpense = expenseTop3[0]?.amount || 1;
  const maxIncome = incomeTop3[0]?.amount || 1;
  const totalMax = Math.max(summary.income, summary.expense) || 1;
  
  const isCurrentMonth = monthOffset === 0;
  const monthLabel = monthKey.replace('-', '年') + '月';
  
  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* 标题 + 月份切换 */}
      <div className="row-between" style={{ marginBottom: '12px' }}>
        <button
          onClick={() => setMonthOffset(m => m + 1)}
          style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--pink-500)', padding: '2px 10px' }}
        >‹</button>
        <div style={{ textAlign: 'center' }}>
          <div className="section-title" style={{ marginBottom: 0, fontSize: '15px' }}>🎀 月度复盘</div>
          <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '2px' }}>{monthLabel}{isCurrentMonth && ' （本月）'}</div>
        </div>
        <button
          onClick={() => setMonthOffset(m => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          style={{ 
            background: 'none', border: 'none', fontSize: '18px', cursor: monthOffset === 0 ? 'not-allowed' : 'pointer', 
            color: monthOffset === 0 ? '#ccc' : 'var(--pink-500)', padding: '2px 10px' 
          }}
        >›</button>
      </div>
      
      {/* 收支汇总 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '12px', background: 'rgba(59,178,115,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#3bb273', marginBottom: '2px' }}>总收入</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#3bb273' }}>¥{formatMoney(summary.income)}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '12px', background: 'rgba(240,117,160,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#f075a0', marginBottom: '2px' }}>总支出</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f075a0' }}>¥{formatMoney(summary.expense)}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '12px', background: 'rgba(90,130,217,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#5a82d9', marginBottom: '2px' }}>结余</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#5a82d9' }}>¥{formatMoney(summary.balance)}</div>
        </div>
      </div>
      
      {/* 收支对比进度条 */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-sub)', marginBottom: '6px' }}>
          <span>收支对比</span>
          <span>储蓄率 {summary.savingRate.toFixed(1)}%</span>
        </div>
        <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', background: '#f5f0f2' }}>
          <div style={{
            width: (summary.income / totalMax * 50) + '%',
            background: 'linear-gradient(90deg, #8ed9a8, #3bb273)',
            minWidth: summary.income > 0 ? '2px' : '0',
            transition: 'width 0.5s',
          }}></div>
          <div style={{
            flex: 1,
            background: 'transparent',
          }}></div>
          <div style={{
            width: (summary.expense / totalMax * 50) + '%',
            background: 'linear-gradient(270deg, #ff9dc0, #f075a0)',
            minWidth: summary.expense > 0 ? '2px' : '0',
            transition: 'width 0.5s',
          }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-mute)', marginTop: '4px' }}>
          <span>← 收入</span>
          <span>支出 →</span>
        </div>
      </div>
      
      {/* Top3 分类排行 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* 支出Top3 */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>💸</span> 支出 Top 3
          </div>
          {expenseTop3.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-mute)', padding: '12px 0', textAlign: 'center' }}>暂无数据</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expenseTop3.map((item, i) => (
                <div key={item.key}>
                  <div className="row-between" style={{ marginBottom: '3px' }}>
                    <div className="row" style={{ gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: i === 0 ? '#f075a0' : 'var(--text-sub)', width: '14px' }}>
                        {i + 1}.
                      </span>
                      <span style={{ fontSize: '13px' }}>{item.icon}</span>
                      <span style={{ fontSize: '11px' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#f075a0' }}>¥{formatMoney(item.amount)}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '4px' }}>
                    <div className="progress-fill" style={{
                      width: (item.amount / maxExpense * 100) + '%',
                      background: i === 0 ? '#f075a0' : i === 1 ? '#ff9dc0' : '#ffc2d8',
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 收入Top3 */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>💰</span> 收入 Top 3
          </div>
          {incomeTop3.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-mute)', padding: '12px 0', textAlign: 'center' }}>暂无数据</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {incomeTop3.map((item, i) => (
                <div key={item.key}>
                  <div className="row-between" style={{ marginBottom: '3px' }}>
                    <div className="row" style={{ gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: i === 0 ? '#3bb273' : 'var(--text-sub)', width: '14px' }}>
                        {i + 1}.
                      </span>
                      <span style={{ fontSize: '13px' }}>{item.icon}</span>
                      <span style={{ fontSize: '11px' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#3bb273' }}>¥{formatMoney(item.amount)}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '4px' }}>
                    <div className="progress-fill" style={{
                      width: (item.amount / maxIncome * 100) + '%',
                      background: i === 0 ? '#3bb273' : i === 1 ? '#7ed49f' : '#b8ebc8',
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 底部小结 */}
      <div style={{ 
        marginTop: '14px', padding: '10px 12px', borderRadius: '12px',
        background: summary.balance >= 0 ? 'rgba(59,178,115,0.08)' : 'rgba(229,91,127,0.08)',
        fontSize: '11px', color: summary.balance >= 0 ? '#3bb273' : '#e55b7f',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ fontSize: '14px' }}>{summary.balance >= 0 ? '💪' : '😢'}</span>
        <span>
          {monthTxs.length} 笔交易 · 
          {summary.balance >= 0 
            ? `本月结余 ¥${formatMoney(summary.balance)}，继续保持！`
            : `本月超支 ¥${formatMoney(Math.abs(summary.balance))}，下月要加油哦～`
          }
        </span>
      </div>
    </div>
  );
}

function MiniTrendChart({ version }) {
  const ref = React.useRef(null);
  const inst = React.useRef(null);
  
  React.useEffect(() => {
    if (!ref.current) return;
    inst.current = echarts.init(ref.current);
    
    const days = [];
    const incomeData = [];
    const expenseData = [];
    const allTxs = DataStore.getTransactions();
    
    for (let i = 6; i >= 0; i--) {
      const d = dateStr(i);
      days.push(d.slice(5));
      const dayTxs = allTxs.filter(t => t.date === d);
      incomeData.push(dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0).toFixed(0));
      expenseData.push(dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toFixed(0));
    }
    
    const option = {
      grid: { top: 20, bottom: 24, left: 10, right: 10, containLabel: true },
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['收入', '支出'],
        top: 0, right: 0,
        textStyle: { fontSize: 10, color: '#8a6b78' },
        itemWidth: 10, itemHeight: 6,
      },
      xAxis: {
        type: 'category', data: days,
        axisLine: { lineStyle: { color: '#ffd6e7' } },
        axisTick: { show: false },
        axisLabel: { color: '#8a6b78', fontSize: 10 },
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          name: '收入', type: 'line', smooth: true, data: incomeData,
          lineStyle: { color: '#3bb273', width: 2 },
          itemStyle: { color: '#3bb273' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,178,115,0.3)' },
              { offset: 1, color: 'rgba(59,178,115,0.02)' },
            ]),
          },
          symbolSize: 5,
        },
        {
          name: '支出', type: 'line', smooth: true, data: expenseData,
          lineStyle: { color: '#f075a0', width: 2 },
          itemStyle: { color: '#f075a0' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(240,117,160,0.3)' },
              { offset: 1, color: 'rgba(240,117,160,0.02)' },
            ]),
          },
          symbolSize: 5,
        },
      ],
    };
    
    inst.current.setOption(option);
    const handleResize = () => inst.current && inst.current.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (inst.current) inst.current.dispose();
    };
  }, [version]);
  
  return <div ref={ref} style={{ width: '100%', height: '140px' }}></div>;
}

// ===== 4. 报表模块（4卡片 2x2）=====
function ReportModule({ refresh }) {
  const summary = DataStore.getMonthSummary();
  const prevMonth = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  })();
  const prevSummary = DataStore.getMonthSummary(prevMonth);
  
  const cards = [
    { label: '本月收入', value: summary.income, diff: summary.income - prevSummary.income, icon: '💰', color: '#3bb273' },
    { label: '本月支出', value: summary.expense, diff: summary.expense - prevSummary.expense, icon: '💸', color: '#e55b7f' },
    { label: '本月结余', value: summary.balance, diff: summary.balance - prevSummary.balance, icon: '💎', color: '#5a82d9' },
    { label: '储蓄率', value: summary.savingRate, diff: summary.savingRate - prevSummary.savingRate, icon: '🎯', color: '#a85ad9', isRate: true },
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">📈 月度财务体检</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              padding: '14px', borderRadius: '16px',
              background: c.color + '12',
              border: `1px solid ${c.color}22`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px' }}>{c.icon}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{c.label}</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: c.color, letterSpacing: '-0.5px' }}>
                {c.isRate ? summary.savingRate.toFixed(1) + '%' : '¥' + formatMoney(c.value)}
              </div>
              <div style={{ fontSize: '10px', color: c.diff >= 0 ? '#3bb273' : '#e55b7f', marginTop: '2px' }}>
                {c.diff >= 0 ? '↑' : '↓'} 较上月{c.isRate ? c.diff.toFixed(1) + '%' : '¥' + formatMoney(Math.abs(c.diff))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 分类排行 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">🏆 支出分类排行</div>
        {(() => {
          const byCat = DataStore.getExpenseByCategory();
          const arr = Object.entries(byCat).map(([key, amount]) => {
            const cat = CATEGORIES.find(c => c.key === key);
            return { key, name: cat?.name || key, icon: cat?.icon || '✨', amount };
          }).sort((a, b) => b.amount - a.amount).slice(0, 6);
          const max = arr[0]?.amount || 1;
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {arr.map((item, i) => (
                <div key={item.key}>
                  <div className="row-between" style={{ marginBottom: '4px' }}>
                    <div className="row" style={{ gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: i < 3 ? '#f075a0' : 'var(--text-sub)' }}>
                        {i + 1}.
                      </span>
                      <span>{item.icon}</span>
                      <span style={{ fontSize: '12px' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                      ¥{formatMoney(item.amount)}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{
                      width: (item.amount / max * 100) + '%',
                      background: i === 0 ? 'linear-gradient(90deg, #ff8fb3, #f075a0)' : 
                                  i === 1 ? 'linear-gradient(90deg, #ffb8d1, #ff9dc0)' :
                                  'linear-gradient(90deg, #ffd6e7, #ffb8d1)',
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ===== 5. 预算模块（可设置修改）=====
function BudgetModule({ refresh }) {
  const budgets = DataStore.getBudgets();
  const byCat = DataStore.getExpenseByCategory();
  const currentMonth = dateStr(0).slice(0, 7);
  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ category: 'food', limit: 0 });
  
  const openAdd = () => {
    setEditing(null);
    setForm({ category: 'food', limit: 0 });
    setModalOpen(true);
  };
  
  const openEdit = (b) => {
    setEditing(b);
    setForm({ category: b.category, limit: b.limit });
    setModalOpen(true);
  };
  
  const handleSubmit = () => {
    if (!form.limit || form.limit <= 0) {
      showToast('请输入预算金额');
      return;
    }
    DataStore.setBudget(form.category, currentMonth, form.limit);
    showToast(editing ? '修改成功' : '添加成功');
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (b) => {
    showConfirm({
      title: '删除预算',
      message: `确定删除「${CATEGORIES.find(c => c.key === b.category)?.name}」的预算吗？`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteBudget(b.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>🎯 本月预算 · {currentMonth}</div>
          <button
            onClick={openAdd}
            style={{
              padding: '4px 12px', borderRadius: '14px',
              border: 'none', cursor: 'pointer',
              background: 'var(--pink-500)', color: '#fff',
              fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
            }}
          >+ 添加</button>
        </div>
        {monthBudgets.length === 0 ? (
          <div className="empty">还没有预算，点击上方添加吧～</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {monthBudgets.map(b => {
              const cat = CATEGORIES.find(c => c.key === b.category);
              const spent = byCat[b.category] || 0;
              const percent = Math.min((spent / b.limit) * 100, 100);
              const remaining = b.limit - spent;
              const isOver = remaining < 0;
              
              return (
                <div key={b.id} onClick={() => openEdit(b)} style={{ cursor: 'pointer' }}>
                  <div className="row-between" style={{ marginBottom: '6px' }}>
                    <div className="row" style={{ gap: '8px' }}>
                      <div className={`icon-circle cat-${cat?.color}`} style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                        {cat?.icon}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat?.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isOver ? '#e55b7f' : 'var(--text-main)' }}>
                        ¥{formatMoney(spent)} <span style={{ fontWeight: 400, color: 'var(--text-mute)', fontSize: '11px' }}>/ ¥{formatMoney(b.limit)}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: isOver ? '#e55b7f' : 'var(--text-mute)' }}>
                        {isOver ? `超支 ¥${formatMoney(Math.abs(remaining))}` : `剩 ¥${formatMoney(remaining)} · ${percent.toFixed(0)}%`}
                      </div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: percent + '%',
                      background: isOver 
                        ? 'linear-gradient(90deg, #ff8899, #e55b7f)'
                        : percent > 80
                        ? 'linear-gradient(90deg, #ffc28a, #e8a63c)'
                        : 'linear-gradient(90deg, var(--pink-300), var(--pink-500))',
                    }}></div>
                  </div>
                  <div style={{ marginTop: '4px', textAlign: 'right' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(b); }}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-mute)', fontSize: '11px',
                        cursor: 'pointer', padding: '2px 6px',
                      }}
                    >删除</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 预算总览 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">💡 预算提醒</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.8 }}>
          📌 已设置 <b style={{ color: 'var(--pink-600)' }}>{monthBudgets.length}</b> 个分类预算<br/>
          📌 本月总预算 <b style={{ color: 'var(--pink-600)' }}>¥{formatMoney(monthBudgets.reduce((s, b) => s + b.limit, 0))}</b><br/>
          📌 已支出 <b style={{ color: 'var(--pink-600)' }}>¥{formatMoney(monthBudgets.reduce((s, b) => s + (byCat[b.category] || 0), 0))}</b><br/>
          📌 剩余可用 <b style={{ color: '#3bb273' }}>¥{formatMoney(monthBudgets.reduce((s, b) => s + b.limit - (byCat[b.category] || 0), 0))}</b>
        </div>
      </div>
      
      {/* 预算编辑弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '修改预算' : '添加预算'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存' : '添加'}
      >
        <FormField label="分类">
          <CategoryPicker value={form.category} onChange={v => setForm({ ...form, category: v })} type="expense" />
        </FormField>
        <FormField label="本月预算金额">
          <NumberInput value={form.limit} onChange={v => setForm({ ...form, limit: v })} prefix="¥" />
        </FormField>
      </FormModal>
    </div>
  );
}

// ===== 6. 账户模块（可增删改）=====
function AccountModule({ refresh }) {
  const accounts = DataStore.getAccounts();
  const total = DataStore.getTotalAssets();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    name: '', type: 'digital', balance: 0, icon: '💳', color: '#f075a0',
  });
  
  const typeMap = {
    card: { name: '银行卡', icon: '💳' },
    digital: { name: '电子钱包', icon: '📱' },
    fund: { name: '理财账户', icon: '💰' },
    cash: { name: '现金', icon: '💵' },
    other: { name: '其他', icon: '✨' },
  };
  
  const groups = {};
  accounts.forEach(a => {
    const type = a.type || 'other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(a);
  });
  
  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', type: 'digital', balance: 0, icon: '💳', color: '#f075a0' });
    setModalOpen(true);
  };
  
  const openEdit = (acc) => {
    setEditing(acc);
    setForm({ ...acc });
    setModalOpen(true);
  };
  
  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入账户名称');
      return;
    }
    if (editing) {
      DataStore.updateAccount(editing.id, form);
      showToast('修改成功');
    } else {
      DataStore.addAccount(form);
      showToast('添加成功');
    }
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (acc) => {
    showConfirm({
      title: '删除账户',
      message: `确定删除账户「${acc.name}」吗？相关交易记录不受影响。`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteAccount(acc.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  const iconOptions = ['💳', '💰', '💵', '📱', '🏦', '💎', '🎁', '🚗', '✈️', '🐱'];
  const colorOptions = ['#f075a0', '#3a9cf5', '#3bb273', '#e8a63c', '#a85ad9', '#e87a3c', '#5a82d9', '#e55b7f'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 净资产 */}
      <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(255,143,179,0.85), rgba(255,214,231,0.9))', color: '#fff' }}>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>净资产</div>
        <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-1px', marginTop: '4px' }}>
          ¥ {formatMoney(total)}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '6px' }}>
          共 {accounts.length} 个账户
        </div>
      </div>
      
      {/* 添加按钮 */}
      <button
        onClick={openAdd}
        className="card"
        style={{
          padding: '14px', cursor: 'pointer', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', fontSize: '14px', fontWeight: 600,
          color: 'var(--pink-600)', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: '18px' }}>+</span>
        添加账户
      </button>
      
      {/* 按类型分组 */}
      {Object.entries(groups).map(([type, list]) => {
        const typeInfo = typeMap[type] || { name: '其他', icon: '✨' };
        const typeTotal = list.reduce((s, a) => s + a.balance, 0);
        return (
          <div key={type} className="card" style={{ padding: '16px' }}>
            <div className="row-between" style={{ marginBottom: '12px' }}>
              <div className="row" style={{ gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{typeInfo.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>{typeInfo.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>({list.length}个)</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pink-600)' }}>¥{formatMoney(typeTotal)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {list.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => openEdit(acc)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: acc.color + '10',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="row" style={{ gap: '10px' }}>
                    <div className="icon-circle" style={{
                      width: '36px', height: '36px', fontSize: '16px',
                      background: acc.color + '22', color: acc.color,
                    }}>{acc.icon}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{acc.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      ¥{formatMoney(acc.balance)}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(acc); }}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-mute)', fontSize: '13px',
                        cursor: 'pointer', padding: '2px 4px',
                      }}
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* 账户编辑弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '编辑账户' : '添加账户'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存' : '添加'}
      >
        <FormField label="账户名称">
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="如：工商银行、支付宝" />
        </FormField>
        <FormField label="账户类型">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(typeMap).map(([k, v]) => (
              <div
                key={k}
                onClick={() => setForm({ ...form, type: k, icon: v.icon })}
                style={{
                  padding: '6px 12px', borderRadius: '14px',
                  background: form.type === k ? 'var(--pink-500)' : 'rgba(255,143,179,0.1)',
                  color: form.type === k ? '#fff' : 'var(--text-main)',
                  fontSize: '12px', fontWeight: form.type === k ? 700 : 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >{v.icon} {v.name}</div>
            ))}
          </div>
        </FormField>
        <FormField label="余额">
          <NumberInput value={form.balance} onChange={v => setForm({ ...form, balance: v })} prefix="¥" />
        </FormField>
        <FormField label="图标">
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {iconOptions.map(ic => (
              <div
                key={ic}
                onClick={() => setForm({ ...form, icon: ic })}
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: form.icon === ic ? 'var(--pink-500)' : 'rgba(255,143,179,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', cursor: 'pointer',
                }}
              >{ic}</div>
            ))}
          </div>
        </FormField>
        <FormField label="主题色">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {colorOptions.map(col => (
              <div
                key={col}
                onClick={() => setForm({ ...form, color: col })}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: col,
                  cursor: 'pointer',
                  border: form.color === col ? '3px solid #4a2e3a' : '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              ></div>
            ))}
          </div>
        </FormField>
      </FormModal>
    </div>
  );
}

// ===== 7. 理财模块 =====
function FinanceModule() {
  const [toast, setToast] = React.useState('');
  
  const handleCopy = (url) => {
    navigator.clipboard?.writeText(url).then(() => {
      showToast('链接已复制');
    }).catch(() => {
      showToast('复制失败，请手动复制');
    });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '8px' }}>
      {/* 提示 */}
      <div className="card" style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>💡</span>
        以下为第三方行情网站，数据仅供参考
      </div>
      
      {/* 2列网格 6张卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {FINANCE_COVERS.map(item => (
          <div key={item.key} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* 封面图 */}
            <div style={{
              position: 'relative',
              height: '110px',
              backgroundImage: `url(${item.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
              onClick={() => window.open(item.url, '_blank')}
            >
              <div style={{
                position: 'absolute',
                top: '8px', left: '8px',
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
              }}>{item.category}</div>
              
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                color: item.accent,
              }}>▶</div>
              
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '40px',
                background: 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)',
              }}></div>
            </div>
            
            {/* 文字 + 按钮 */}
            <div style={{ padding: '10px 12px 12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '2px', minHeight: '16px' }}>{item.desc}</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '11px' }}
                  onClick={() => window.open(item.url, '_blank')}
                >查看行情</button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: '11px' }}
                  onClick={() => handleCopy(item.url)}
                >复制</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 暴露模块组件
Object.assign(window, {
  OverviewModule, DetailModule, StatsModule, ReportModule,
  BudgetModule, AccountModule, FinanceModule, BG_IMAGES, FINANCE_COVERS,
});
