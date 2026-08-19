// ===== 贷款还款管理模块 =====
function MortgageModule({ refresh, onNavigate }) {
  const [loans, setLoans] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [version, setVersion] = React.useState(0);
  
  // 弹窗状态
  const [loanModalOpen, setLoanModalOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState(null);
  const [loanForm, setLoanForm] = React.useState({
    name: '', principal: '', annualRate: '', repaymentMethod: 'equal',
    startDate: dateStr(0), totalMonths: '12', monthlyPayDay: '15',
    monthlyPayment: '', bankNote: '',
  });
  
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState(null);
  const [payForm, setPayForm] = React.useState({
    loanId: '', date: dateStr(0), totalAmount: '', principal: '', interest: '', genExpense: true,
  });
  
  const forceUpdate = () => setVersion(v => v + 1);
  
  React.useEffect(() => {
    const list = DataStore.getMortgageLoans();
    setLoans(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id);
    }
  }, [version]);
  
  const selected = loans.find(l => l.id === selectedId) || loans[0];
  
  // ========== 新增/编辑贷款 ==========
  const openAddLoan = () => {
    setEditingLoan(null);
    setLoanForm({
      name: '', principal: '', annualRate: '', repaymentMethod: 'equal',
      startDate: dateStr(0), totalMonths: '12', monthlyPayDay: '15',
      monthlyPayment: '', bankNote: '',
    });
    setLoanModalOpen(true);
  };
  
  const openEditLoan = (loan) => {
    setEditingLoan(loan);
    setLoanForm({
      name: loan.name, principal: loan.principal, annualRate: loan.annualRate,
      repaymentMethod: loan.repaymentMethod, startDate: loan.startDate,
      totalMonths: loan.totalMonths, monthlyPayDay: loan.monthlyPayDay,
      monthlyPayment: loan.monthlyPayment, bankNote: loan.bankNote || '',
    });
    setLoanModalOpen(true);
  };
  
  const handleSaveLoan = () => {
    if (!loanForm.name) { showToast('请输入贷款名称'); return; }
    if (!loanForm.principal || Number(loanForm.principal) <= 0) { showToast('请输入有效本金'); return; }
    if (!loanForm.totalMonths || Number(loanForm.totalMonths) <= 0) { showToast('请输入有效期数'); return; }
    if (!loanForm.monthlyPayDay) { showToast('请选择还款日'); return; }
    
    if (editingLoan) {
      DataStore.updateMortgageLoan(editingLoan.id, loanForm);
      showToast('已更新');
    } else {
      const item = DataStore.addMortgageLoan(loanForm);
      setSelectedId(item.id);
      showToast('已添加');
    }
    setLoanModalOpen(false);
    forceUpdate();
    refresh && refresh();
  };
  
  const handleDeleteLoan = (loan) => {
    showConfirm({
      title: '删除贷款',
      message: `确定删除贷款「${loan.name}」吗？所有还款记录都会被删除，且不可恢复！`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteMortgageLoan(loan.id);
        showToast('已删除');
        const list = DataStore.getMortgageLoans();
        setSelectedId(list[0]?.id || null);
        forceUpdate();
        refresh && refresh();
      }
    });
  };
  
  // ========== 新增/编辑还款 ==========
  const openAddPayment = () => {
    if (!selected) { showToast('请先添加一笔贷款'); return; }
    setEditingRecord(null);
    setPayForm({
      loanId: selected.id, date: dateStr(0), totalAmount: selected.monthlyPayment || '',
      principal: '', interest: '', genExpense: true,
    });
    setPayModalOpen(true);
  };
  
  const openEditPayment = (record) => {
    if (!selected) return;
    setEditingRecord(record);
    setPayForm({
      loanId: selected.id, date: record.date, totalAmount: record.totalAmount,
      principal: record.principal, interest: record.interest, genExpense: false,
    });
    setPayModalOpen(true);
  };
  
  const handleSavePayment = () => {
    if (!payForm.loanId) { showToast('请选择贷款'); return; }
    const total = Number(payForm.totalAmount) || 0;
    const principal = Number(payForm.principal) || 0;
    const interest = Number(payForm.interest) || 0;
    if (total <= 0) { showToast('请输入还款总金额'); return; }
    
    if (editingRecord) {
      DataStore.updateMortgageRecord(payForm.loanId, editingRecord.id, {
        date: payForm.date, totalAmount: total, principal, interest,
      });
      showToast('已更新');
    } else {
      DataStore.addMortgageRecord(payForm.loanId, {
        date: payForm.date, totalAmount: total, principal, interest,
      });
      // 自动生成支出
      if (payForm.genExpense) {
        const loan = DataStore.getMortgageLoans().find(l => l.id === payForm.loanId);
        DataStore.addTransaction({
          type: 'expense',
          category: 'other',
          amount: total,
          note: `【贷款还款】${loan ? loan.name : ''}`,
          date: payForm.date,
          accountId: '',
        });
      }
      showToast('已记录还款');
    }
    setPayModalOpen(false);
    forceUpdate();
    refresh && refresh();
  };
  
  const handleDeletePayment = (record) => {
    if (!selected) return;
    showConfirm({
      title: '删除还款记录',
      message: `确定删除 ${record.date} 这笔 ¥${formatMoney(record.totalAmount)} 的还款记录吗？`,
      confirmText: '删除',
      danger: true,
    }).then(ok => {
      if (ok) {
        DataStore.deleteMortgageRecord(selected.id, record.id);
        showToast('已删除');
        forceUpdate();
        refresh && refresh();
      }
    });
  };
  
  // ========== 待还计划计算 ==========
  const getSchedule = (loan) => {
    if (!loan) return [];
    const start = new Date(loan.startDate);
    const startY = start.getFullYear();
    const startM = start.getMonth();
    const totalMonths = Number(loan.totalMonths) || 0;
    const principal = Number(loan.principal) || 0;
    const annualRate = Number(loan.annualRate) || 0;
    const monthRate = annualRate / 12 / 100;
    const method = loan.repaymentMethod;
    const paidDates = new Set(loan.records.map(r => r.date));
    const today = dateStr(0);
    const plan = [];
    const round2 = n => Math.round(n * 100) / 100;

    // 建立每月还款记录的映射（按月份取第一条匹配记录）
    const paidRecordMap = {};
    (loan.records || []).forEach(r => {
      const mk = r.date.slice(0, 7);
      if (!paidRecordMap[mk]) paidRecordMap[mk] = r;
    });

    for (let i = 0; i < totalMonths; i++) {
      const d = new Date(startY, startM + i, Number(loan.monthlyPayDay) || 15);
      const dateStr2 = d.toISOString().slice(0, 10);
      const monthKey = dateStr2.slice(0, 7);
      const paidRecord = paidRecordMap[monthKey];
      const hasPaid = !!paidRecord;
      let status = 'pending';
      if (hasPaid) status = 'paid';
      else if (dateStr2 === today) status = 'today';
      else if (dateStr2 < today) status = 'overdue';

      // 计算本期应还金额
      let dueAmount = 0;
      let duePrincipal = 0;
      let dueInterest = 0;
      if (principal && totalMonths && annualRate) {
        if (method === 'equal') {
          const pow = Math.pow(1 + monthRate, totalMonths);
          dueAmount = round2(principal * monthRate * pow / (pow - 1));
          // 等额本息每期总金额相同，利息随剩余本金递减（此处简化，仅用于等额本金/先息后本展示）
        } else if (method === 'principal') {
          const monthlyPrincipal = principal / totalMonths;
          const remainingPrincipal = principal - monthlyPrincipal * i;
          duePrincipal = round2(monthlyPrincipal);
          dueInterest = round2(remainingPrincipal * monthRate);
          dueAmount = round2(duePrincipal + dueInterest);
        } else if (method === 'interest_only') {
          dueInterest = round2(principal * monthRate);
          if (i === totalMonths - 1) {
            duePrincipal = round2(principal);
            dueAmount = round2(duePrincipal + dueInterest);
          } else {
            dueAmount = dueInterest;
          }
        } else {
          // 自定义/其他：按月供字段显示
          dueAmount = Number(loan.monthlyPayment) || 0;
        }
      }

      plan.push({
        date: dateStr2, status, index: i + 1,
        dueAmount, duePrincipal, dueInterest,
        paidRecord,
      });
    }
    return plan;
  };
  
  // ========== 渲染 ==========
  if (!selected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📑</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            还没有贷款记录
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '20px' }}>
            添加你的第一笔贷款，轻松管理每期还款
          </div>
          <button className="btn" style={{ width: '100%' }} onClick={openAddLoan}>＋ 新增贷款</button>
        </div>
        
        <FormModal open={loanModalOpen} title={editingLoan ? '编辑贷款' : '新增贷款'} onClose={() => setLoanModalOpen(false)} onSubmit={handleSaveLoan} submitText="保存">
          <MortgageLoanForm form={loanForm} setForm={setLoanForm} />
        </FormModal>
      </div>
    );
  }
  
  const records = selected.records.slice().sort((a, b) => a.date < b.date ? 1 : -1);
  // 计算每条记录是第几期（根据起始日和还款日）
  const getPeriodIndex = (dateStr2) => {
    const start = new Date(selected.startDate);
    const target = new Date(dateStr2);
    const months = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth()) + 1;
    return months;
  };
  const schedule = getSchedule(selected);
  const isSettled = selected.settled;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', filter: isSettled ? 'grayscale(0.3)' : 'none' }}>
      {/* 贷款切换器 */}
      {loans.length > 1 && (
        <div className="card" style={{ padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {loans.map(l => (
            <div
              key={l.id}
              onClick={() => setSelectedId(l.id)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: '20px',
                background: l.id === selected.id ? 'var(--pink-500)' : 'var(--bg-soft)',
                color: l.id === selected.id ? '#fff' : 'var(--text-main)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <span>{l.name}</span>
              {l.settled && <span style={{ fontSize: '10px' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
      
      {/* 总览卡片 */}
      <div className="card" style={{
        padding: '20px',
        background: isSettled 
          ? 'linear-gradient(135deg, rgba(180,180,180,0.3), rgba(220,220,220,0.2))'
          : 'linear-gradient(135deg, rgba(255,143,179,0.85), rgba(255,214,231,0.9))',
        color: isSettled ? '#666' : '#fff',
      }}>
        <div className="row-between" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>
            {selected.name}
            {isSettled && <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 400, opacity: 0.8 }}>（已结清）</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-ghost" 
              style={{ padding: '4px 10px', fontSize: '11px', color: isSettled ? '#666' : '#fff', border: `1px solid ${isSettled ? '#bbb' : 'rgba(255,255,255,0.5)'}`, background: 'transparent' }}
              onClick={() => openEditLoan(selected)}
            >编辑</button>
            <button 
              className="btn btn-ghost" 
              style={{ padding: '4px 10px', fontSize: '11px', color: isSettled ? '#999' : '#fff', border: `1px solid ${isSettled ? '#ccc' : 'rgba(255,255,255,0.5)'}`, background: 'transparent' }}
              onClick={() => handleDeleteLoan(selected)}
            >删除</button>
          </div>
        </div>
        
        {/* 剩余本金高亮 */}
        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>剩余本金</div>
        <div style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
          ¥ {formatMoney(selected.remainingPrincipal)}
        </div>
        
        {/* 进度条 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ height: '6px', borderRadius: '3px', background: isSettled ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: selected.principal > 0 ? (selected.paidPrincipal / selected.principal * 100) + '%' : '0%',
              background: isSettled ? '#999' : '#fff',
              borderRadius: '3px',
              transition: 'width 0.5s',
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', opacity: 0.85 }}>
            <span>已还本金 {selected.principal > 0 ? (selected.paidPrincipal / selected.principal * 100).toFixed(1) : 0}%</span>
            <span>{Math.max(0, selected.totalMonths - records.length)} 期剩余</span>
          </div>
        </div>
        
        {/* 数据网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '12px' }}>
          <div>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>总本金</div>
            <div style={{ fontWeight: 700 }}>¥{formatMoney(selected.principal)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>累计已还本金</div>
            <div style={{ fontWeight: 700 }}>¥{formatMoney(selected.paidPrincipal)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>累计已还利息</div>
            <div style={{ fontWeight: 700 }}>¥{formatMoney(selected.paidInterest)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>月供</div>
            <div style={{ fontWeight: 700 }}>¥{formatMoney(selected.monthlyPayment)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>每月还款日</div>
            <div style={{ fontWeight: 700 }}>{selected.monthlyPayDay} 日</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '11px' }}>总期数</div>
            <div style={{ fontWeight: 700 }}>{selected.totalMonths} 期</div>
          </div>
        </div>
        
        {selected.bankNote && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${isSettled ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`, fontSize: '11px', opacity: 0.8 }}>
            🏦 {selected.bankNote}
          </div>
        )}
      </div>
      
      {/* 操作按钮组 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={openAddLoan}>
          ＋ 新增贷款
        </button>
        <button className="btn" style={{ flex: 1, background: isSettled ? '#ccc' : 'var(--pink-500)', color: '#fff' }} onClick={openAddPayment} disabled={isSettled}>
          💰 记录本次还款
        </button>
      </div>
      
      {/* 还款历史明细 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}>📋 还款历史明细</div>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '12px', color: 'var(--text-mute)' }}>
            暂无还款记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {records.map(rec => (
              <div key={rec.id} className="tx-item" onClick={() => openEditPayment(rec)}>
                <div className="icon-circle" style={{ background: 'rgba(240,117,160,0.15)', color: '#f075a0', width: '40px', height: '40px', fontSize: '18px' }}>
                  💰
                </div>
                <div className="tx-info">
                  <div className="tx-cat-name">第 {getPeriodIndex(rec.date)} 期还款</div>
                  <div className="tx-note">
                    {rec.date} · 本金¥{formatMoney(rec.principal)} · 利息¥{formatMoney(rec.interest)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tx-amount amount-expense">-¥{formatMoney(rec.totalAmount)}</div>
                  <div 
                    style={{ fontSize: '10px', color: 'var(--text-mute)', cursor: 'pointer', marginTop: '2px' }}
                    onClick={(e) => { e.stopPropagation(); handleDeletePayment(rec); }}
                  >删除</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 待还计划列表 */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}>📅 待还计划</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
          {schedule.map(item => {
            const displayAmount = item.status === 'paid'
              ? (item.paidRecord ? Number(item.paidRecord.totalAmount) : item.dueAmount)
              : item.dueAmount;
            const amountLabel = item.status === 'paid' ? '已还' : '应还';
            return (
            <div key={item.date} className="row-between" style={{
              padding: '10px 12px', borderRadius: '10px',
              background: item.status === 'today' ? 'rgba(255,143,179,0.15)' : 'transparent',
              border: item.status === 'today' ? '1px solid var(--pink-500)' : 'none',
            }}>
              <div className="row" style={{ gap: '10px', alignItems: 'center' }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  background: item.status === 'paid' ? 'var(--bg-soft)' : 
                              item.status === 'today' ? 'var(--pink-500)' : 
                              item.status === 'overdue' ? '#ffd6d6' : 'var(--bg-soft)',
                  color: item.status === 'paid' ? '#aaa' : 
                         item.status === 'today' ? '#fff' : 
                         item.status === 'overdue' ? '#e55b7f' : 'var(--text-mute)',
                }}>
                  {item.status === 'paid' ? '✓' : item.index}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{
                    fontSize: '13px',
                    color: item.status === 'paid' ? '#bbb' : 
                           item.status === 'today' ? 'var(--pink-500)' : 
                           item.status === 'overdue' ? '#e55b7f' : 'var(--text)',
                    fontWeight: item.status === 'today' ? 700 : 500,
                  }}>
                    {item.date}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: item.status === 'paid' ? '#ccc' : 
                           item.status === 'today' ? 'var(--pink-500)' : 
                           item.status === 'overdue' ? '#e55b7f' : 'var(--text-mute)',
                  }}>
                    {item.status === 'paid' ? '已还' : 
                     item.status === 'today' ? '今日还款 🔔' : 
                     item.status === 'overdue' ? '已逾期' : '待还'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{
                  fontSize: '15px', fontWeight: 700,
                  color: item.status === 'paid' ? '#bbb' : 
                         item.status === 'overdue' ? '#e55b7f' : 
                         item.status === 'today' ? 'var(--pink-500)' : 'var(--text)',
                }}>
                  ¥{displayAmount.toFixed(2)}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: item.status === 'paid' ? '#ddd' : 'var(--text-mute)',
                }}>
                  {amountLabel}
                </span>
              </div>
            </div>
          );})}
        </div>
      </div>
      
      {/* 新增贷款弹窗 */}
      <FormModal open={loanModalOpen} title={editingLoan ? '编辑贷款' : '新增贷款'} onClose={() => setLoanModalOpen(false)} onSubmit={handleSaveLoan} submitText="保存">
        <MortgageLoanForm form={loanForm} setForm={setLoanForm} />
      </FormModal>
      
      {/* 记录还款弹窗 */}
      <FormModal open={payModalOpen} title={editingRecord ? '编辑还款记录' : '记录本次还款'} onClose={() => setPayModalOpen(false)} onSubmit={handleSavePayment} submitText="保存">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FormField label="选择贷款">
            <select 
              className="form-input" 
              value={payForm.loanId}
              onChange={e => setPayForm(p => ({ ...p, loanId: e.target.value }))}
            >
              {loans.filter(l => !l.settled).map(l => (
                <option key={l.id} value={l.id}>{l.name}（剩余 ¥{formatMoney(l.remainingPrincipal)}）</option>
              ))}
              {loans.filter(l => l.settled).map(l => (
                <option key={l.id} value={l.id} disabled>{l.name}（已结清）</option>
              ))}
            </select>
          </FormField>
          <FormField label="还款日期">
            <input 
              type="date" className="form-input" 
              value={payForm.date}
              onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))}
            />
          </FormField>
          <FormField label="还款总金额 (元)">
            <input 
              type="number" className="form-input" placeholder="如 3500"
              value={payForm.totalAmount}
              onChange={e => setPayForm(p => ({ ...p, totalAmount: e.target.value }))}
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="本次本金 (元)">
              <input 
                type="number" className="form-input" placeholder="归还本金"
                value={payForm.principal}
                onChange={e => setPayForm(p => ({ ...p, principal: e.target.value }))}
              />
            </FormField>
            <FormField label="本次利息 (元)">
              <input 
                type="number" className="form-input" placeholder="利息部分"
                value={payForm.interest}
                onChange={e => setPayForm(p => ({ ...p, interest: e.target.value }))}
              />
            </FormField>
          </div>
          {!editingRecord && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-sub)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={payForm.genExpense}
                onChange={e => setPayForm(p => ({ ...p, genExpense: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: 'var(--pink-500)' }}
              />
              自动生成一笔记账支出
            </label>
          )}
        </div>
      </FormModal>
    </div>
  );
}

