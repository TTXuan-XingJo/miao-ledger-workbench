// 模块 8-14：借贷、目标、模板、周期、账本、日历、设置（含增删改）

// ===== 8. 借贷模块（可增删改）=====
function LoanModule({ refresh }) {
  const [filter, setFilter] = React.useState('all');
  const loans = DataStore.getLoans();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    type: 'lend', person: '', amount: 0, note: '', date: dateStr(0),
  });
  
  const filtered = filter === 'all' ? loans : loans.filter(l => l.type === filter);
  const pending = filtered.filter(l => l.status === 'pending');
  const returned = filtered.filter(l => l.status === 'returned');
  
  const lendTotal = loans.filter(l => l.type === 'lend' && l.status === 'pending').reduce((s, l) => s + l.amount, 0);
  const borrowTotal = loans.filter(l => l.type === 'borrow' && l.status === 'pending').reduce((s, l) => s + l.amount, 0);
  
  const openAdd = () => {
    setEditing(null);
    setForm({ type: 'lend', person: '', amount: 0, note: '', date: dateStr(0) });
    setModalOpen(true);
  };
  
  const openEdit = (l) => {
    setEditing(l);
    setForm({ ...l });
    setModalOpen(true);
  };
  
  const handleToggle = (id) => {
    DataStore.toggleLoan(id);
    refresh();
  };
  
  const handleSubmit = () => {
    if (!form.person.trim()) {
      showToast('请输入对方姓名');
      return;
    }
    if (!form.amount || form.amount <= 0) {
      showToast('请输入金额');
      return;
    }
    if (editing) {
      DataStore.updateLoan(editing.id, form);
      showToast('修改成功');
    } else {
      DataStore.addLoan(form);
      showToast('添加成功');
    }
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (l) => {
    showConfirm({
      title: '删除记录',
      message: '确定删除这条记录吗？',
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteLoan(l.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  const renderLoanList = (items, title) => {
    if (items.length === 0) return null;
    return (
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: '10px' }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map(l => {
            const isLend = l.type === 'lend';
            return (
              <div
                key={l.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,143,179,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() => openEdit(l)}
              >
                <div className="icon-circle" style={{
                  width: '42px', height: '42px',
                  background: isLend ? '#d6f0e0' : '#ffd6e7',
                  color: isLend ? '#3bb273' : '#f075a0',
                  fontSize: '18px',
                }}>{isLend ? '→' : '←'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {l.person}
                    <span style={{ fontSize: '11px', color: 'var(--text-mute)', marginLeft: '6px', fontWeight: 400 }}>
                      {isLend ? '我借出' : '我借入'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '2px' }}>
                    {l.date} · {l.note || '无备注'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    fontSize: '15px', fontWeight: 700,
                    color: l.status === 'returned' ? 'var(--text-mute)' : (isLend ? '#3bb273' : '#f075a0'),
                  }}>¥{formatMoney(l.amount)}</div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(l); }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-mute)', fontSize: '13px',
                      cursor: 'pointer', padding: '2px 4px',
                    }}
                  >🗑️</button>
                </div>
              </div>
            );
          })}
          {/* 标记归还按钮放在每条记录内 */}
          {items.map(l => (
            <div key={'btn-' + l.id} style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
              <button
                style={{
                  padding: '2px 10px', borderRadius: '10px', border: 'none',
                  background: l.status === 'returned' ? 'rgba(59,178,115,0.15)' : 'rgba(255,143,179,0.15)',
                  color: l.status === 'returned' ? '#3bb273' : '#f075a0',
                  fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onClick={(e) => { e.stopPropagation(); handleToggle(l.id); }}
              >
                {l.status === 'returned' ? '✓ 已归还' : '标记归还'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="card" style={{ padding: '14px', background: 'linear-gradient(135deg, rgba(59,178,115,0.15), rgba(214,240,224,0.6))' }}>
          <div style={{ fontSize: '12px', color: '#3bb273' }}>💚 借出（他人欠我）</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#3bb273', marginTop: '4px' }}>¥{formatMoney(lendTotal)}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-mute)' }}>
            {loans.filter(l => l.type === 'lend' && l.status === 'pending').length} 笔待收回
          </div>
        </div>
        <div className="card" style={{ padding: '14px', background: 'linear-gradient(135deg, rgba(240,117,160,0.15), rgba(255,214,231,0.6))' }}>
          <div style={{ fontSize: '12px', color: '#f075a0' }}>💗 借入（我欠他人）</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f075a0', marginTop: '4px' }}>¥{formatMoney(borrowTotal)}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-mute)' }}>
            {loans.filter(l => l.type === 'borrow' && l.status === 'pending').length} 笔待归还
          </div>
        </div>
      </div>
      
      {/* 筛选 + 添加 */}
      <div className="card" style={{ padding: '6px', display: 'flex', gap: '4px' }}>
        {[
          { key: 'all', label: '全部' },
          { key: 'lend', label: '借出' },
          { key: 'borrow', label: '借入' },
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
        <button
          onClick={openAdd}
          style={{
            padding: '8px 14px', borderRadius: '14px',
            border: 'none', cursor: 'pointer',
            background: 'rgba(255,143,179,0.15)', color: 'var(--pink-600)',
            fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
          }}
        >+</button>
      </div>
      
      {renderLoanList(pending, '⏳ 进行中')}
      {renderLoanList(returned, '✅ 已结清')}
      
      {filtered.length === 0 && (
        <div className="card empty">
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤝</div>
          暂无记录，点击「+」添加
        </div>
      )}
      
      {/* 编辑弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '编辑记录' : '新增借贷'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存' : '添加'}
      >
        <FormField label="类型">
          <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '14px', background: 'rgba(255,143,179,0.1)' }}>
            <button
              onClick={() => setForm({ ...form, type: 'lend' })}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: form.type === 'lend' ? '#3bb273' : 'transparent',
                color: form.type === 'lend' ? '#fff' : 'var(--text-sub)',
                fontFamily: 'inherit',
              }}
            >我借出</button>
            <button
              onClick={() => setForm({ ...form, type: 'borrow' })}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: form.type === 'borrow' ? '#e55b7f' : 'transparent',
                color: form.type === 'borrow' ? '#fff' : 'var(--text-sub)',
                fontFamily: 'inherit',
              }}
            >我借入</button>
          </div>
        </FormField>
        <FormField label="对方姓名">
          <TextInput value={form.person} onChange={v => setForm({ ...form, person: v })} placeholder="如：小王、小美" />
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

// ===== 9. 目标模块（可增删改+存钱）=====
function GoalModule({ refresh }) {
  const goals = DataStore.getGoals();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    name: '', icon: '🎯', target: 0, saved: 0, deadline: '',
  });
  
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [depositGoal, setDepositGoal] = React.useState(null);
  const [depositAmount, setDepositAmount] = React.useState(0);
  
  const iconOptions = ['📱', '✈️', '🎁', '💻', '🏠', '🚗', '💍', '📷', '🎮', '🐱', '💎', '🌟'];
  
  const openAdd = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setEditing(null);
    setForm({
      name: '', icon: '🎯', target: 0, saved: 0,
      deadline: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    });
    setModalOpen(true);
  };
  
  const openEdit = (g) => {
    setEditing(g);
    setForm({ ...g });
    setModalOpen(true);
  };
  
  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入目标名称');
      return;
    }
    if (!form.target || form.target <= 0) {
      showToast('请输入目标金额');
      return;
    }
    if (editing) {
      DataStore.updateGoal(editing.id, form);
      showToast('修改成功');
    } else {
      DataStore.addGoal(form);
      showToast('添加成功');
    }
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (g) => {
    showConfirm({
      title: '删除目标',
      message: `确定删除目标「${g.name}」吗？`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteGoal(g.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  const openDeposit = (g) => {
    setDepositGoal(g);
    setDepositAmount(0);
    setDepositOpen(true);
  };
  
  const handleDeposit = () => {
    if (!depositAmount || depositAmount <= 0) {
      showToast('请输入存入金额');
      return;
    }
    DataStore.addToGoal(depositGoal.id, depositAmount);
    showToast(`已存入 ¥${formatMoney(depositAmount)}`);
    setDepositOpen(false);
    refresh();
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>🌟 攒钱目标</div>
          <button
            onClick={openAdd}
            style={{
              padding: '4px 12px', borderRadius: '14px',
              border: 'none', cursor: 'pointer',
              background: 'var(--pink-500)', color: '#fff',
              fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
            }}
          >+ 新建</button>
        </div>
        {goals.length === 0 ? (
          <div className="empty">还没有目标，给自己定一个小目标吧～</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {goals.map(g => {
              const percent = Math.min((g.saved / g.target) * 100, 100);
              const remaining = g.target - g.saved;
              const isDone = g.saved >= g.target;
              
              return (
                <div
                  key={g.id}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    background: isDone ? 'linear-gradient(135deg, rgba(255,214,102,0.2), rgba(255,235,180,0.4))' : 'rgba(255,245,248,0.7)',
                    border: `1px solid ${isDone ? '#ffd666' : 'rgba(255,143,179,0.2)'}`,
                  }}
                >
                  <div className="row-between" style={{ marginBottom: '8px' }}>
                    <div className="row" style={{ gap: '10px', cursor: 'pointer' }} onClick={() => openEdit(g)}>
                      <div style={{ fontSize: '28px' }}>{g.icon}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700 }}>{g.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
                          目标 ¥{formatMoney(g.target)} · 截止 {g.deadline}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isDone && <span style={{ fontSize: '16px' }}>🎉</span>}
                      <button
                        onClick={() => handleDelete(g)}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--text-mute)', fontSize: '13px',
                          cursor: 'pointer', padding: '2px 4px',
                        }}
                      >🗑️</button>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{
                      width: percent + '%',
                      background: isDone 
                        ? 'linear-gradient(90deg, #ffd666, #ffb347)'
                        : 'linear-gradient(90deg, var(--pink-300), var(--pink-500))',
                    }}></div>
                  </div>
                  <div className="row-between" style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                      已存 <b style={{ color: isDone ? '#e8a63c' : 'var(--pink-600)', fontSize: '14px' }}>¥{formatMoney(g.saved)}</b>
                      <span style={{ marginLeft: '4px', fontSize: '10px' }}>({percent.toFixed(1)}%)</span>
                    </div>
                    {!isDone && (
                      <button
                        onClick={() => openDeposit(g)}
                        style={{
                          padding: '4px 12px', borderRadius: '12px',
                          border: 'none', cursor: 'pointer',
                          background: 'var(--pink-500)', color: '#fff',
                          fontSize: '11px', fontWeight: 600, fontFamily: 'inherit',
                        }}
                      >存入</button>
                    )}
                  </div>
                  {!isDone && (
                    <div style={{ fontSize: '10px', color: 'var(--text-mute)', marginTop: '4px' }}>
                      还差 ¥{formatMoney(Math.max(0, remaining))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="card" style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-sub)' }}>
        💪 坚持记账，小目标慢慢都会实现的！
      </div>
      
      {/* 编辑弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '编辑目标' : '新建目标'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存' : '创建'}
      >
        <FormField label="目标名称">
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="如：新手机、日本旅行" />
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
        <FormField label="目标金额">
          <NumberInput value={form.target} onChange={v => setForm({ ...form, target: v })} prefix="¥" />
        </FormField>
        <FormField label="已存金额">
          <NumberInput value={form.saved} onChange={v => setForm({ ...form, saved: v })} prefix="¥" />
        </FormField>
        <FormField label="目标截止日期">
          <TextInput type="date" value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} />
        </FormField>
      </FormModal>
      
      {/* 存入弹窗 */}
      <FormModal
        open={depositOpen}
        title={`存入「${depositGoal?.name || ''}」`}
        onClose={() => setDepositOpen(false)}
        onSubmit={handleDeposit}
        submitText="确认存入"
      >
        <FormField label="存入金额">
          <NumberInput value={depositAmount} onChange={setDepositAmount} prefix="¥" />
        </FormField>
        <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
          当前已存：¥{formatMoney(depositGoal?.saved || 0)} / ¥{formatMoney(depositGoal?.target || 0)}
        </div>
      </FormModal>
    </div>
  );
}

// ===== 10. 模板模块（可增删改+一键使用）=====
function TemplateModule({ refresh }) {
  const templates = DataStore.getTemplates();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    name: '', type: 'expense', category: 'food', amount: 0, icon: '🍜',
  });
  
  const expenseTpls = templates.filter(t => t.type === 'expense');
  const incomeTpls = templates.filter(t => t.type === 'income');
  
  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', type: 'expense', category: 'food', amount: 0, icon: '🍜' });
    setModalOpen(true);
  };
  
  const openEdit = (tpl) => {
    setEditing(tpl);
    setForm({ ...tpl });
    setModalOpen(true);
  };
  
  const handleQuickAdd = (tpl) => {
    const acc = DataStore.getAccounts()[0];
    DataStore.addTransaction({
      type: tpl.type,
      category: tpl.category,
      amount: tpl.amount,
      note: tpl.name,
      date: dateStr(0),
      accountId: acc?.id || '',
    });
    showToast(`已记录「${tpl.name}」¥${formatMoney(tpl.amount)}`);
    refresh();
  };
  
  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入模板名称');
      return;
    }
    if (!form.amount || form.amount <= 0) {
      showToast('请输入金额');
      return;
    }
    if (editing) {
      DataStore.updateTemplate(editing.id, form);
      showToast('修改成功');
    } else {
      DataStore.addTemplate(form);
      showToast('添加成功');
    }
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (tpl) => {
    showConfirm({
      title: '删除模板',
      message: `确定删除模板「${tpl.name}」吗？`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteTemplate(tpl.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  const renderGrid = (items) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
      {items.map(tpl => (
        <div
          key={tpl.id}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,143,179,0.15)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            position: 'relative',
          }}
          onClick={() => handleQuickAdd(tpl)}
          onContextMenu={e => { e.preventDefault(); openEdit(tpl); }}
          onDoubleClick={() => openEdit(tpl)}
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{tpl.icon}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600 }}>{tpl.name}</div>
          <div style={{ fontSize: '10px', color: tpl.type === 'income' ? '#3bb273' : '#f075a0', marginTop: '2px' }}>
            ¥{formatMoney(tpl.amount)}
          </div>
          <button
            onClick={e => { e.stopPropagation(); openEdit(tpl); }}
            style={{
              position: 'absolute', top: '2px', right: '2px',
              width: '18px', height: '18px',
              borderRadius: '50%', border: 'none',
              background: 'rgba(255,143,179,0.15)',
              color: 'var(--pink-600)',
              fontSize: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
            title="编辑"
          >✎</button>
          <button
            onClick={e => { e.stopPropagation(); handleDelete(tpl); }}
            style={{
              position: 'absolute', top: '2px', left: '2px',
              width: '18px', height: '18px',
              borderRadius: '50%', border: 'none',
              background: 'rgba(229,91,127,0.15)',
              color: '#e55b7f',
              fontSize: '9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
            title="删除"
          >×</button>
        </div>
      ))}
      {/* 添加按钮占位 */}
      <div
        onClick={openAdd}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '10px 4px',
          borderRadius: '14px',
          background: 'rgba(255,143,179,0.08)',
          border: '1px dashed rgba(255,143,179,0.3)',
          cursor: 'pointer',
          textAlign: 'center',
          color: 'var(--pink-500)',
        }}
      >
        <div style={{ fontSize: '22px', marginBottom: '4px' }}>+</div>
        <div style={{ fontSize: '10px', fontWeight: 600 }}>新建</div>
      </div>
    </div>
  );
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">⚡ 快速记账（点击即记）</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '12px' }}>
          点击模板卡片快速记录到今天 · 长按/点右上角 ✎ 编辑
        </div>
        
        {expenseTpls.length > 0 && (
          <>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', margin: '10px 0 8px' }}>💸 支出</div>
            {renderGrid(expenseTpls)}
          </>
        )}
        
        {incomeTpls.length > 0 && (
          <>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', margin: '14px 0 8px' }}>💰 收入</div>
            {renderGrid(incomeTpls)}
          </>
        )}
        
        {templates.length === 0 && (
          <div className="empty">
            还没有模板，点击下方添加吧～
            <div style={{ marginTop: '10px' }}>
              <button className="btn btn-primary" onClick={openAdd}>+ 新建模板</button>
            </div>
          </div>
        )}
      </div>
      
      <div className="card" style={{ padding: '14px', fontSize: '12px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>💡</span>
        小提示：点击模板 = 快速记账，点 ✎ = 编辑
      </div>
      
      {/* 编辑弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '编辑模板' : '新建模板'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存' : '创建'}
      >
        <FormField label="模板名称">
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="如：早餐、地铁" />
        </FormField>
        <FormField label="类型">
          <TypeToggle value={form.type} onChange={v => {
            const firstCat = CATEGORIES.find(c => c.type === v);
            setForm({ ...form, type: v, category: firstCat?.key, icon: firstCat?.icon });
          }} />
        </FormField>
        <FormField label="分类">
          <CategoryPicker value={form.category} onChange={v => {
            const cat = CATEGORIES.find(c => c.key === v);
            setForm({ ...form, category: v, icon: cat?.icon || form.icon });
          }} type={form.type} />
        </FormField>
        <FormField label="金额">
          <NumberInput value={form.amount} onChange={v => setForm({ ...form, amount: v })} prefix="¥" />
        </FormField>
      </FormModal>
    </div>
  );
}

// ===== 11. 周期模块（可增删改+补记）=====
function RecurringModule({ refresh }) {
  const recurring = DataStore.getRecurring();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    name: '', type: 'expense', category: 'food', amount: 0,
    cycle: 'monthly', day: 1,
  });
  const [toast, setToast] = React.useState('');
  
  const today = dateStr(0);
  
  const needRecord = recurring.filter(r => r.nextDate <= today);
  const upcoming = recurring.filter(r => r.nextDate > today).sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  
  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', type: 'expense', category: 'food', amount: 0, cycle: 'monthly', day: 1 });
    setModalOpen(true);
  };
  
  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...r });
    setModalOpen(true);
  };
  
  const handleRecord = (r) => {
    DataStore.addTransaction({
      type: r.type,
      category: r.category,
      amount: r.amount,
      note: r.name + '（周期记账）',
      date: today,
      accountId: DataStore.getAccounts()[0]?.id,
    });
    
    const item = DataStore.data.recurring.find(x => x.id === r.id);
    if (item) {
      const d = new Date(today);
      if (r.cycle === 'monthly') {
        d.setMonth(d.getMonth() + 1);
      } else if (r.cycle === 'weekly') {
        d.setDate(d.getDate() + 7);
      }
      item.lastDone = today;
      item.nextDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(r.day).padStart(2,'0')}`;
      DataStore.save();
    }
    
    showToast(`已补记「${r.name}」¥${formatMoney(r.amount)}`);
    refresh();
  };
  
  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入名称');
      return;
    }
    if (!form.amount || form.amount <= 0) {
      showToast('请输入金额');
      return;
    }
    // 计算下次日期
    const d = new Date();
    const nextMonth = d.getMonth();
    const nextYear = d.getFullYear();
    const day = form.day || 1;
    let nextDate = `${nextYear}-${String(nextMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    if (nextDate < today) {
      const nd = new Date(nextYear, nextMonth + 1, day);
      nextDate = `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}-${String(nd.getDate()).padStart(2,'0')}`;
    }
    
    const data = { ...form, nextDate, lastDone: '' };
    
    if (editing) {
      DataStore.updateRecurring(editing.id, data);
      showToast('修改成功');
    } else {
      DataStore.addRecurring(data);
      showToast('添加成功');
    }
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (r) => {
    showConfirm({
      title: '删除周期账',
      message: `确定删除周期账「${r.name}」吗？`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteRecurring(r.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  const renderItem = (r, showRecord = false) => {
    const cat = CATEGORIES.find(c => c.key === r.category);
    const isExpense = r.type === 'expense';
    const overdue = r.nextDate < today;
    
    return (
      <div key={r.id} style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,143,179,0.1)',
        cursor: 'pointer',
      }}
      onClick={() => openEdit(r)}
      >
        <div className={`icon-circle cat-${cat?.color || 'other'}`} style={{ width: '40px', height: '40px', fontSize: '18px' }}>
          {cat?.icon || '🔄'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{r.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '2px' }}>
            {r.cycle === 'monthly' ? '每月' : '每周'}{r.day}日 · 下次 {r.nextDate}
            {overdue && <span style={{ color: '#e55b7f', marginLeft: '4px' }}>· 已到期</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isExpense ? '#e55b7f' : '#3bb273' }}>
            {isExpense ? '-' : '+'}¥{formatMoney(r.amount)}
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleDelete(r); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-mute)', fontSize: '13px',
              cursor: 'pointer', padding: '2px 4px',
            }}
          >🗑️</button>
        </div>
        {showRecord && (
          <button
            className="btn btn-primary"
            style={{ padding: '3px 10px', fontSize: '10px' }}
            onClick={e => { e.stopPropagation(); handleRecord(r); }}
          >补记</button>
        )}
      </div>
    );
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 待补记 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '10px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            ⏰ 待补记
            {needRecord.length > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 600,
                background: '#ff8fb3', color: '#fff',
                padding: '2px 8px', borderRadius: '10px',
              }}>{needRecord.length} 笔</span>
            )}
          </div>
        </div>
        {needRecord.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: '12px' }}>
            ✅ 都已记录，没有待补记的账目
          </div>
        ) : (
          <div>
            {needRecord.map(r => renderItem(r, true))}
          </div>
        )}
      </div>
      
      {/* 周期列表 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '10px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>📅 所有周期账</div>
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
        {upcoming.length === 0 && needRecord.length === 0 ? (
          <div className="empty">暂无周期账</div>
        ) : (
          <div>
            {upcoming.map(r => renderItem(r))}
          </div>
        )}
      </div>
      
      {/* 编辑弹窗 */}
      <FormModal
        open={modalOpen}
        title={editing ? '编辑周期账' : '新增周期账'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editing ? '保存' : '添加'}
      >
        <FormField label="名称">
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="如：房租、工资" />
        </FormField>
        <FormField label="类型">
          <TypeToggle value={form.type} onChange={v => {
            const firstCat = CATEGORIES.find(c => c.type === v);
            setForm({ ...form, type: v, category: firstCat?.key });
          }} />
        </FormField>
        <FormField label="分类">
          <CategoryPicker value={form.category} onChange={v => setForm({ ...form, category: v })} type={form.type} />
        </FormField>
        <FormField label="金额">
          <NumberInput value={form.amount} onChange={v => setForm({ ...form, amount: v })} prefix="¥" />
        </FormField>
        <FormField label="周期">
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{ k: 'monthly', l: '每月' }, { k: 'weekly', l: '每周' }].map(c => (
              <div
                key={c.k}
                onClick={() => setForm({ ...form, cycle: c.k })}
                style={{
                  padding: '6px 16px', borderRadius: '14px',
                  background: form.cycle === c.k ? 'var(--pink-500)' : 'rgba(255,143,179,0.1)',
                  color: form.cycle === c.k ? '#fff' : 'var(--text-main)',
                  fontSize: '12px', fontWeight: form.cycle === c.k ? 700 : 500,
                  cursor: 'pointer',
                }}
              >{c.l}</div>
            ))}
          </div>
        </FormField>
        <FormField label={form.cycle === 'monthly' ? '每月几日' : '每周几日 (1-31)'}>
          <NumberInput value={form.day} onChange={v => setForm({ ...form, day: Math.max(1, Math.min(31, parseInt(v) || 1)) })} />
        </FormField>
      </FormModal>
    </div>
  );
}

