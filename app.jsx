// 主 App 组件 - 路由与状态管理
// 使用全局数据上下文，确保任何模块修改数据后所有组件都重新渲染

function App() {
  const [current, setCurrent] = React.useState('overview');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [bookModalOpen, setBookModalOpen] = React.useState(false);
  const [version, setVersion] = React.useState(0); // 数据版本，修改后自增触发全局刷新
  const [bgIndex, setBgIndex] = React.useState(0);
  
  // 确保数据加载（DataStore.load 在 data.jsx 末尾执行）
  React.useEffect(() => {
    setBgIndex(DataStore.getBgIndex());
    setBgImage(DataStore.getBgIndex());
    setVersion(v => v + 1);
    
    // 还款日检测
    setTimeout(() => {
      const due = checkMortgageDue();
      if (due.length > 0) {
        const names = due.map(l => l.name).join('、');
        showConfirm({
          title: '🔔 还款日提醒',
          message: `今天是「${names}」的还款日，请记得按时还款哦～`,
          confirmText: '去记录',
          cancelText: '知道了',
        }).then(ok => {
          if (ok) setCurrent('mortgage');
        });
      }
    }, 800);
  }, []);
  
  // 设置背景图
  const setBgImage = (idx) => {
    const layer = document.getElementById('bg-layer');
    if (layer) {
      layer.style.backgroundImage = `url(${BG_IMAGES[idx % BG_IMAGES.length]})`;
    }
  };
  
  // 全局刷新方法 - 任何模块修改数据后调用
  const refresh = React.useCallback(() => {
    setVersion(v => v + 1);
  }, []);
  
  const handleBgChange = () => {
    const next = (bgIndex + 1) % BG_IMAGES.length;
    setBgIndex(next);
    setBgImage(next);
    DataStore.nextBg(BG_IMAGES.length);
  };
  
  const handleBookSwitch = (bookId) => {
    DataStore.switchBook(bookId);
    refresh();
  };
  
  const handleAddBook = (name) => {
    const book = DataStore.addBook(name, '📒', '#ff8fb3');
    // 给新账本加默认账户
    DataStore.data.accounts.push(
      { id: uid('acc'), bookId: book.id, name: '默认账户', type: 'digital', balance: 0, icon: '💳', color: '#f075a0' }
    );
    DataStore.save();
    refresh();
  };
  
  const currentMod = MODULES.find(m => m.key === current);
  
  // 渲染当前模块
  const renderModule = () => {
    const props = { refresh, version };
    switch (current) {
      case 'overview': return <OverviewModule {...props} onNavigate={setCurrent} onBookClick={() => setBookModalOpen(true)} />;
      case 'detail': return <DetailModule {...props} />;
      case 'stats': return <StatsModule {...props} />;
      case 'report': return <ReportModule {...props} />;
      case 'budget': return <BudgetModule {...props} />;
      case 'account': return <AccountModule {...props} />;
      case 'finance': return <FinanceModule {...props} />;
      case 'loan': return <LoanModule {...props} />;
      case 'goal': return <GoalModule {...props} />;
      case 'template': return <TemplateModule {...props} />;
      case 'recurring': return <RecurringModule {...props} />;
      case 'book': return <BookModule {...props} onSwitch={refresh} />;
      case 'calendar': return <CalendarModule {...props} />;
      case 'settings': return <SettingsModule {...props} onBgChange={handleBgChange} bgCount={BG_IMAGES.length} />;
      case 'mortgage': return <MortgageModule {...props} onNavigate={setCurrent} />;
      default: return <OverviewModule {...props} onNavigate={setCurrent} />;
    }
  };
  
  return (
    <div className="app-container">
        <Banner 
          module={currentMod} 
          onMenuClick={() => setDrawerOpen(true)} 
          onBack={current === 'mortgage' ? () => setCurrent('overview') : null}
        />
        
        <div className="page-content">
          {/* 账本快速切换条 */}
          {current !== 'book' && (
            <div 
              className="card" 
              style={{ 
                padding: '10px 14px', 
                marginBottom: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer',
              }}
              onClick={() => setBookModalOpen(true)}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: DataStore.getCurrentBook()?.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>{DataStore.getCurrentBook()?.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{DataStore.getCurrentBook()?.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-mute)' }}>点击切换其他账本</div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--pink-500)' }}>切换 ›</span>
            </div>
          )}
          
          {renderModule()}
        </div>
        
        <TabBar
          current={current}
          onChange={setCurrent}
          onMoreClick={() => setDrawerOpen(true)}
        />
        
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          current={current}
          onSelect={setCurrent}
        />
        
        <BookSwitchModal
          open={bookModalOpen}
          onClose={() => setBookModalOpen(false)}
          books={DataStore.getBooks()}
          currentId={DataStore.getCurrentBook()?.id}
          onSwitch={handleBookSwitch}
          onAdd={handleAddBook}
        />
        
        <ConfirmModal />
    </div>
  );
}

// 启动
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