// 贷款表单子组件
function MortgageLoanForm({ form, setForm }) {
  // 月供是否由用户手动修改过：手动修改后不再自动覆盖，直到本金/利率/期数/方式再次变化
  const [manualOverride, setManualOverride] = React.useState(false);

  React.useEffect(() => {
    // 任一核心字段变化时，重置手动覆盖标记并重新计算
    setManualOverride(false);
  }, [form.principal, form.annualRate, form.totalMonths, form.repaymentMethod]);

  // 实时计算月供
  const monthlyCalc = React.useMemo(() => {
    const principal = Number(form.principal);
    const annualRate = Number(form.annualRate);
    const totalMonths = Number(form.totalMonths);
    const method = form.repaymentMethod;
    if (!principal || !totalMonths || !annualRate) return null;
    if (method === 'custom') return null;
    const monthRate = annualRate / 12 / 100;
    let firstMonth = 0;
    let decrease = 0;
    let label = '';
    if (method === 'equal') {
      // 等额本息
      const pow = Math.pow(1 + monthRate, totalMonths);
      firstMonth = principal * monthRate * pow / (pow - 1);
      label = '等额本息';
    } else if (method === 'principal') {
      // 等额本金：首月月供 = 本金/期数 + 本金×月利率，每月递减 本金/期数 × 月利率
      const monthlyPrincipal = principal / totalMonths;
      firstMonth = monthlyPrincipal + principal * monthRate;
      decrease = monthlyPrincipal * monthRate;
      label = '等额本金';
    } else {
      // 先息后本 / 其他：每月只还利息
      firstMonth = principal * monthRate;
      label = method === 'interest_only' ? '先息后本' : '每月付息';
    }
    return {
      firstMonth: Math.round(firstMonth * 100) / 100,
      decrease: Math.round(decrease * 100) / 100,
      label,
    };
  }, [form.principal, form.annualRate, form.totalMonths, form.repaymentMethod]);

  // 自动填充月供（仅在未被手动覆盖时）
  React.useEffect(() => {
    if (manualOverride) return;
    if (!monthlyCalc) {
      // 缺参数时如果当前值来自自动计算则清空（这里保留用户手动输入值）
      return;
    }
    if (String(form.monthlyPayment) !== String(monthlyCalc.firstMonth)) {
      setForm(f => ({ ...f, monthlyPayment: monthlyCalc.firstMonth }));
    }
  }, [monthlyCalc, manualOverride]);

  const handleMonthlyChange = (e) => {
    setManualOverride(true);
    setForm(f => ({ ...f, monthlyPayment: e.target.value }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <FormField label="贷款名称">
        <input 
          type="text" className="form-input" placeholder="如：房贷、车贷"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </FormField>
      <FormField label="总本金 (元)">
        <input 
          type="number" className="form-input" placeholder="如：1000000"
          value={form.principal}
          onChange={e => setForm(f => ({ ...f, principal: e.target.value }))}
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <FormField label="年利率 (%)">
          <input 
            type="number" step="0.01" className="form-input" placeholder="选填"
            value={form.annualRate}
            onChange={e => setForm(f => ({ ...f, annualRate: e.target.value }))}
          />
        </FormField>
        <FormField label="还款方式">
          <select 
            className="form-input"
            value={form.repaymentMethod}
            onChange={e => setForm(f => ({ ...f, repaymentMethod: e.target.value }))}
          >
            <option value="equal">等额本息</option>
            <option value="principal">等额本金</option>
            <option value="interest_only">先息后本</option>
            <option value="custom">其他/手动</option>
          </select>
        </FormField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <FormField label="贷款起始日">
          <input 
            type="date" className="form-input"
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
          />
        </FormField>
        <FormField label="总期数 (月)">
          <input 
            type="number" className="form-input" placeholder="如：360"
            value={form.totalMonths}
            onChange={e => setForm(f => ({ ...f, totalMonths: e.target.value }))}
          />
        </FormField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <FormField label="每月还款日">
          <input 
            type="number" min="1" max="28" className="form-input" placeholder="1-28"
            value={form.monthlyPayDay}
            onChange={e => setForm(f => ({ ...f, monthlyPayDay: e.target.value }))}
          />
        </FormField>
        <FormField label={
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            月供金额 (元)
            {monthlyCalc && !manualOverride && (
              <span style={{
                fontSize: '10px', fontWeight: 500, color: 'var(--pink-500)',
                background: 'rgba(255,143,179,0.15)', padding: '2px 6px', borderRadius: '6px',
              }}>自动·{monthlyCalc.label}</span>
            )}
          </span>
        }>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" className="form-input" placeholder="如：3500"
              value={form.monthlyPayment}
              onChange={handleMonthlyChange}
              style={{ paddingRight: monthlyCalc && monthlyCalc.decrease > 0 ? '80px' : '12px' }}
            />
            {monthlyCalc && monthlyCalc.decrease > 0 && !manualOverride && (
              <span style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '10px', color: 'var(--text-mute)',
              }}>每月递减 ¥{monthlyCalc.decrease}</span>
            )}
          </div>
        </FormField>
      </div>
      <FormField label="银行/备注">
        <input 
          type="text" className="form-input" placeholder="如：工商银行 尾号1234"
          value={form.bankNote}
          onChange={e => setForm(f => ({ ...f, bankNote: e.target.value }))}
        />
      </FormField>
    </div>
  );
}

// 还款日检测提醒
function checkMortgageDue() {
  const loans = DataStore.getMortgageLoans();
  const today = new Date();
  const day = today.getDate();
  const dueLoans = loans.filter(l => !l.settled && Number(l.monthlyPayDay) === day);
  return dueLoans;
}

// 暴露
Object.assign(window, {
  MortgageModule, checkMortgageDue,
});