// ===== 12. 账本模块（可新建/切换/编辑/删除）=====
function BookModule({ refresh, onSwitch }) {
  const books = DataStore.getBooks();
  const current = DataStore.getCurrentBook();
  const [newName, setNewName] = React.useState('');
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', icon: '📒', color: '#ff8fb3' });
  
  const handleAdd = () => {
    if (!newName.trim()) return;
    const newBook = DataStore.addBook(newName.trim(), '📒', '#ff8fb3');
    DataStore.data.accounts.push(
      { id: uid('acc'), bookId: newBook.id, name: '默认账户', type: 'digital', balance: 0, icon: '💳', color: '#f075a0' }
    );
    DataStore.save();
    setNewName('');
    refresh();
  };
  
  const openEdit = (book) => {
    setEditing(book);
    setForm({ name: book.name, icon: book.icon, color: book.color });
    setModalOpen(true);
  };
  
  const handleEditSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入账本名称');
      return;
    }
    DataStore.updateBook(editing.id, form);
    showToast('修改成功');
    setModalOpen(false);
    refresh();
  };
  
  const handleDelete = (book) => {
    if (book.id === current.id) {
      showToast('不能删除当前账本');
      return;
    }
    showConfirm({
      title: '删除账本',
      message: `确定删除账本「${book.name}」吗？所有相关数据都将被清除，不可恢复！`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteBook(book.id);
        showToast('已删除');
        refresh();
      }
    });
  };
  
  const iconOptions = ['🏠', '✈️', '🐱', '💰', '🎯', '📒', '🍼', '💼', '🎓', '🏖️'];
  const colorOptions = ['#ff8fb3', '#7bc8f0', '#8fd9b3', '#ffd07b', '#b892f0', '#f09b7b', '#7bd9d9', '#f07b9b'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">📒 我的账本</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '12px' }}>
          各账本数据互相独立，点击切换账本后所有模块数据随之变化
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {books.map(book => {
            const txCount = DataStore.data.transactions.filter(t => t.bookId === book.id).length;
            const accCount = DataStore.data.accounts.filter(a => a.bookId === book.id).length;
            const total = DataStore.data.accounts.filter(a => a.bookId === book.id).reduce((s, a) => s + a.balance, 0);
            const isCurrent = book.id === current.id;
            
            return (
              <div
                key={book.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px',
                  borderRadius: '16px',
                  background: isCurrent
                    ? 'linear-gradient(135deg, rgba(255,143,179,0.2), rgba(255,214,231,0.5))'
                    : 'rgba(255,245,248,0.6)',
                  border: isCurrent ? '2px solid #ff8fb3' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => { DataStore.switchBook(book.id); refresh(); onSwitch && onSwitch(); }}
              >
                <div style={{
                  width: '50px', height: '50px', borderRadius: '16px',
                  background: book.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                }}>{book.icon}</div>
                <div style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>
                    {book.name}
                    {isCurrent && <span style={{ fontSize: '10px', background: '#ff8fb3', color: '#fff', padding: '2px 6px', borderRadius: '8px', marginLeft: '6px', fontWeight: 600 }}>当前</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '2px' }}>
                    {txCount} 笔交易 · {accCount} 个账户
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pink-600)' }}>¥{formatMoney(total)}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(book); }}
                      style={{
                        padding: '2px 8px', borderRadius: '10px',
                        border: 'none', fontSize: '10px', fontWeight: 600,
                        background: 'rgba(255,143,179,0.15)', color: 'var(--pink-600)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >编辑</button>
                    {!isCurrent && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(book); }}
                        style={{
                          padding: '2px 8px', borderRadius: '10px',
                          border: 'none', fontSize: '10px', fontWeight: 600,
                          background: 'rgba(229,91,127,0.15)', color: '#e55b7f',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >删除</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 新建账本 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">➕ 新建账本</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="输入账本名称"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '14px',
              border: '1px solid #ffd6e7', fontSize: '14px',
              background: '#fff8f8', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button className="btn btn-primary" onClick={handleAdd}>创建</button>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '8px' }}>
          可用于：旅行、装修、育儿、生意等不同场景
        </div>
      </div>
      
      {/* 编辑账本弹窗 */}
      <FormModal
        open={modalOpen}
        title="编辑账本"
        onClose={() => setModalOpen(false)}
        onSubmit={handleEditSubmit}
        submitText="保存"
      >
        <FormField label="账本名称">
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} />
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

// ===== 13. 日历模块 =====
function CalendarModule({ refresh }) {
  const [selectedDate, setSelectedDate] = React.useState(dateStr(0));
  const [viewMonth, setViewMonth] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  
  const txs = DataStore.getTransactions();
  const dayTxs = txs.filter(t => t.date === selectedDate);
  const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  const [y, m] = viewMonth.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startWeekday = firstDay.getDay();
  
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr2 = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasTx = txs.some(t => t.date === dateStr2);
    cells.push({ day: d, date: dateStr2, hasTx });
  }
  
  const changeMonth = (delta) => {
    const d = new Date(y, m - 1 + delta, 1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  };
  
  const handleDelete = (tx) => {
    showConfirm({
      title: '删除记录',
      message: '确定删除这笔记录吗？',
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
      {/* 日历 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '12px' }}>
          <button 
            onClick={() => changeMonth(-1)}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--pink-500)', padding: '4px 10px' }}
          >‹</button>
          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{y}年 {m}月</div>
          <button 
            onClick={() => changeMonth(1)}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--pink-500)', padding: '4px 10px' }}
          >›</button>
        </div>
        
        {/* 星期表头 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-mute)', padding: '6px 0' }}>
              {d}
            </div>
          ))}
        </div>
        
        {/* 日期网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={i}></div>;
            const isToday = cell.date === dateStr(0);
            const isSelected = cell.date === selectedDate;
            
            return (
              <div
                key={i}
                onClick={() => setSelectedDate(cell.date)}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--pink-500)' : isToday ? 'rgba(255,143,179,0.15)' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? 'var(--pink-600)' : 'var(--text-main)',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {cell.day}
                {cell.hasTx && (
                  <div style={{
                    position: 'absolute',
                    bottom: '3px',
                    width: '4px', height: '4px',
                    borderRadius: '50%',
                    background: isSelected ? '#fff' : 'var(--pink-400)',
                  }}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 选中日期的账目 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="row-between" style={{ marginBottom: '12px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            📅 {selectedDate}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>
            收 <span style={{ color: '#3bb273', fontWeight: 600 }}>¥{formatMoney(dayIncome)}</span>
            {' · '}
            支 <span style={{ color: '#e55b7f', fontWeight: 600 }}>¥{formatMoney(dayExpense)}</span>
          </div>
        </div>
        {dayTxs.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: '12px' }}>
            这天没有记录～
          </div>
        ) : (
          <div>
            {dayTxs.map(tx => (
              <div key={tx.id} className="tx-item">
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
                    onClick={() => handleDelete(tx)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-mute)', fontSize: '14px',
                      cursor: 'pointer', padding: '4px 6px',
                    }}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 14. 设置模块 =====
function SettingsModule({ refresh, onBgChange, bgCount }) {
  const [dataSize, setDataSize] = React.useState('0');
  const [confirmReset, setConfirmReset] = React.useState(false);
  // 云同步状态
  const [cloudToken, setCloudToken] = React.useState('');
  const [cloudOwner, setCloudOwner] = React.useState('');
  const [cloudRepo, setCloudRepo] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState('');
  const [syncMsgType, setSyncMsgType] = React.useState('info'); // info / success / error
  const [lastSync, setLastSync] = React.useState('');

  React.useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setDataSize((raw.length / 1024).toFixed(1) + ' KB');
    // 加载云同步配置
    const cfg = getCloudConfig();
    setCloudToken(cfg.token || '');
    setCloudOwner(cfg.owner || '');
    setCloudRepo(cfg.repo || '');
    setLastSync(getLastSync());
  }, []);

  const handleReset = () => {
    DataStore.resetToBlank();
    setConfirmReset(false);
    window.location.reload();
  };

  const showMsg = (msg, type = 'info') => {
    setSyncMsg(msg);
    setSyncMsgType(type);
    if (type === 'success') {
      setTimeout(() => setSyncMsg(''), 4000);
    }
  };

  const handleSaveConfig = () => {
    saveCloudConfig({ token: cloudToken, owner: cloudOwner, repo: cloudRepo });
    showMsg('✅ 配置已保存', 'success');
  };

  const handleUpload = async () => {
    if (!cloudToken) {
      showMsg('⚠️ 请先填写 GitHub 令牌并保存配置', 'error');
      return;
    }
    handleSaveConfig();
    setSyncLoading(true);
    showMsg('正在上传...', 'info');
    try {
      const time = await uploadToCloud((p) => showMsg(p, 'info'));
      setLastSync(time);
      showMsg('✅ 数据已同步到云端！', 'success');
      if (refresh) refresh();
    } catch (e) {
      showMsg('❌ 上传失败：' + e.message, 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cloudToken) {
      showMsg('⚠️ 请先填写 GitHub 令牌并保存配置', 'error');
      return;
    }
    handleSaveConfig();
    setSyncLoading(true);
    showMsg('正在下载...', 'info');
    try {
      const time = await downloadFromCloud((p) => showMsg(p, 'info'));
      setLastSync(time);
      showMsg('✅ 已从云端恢复数据！页面即将刷新', 'success');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      showMsg('❌ 下载失败：' + e.message, 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  const msgColor = syncMsgType === 'success' ? '#3bb273' : syncMsgType === 'error' ? '#e55b7f' : 'var(--text-sub)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ☁️ 云同步 */}
      <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(123,200,240,0.12), rgba(255,255,255,0.8))' }}>
        <div className="section-title">☁️ 云同步</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '12px', lineHeight: 1.6 }}>
          将记账数据备份到 GitHub 仓库，换手机或清缓存后可一键恢复
        </div>

        {/* GitHub 令牌 */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
            🔑 GitHub 令牌 (Personal Access Token)
          </label>
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={cloudToken}
            onChange={(e) => setCloudToken(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.08)', fontSize: '13px',
              background: '#fff', boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* 高级设置 */}
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none', border: 'none', fontSize: '12px',
              color: 'var(--pink-500)', cursor: 'pointer', padding: '0',
            }}
          >{showAdvanced ? '▲ 收起高级设置' : '▼ 高级设置（仓库信息）'}</button>
          {showAdvanced && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-mute)', display: 'block', marginBottom: '3px' }}>用户名 (Owner)</label>
                <input
                  type="text" value={cloudOwner}
                  onChange={(e) => setCloudOwner(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)', fontSize: '12px',
                    background: '#fff', boxSizing: 'border-box', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-mute)', display: 'block', marginBottom: '3px' }}>仓库名 (Repo)</label>
                <input
                  type="text" value={cloudRepo}
                  onChange={(e) => setCloudRepo(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)', fontSize: '12px',
                    background: '#fff', boxSizing: 'border-box', outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 同步状态消息 */}
        {syncMsg && (
          <div style={{
            padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
            background: 'rgba(0,0,0,0.03)', color: msgColor, marginBottom: '10px',
            wordBreak: 'break-all',
          }}>{syncMsg}</div>
        )}

        {/* 最后同步时间 */}
        {lastSync && (
          <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginBottom: '10px', textAlign: 'center' }}>
            上次同步：{lastSync}
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, opacity: syncLoading ? 0.6 : 1 }}
            disabled={syncLoading}
            onClick={handleUpload}
          >☁️ 上传到云端</button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, opacity: syncLoading ? 0.6 : 1 }}
            disabled={syncLoading}
            onClick={handleDownload}
          >📥 从云端恢复</button>
        </div>

        <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-mute)', lineHeight: 1.5 }}>
          💡 令牌仅保存在你本机浏览器，不会上传到任何服务器。需要 repo 权限的 Classic Token。
        </div>
      </div>

      {/* 数据安全 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">🔒 数据安全</div>
        <div style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.8 }}>
          所有数据保存在<b style={{ color: 'var(--pink-600)' }}>你本机浏览器</b>的 localStorage 中<br/>
          可通过上方云同步功能备份到 GitHub<br/>
          卸载浏览器或清除数据会导致本地数据丢失
        </div>
        <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,143,179,0.08)', fontSize: '12px', color: 'var(--text-sub)' }}>
          当前数据大小：{dataSize}
        </div>
      </div>
      
      {/* 背景图切换 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">🎨 背景主题</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '10px' }}>
          5 张不同风格背景，点击切换
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={onBgChange}
        >切换下一张背景</button>
      </div>
      
      {/* 关于 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">💝 关于喵账</div>
        <div style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.8 }}>
          一款软萌可爱的记账小工具<br/>
          陪伴你记录生活的每一笔小确幸<br/>
          <br/>
          <b style={{ color: 'var(--pink-600)' }}>版本：</b>v1.2.0（云同步版）<br/>
          <b style={{ color: 'var(--pink-600)' }}>技术：</b>纯前端 · React · GitHub 云同步
        </div>
      </div>
      
      {/* 数据管理 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title">⚙️ 数据管理</div>
        
        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginBottom: '10px' }}
          onClick={() => {
            const data = JSON.stringify(DataStore.data, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `喵账备份_${dateStr(0)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >📥 导出数据备份</button>
        
        <button
          className="btn"
          style={{ width: '100%', background: 'rgba(229,91,127,0.1)', color: '#e55b7f' }}
          onClick={() => setConfirmReset(true)}
        >🗑️ 重置所有数据</button>
      </div>
      
      {/* 感谢 */}
      <div style={{ textAlign: 'center', padding: '10px 0 20px', fontSize: '11px', color: 'var(--text-mute)' }}>
        Made with 💕 by 妙搭工作室
      </div>
      
      {/* 确认重置弹窗 */}
      {confirmReset && (
        <div className="modal-mask open" onClick={() => setConfirmReset(false)}>
          <div className="modal" style={{ maxWidth: '320px', borderRadius: '20px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚠️ 确认重置？</div>
            <div style={{ fontSize: '13px', color: 'var(--text-sub)', textAlign: 'center', marginBottom: '16px' }}>
              所有账本和记账数据都将被清除<br/>此操作不可撤销！
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>取消</button>
              <button className="btn" style={{ flex: 1, background: '#e55b7f', color: '#fff' }} onClick={handleReset}>确认重置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 暴露
Object.assign(window, {
  LoanModule, GoalModule, TemplateModule, RecurringModule,
  BookModule, CalendarModule, SettingsModule,
});
