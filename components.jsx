// 通用组件

// ===== Banner 组件（带随机 emoji 装饰）=====
const BANNER_EMOJIS = ['🐱','🐾','💕','🌸','✨','🎀','🍰','🧁','🍓','🍒','🌷','🌻','🦋','🌈','⭐','💖','🎂','🍭','🍬','🌺','🍀','🌙','☀️','🐟'];

function generateEmojiPositions() {
  // 4列 x 2行的网格，每个格子内随机抖动
  const cols = 4;
  const rows = 2;
  const shuffled = [...BANNER_EMOJIS].sort(() => Math.random() - 0.5).slice(0, 8);
  const positions = [];
  
  // 先按行列分配
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ row: r, col: c });
    }
  }
  
  shuffled.forEach((emoji, i) => {
    const cell = cells[i];
    const cellW = 100 / cols; // 百分比
    const cellH = 100 / rows;
    const left = cell.col * cellW + (Math.random() * cellW * 0.6 + cellW * 0.2); // 20%-80% 范围内
    const top = cell.row * cellH + (Math.random() * cellH * 0.6 + cellH * 0.2);
    const rotate = (Math.random() - 0.5) * 22; // ±11°
    const size = 17 + Math.random() * 5; // 17-22px
    const opacity = 0.34 + Math.random() * 0.16; // 0.34-0.50
    positions.push({ emoji, left: left.toFixed(1) + '%', top: top.toFixed(1) + '%', rotate, size, opacity });
  });
  
  return positions;
}

function Banner({ module, onMenuClick, onBack, onCloudSync }) {
  const [emojis, setEmojis] = React.useState([]);
  const [syncing, setSyncing] = React.useState(false);
  
  React.useEffect(() => {
    setEmojis(generateEmojiPositions());
  }, [module.key]);

  const handleQuickSync = async () => {
    if (syncing) return;
    const cfg = getCloudConfig();
    if (!cfg.token) {
      alert('请先在「设置」中配置 GitHub 令牌');
      return;
    }
    setSyncing(true);
    try {
      await uploadToCloud();
      alert('✅ 已同步到云端');
    } catch (e) {
      alert('❌ 同步失败：' + e.message);
    } finally {
      setSyncing(false);
    }
  };
  
  const avatarSrc = `assets/cat${module.catAvatar}.jpg`;
  
  return (
    <div className="banner">
      {emojis.map((e, i) => (
        <span key={i} className="banner-emoji" style={{
          left: e.left,
          top: e.top,
          fontSize: e.size + 'px',
          opacity: e.opacity,
          transform: `rotate(${e.rotate}deg)`,
        }}>{e.emoji}</span>
      ))}
      {onBack ? (
        <button 
          className="hamburger-btn" 
          onClick={onBack} 
          title="返回"
          style={{ fontSize: '20px', fontWeight: 700 }}
        >
          ‹
        </button>
      ) : (
        <div className="banner-avatar">
          <img src={avatarSrc} alt="avatar" />
        </div>
      )}
      <div className="banner-text">
        <div className="banner-title">{module.name}</div>
        <div className="banner-subtitle">{module.subtitle}</div>
      </div>
      {onBack ? null : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="hamburger-btn"
            onClick={handleQuickSync}
            title="云同步"
            style={{ fontSize: '16px', opacity: syncing ? 0.5 : 1 }}
          >
            {syncing ? '⏳' : '☁️'}
          </button>
          <button className="hamburger-btn" onClick={onMenuClick} title="菜单">
            ☰
          </button>
        </div>
      )}
    </div>
  );
}

// ===== 底部 Tab Bar（5个主要模块 + 更多）=====
const MAIN_TABS = ['overview', 'detail', 'stats', 'budget', 'settings'];

function TabBar({ current, onChange, onMoreClick }) {
  return (
    <div className="tab-bar">
      {MAIN_TABS.map(key => {
        const mod = MODULES.find(m => m.key === key);
        return (
          <div
            key={key}
            className={`tab-item ${current === key ? 'active' : ''}`}
            onClick={() => onChange(key)}
          >
            <span className="tab-icon">{mod.icon}</span>
            <span>{mod.name}</span>
          </div>
        );
      })}
      <div className="tab-item" onClick={onMoreClick}>
        <span className="tab-icon">☰</span>
        <span>更多</span>
      </div>
    </div>
  );
}

// ===== 侧边抽屉 =====
function Drawer({ open, onClose, current, onSelect }) {
  const currentMod = MODULES.find(m => m.key === current);
  
  return (
    <>
      <div className={`drawer-mask ${open ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`drawer ${open ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="big-avatar">
            <img src={`assets/cat${currentMod ? currentMod.catAvatar : 1}.jpg`} alt="avatar" />
          </div>
          <div className="drawer-header-info">
            <h3>喵账 · 工作台</h3>
            <p>数据只存在你的设备里</p>
          </div>
        </div>
        <div className="drawer-list">
          {MODULES.map(mod => (
            <div
              key={mod.key}
              className={`drawer-item ${current === mod.key ? 'active' : ''}`}
              onClick={() => { onSelect(mod.key); onClose(); }}
            >
              <div className="drawer-icon">{mod.icon}</div>
              <span>{mod.name}</span>
            </div>
          ))}
        </div>
        <div className="drawer-footer">
          v1.0 · Made with 💕 by 妙搭
        </div>
      </div>
    </>
  );
}

// ===== 账本切换弹窗 =====
function BookSwitchModal({ open, onClose, books, currentId, onSwitch, onAdd }) {
  const [newName, setNewName] = React.useState('');
  
  if (!open) return null;
  
  return (
    <div className="modal-mask open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">切换账本</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {books.map(book => (
            <div
              key={book.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '16px',
                background: book.id === currentId 
                  ? 'linear-gradient(135deg, rgba(255,143,179,0.2), rgba(255,214,231,0.5))'
                  : 'rgba(255,245,248,0.6)',
                border: book.id === currentId ? '2px solid #ff8fb3' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => { onSwitch(book.id); onClose(); }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: book.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>{book.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{book.name}</div>
                {book.id === currentId && (
                  <div style={{ fontSize: '11px', color: '#f075a0', marginTop: '2px' }}>当前账本</div>
                )}
              </div>
              {book.id === currentId && <div style={{ color: '#ff8fb3', fontSize: '18px' }}>✓</div>}
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(255,143,179,0.2)' }}>
          <div style={{ fontSize: '13px', color: '#8a6b78', marginBottom: '10px' }}>新建账本</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="输入账本名称"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '12px',
                border: '1px solid #ffd6e7', fontSize: '14px',
                background: '#fff8f8', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button className="btn btn-primary" onClick={() => {
              if (newName.trim()) {
                onAdd(newName.trim());
                setNewName('');
              }
            }}>新建</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 通用卡片包装 =====
function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={{ padding: '16px', ...style }}>
      {children}
    </div>
  );
}

// ===== 金额格式化 =====
function formatMoney(n) {
  if (n === undefined || n === null || isNaN(n)) return '0.00';
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===== 分类图标组件 =====
function CategoryIcon({ category, size = 42, style = {} }) {
  const cat = CATEGORIES.find(c => c.key === category);
  if (!cat) return null;
  return (
    <div className={`tx-cat-icon cat-${cat.color}`} style={{ width: size, height: size, fontSize: size * 0.48, ...style }}>
      {cat.icon}
    </div>
  );
}

// ===== 通用表单弹窗 =====
function FormModal({ open, title, onClose, onSubmit, children, submitText = '保存' }) {
  if (!open) return null;
  return (
    <div className="modal-mask open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onSubmit}>{submitText}</button>
        </div>
      </div>
    </div>
  );
}

// ===== 通用输入控件 =====
function FormField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange ? onChange(e.target.value) : null}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: '12px',
        border: '1px solid #ffd6e7', fontSize: '14px',
        background: '#fff8f8', outline: 'none',
        fontFamily: 'inherit', color: 'var(--text-main)',
      }}
      onFocus={e => e.target.style.borderColor = '#ff8fb3'}
      onBlur={e => e.target.style.borderColor = '#ffd6e7'}
    />
  );
}

function NumberInput({ value, onChange, placeholder, prefix = '' }) {
  return (
    <div style={{ position: 'relative' }}>
      {prefix && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', fontSize: '14px' }}>{prefix}</span>}
      <input
        type="number"
        value={value ?? ''}
        onChange={e => onChange ? onChange(parseFloat(e.target.value) || 0) : null}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px',
          paddingLeft: prefix ? '28px' : '14px',
          borderRadius: '12px',
          border: '1px solid #ffd6e7', fontSize: '14px',
          background: '#fff8f8', outline: 'none',
          fontFamily: 'inherit', color: 'var(--text-main)',
        }}
      />
    </div>
  );
}

// 分类选择器
function CategoryPicker({ value, onChange, type = 'expense' }) {
  const cats = CATEGORIES.filter(c => c.type === type);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {cats.map(cat => {
        const selected = value === cat.key;
        return (
          <div
            key={cat.key}
            onClick={() => onChange && onChange(cat.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: selected ? 700 : 500,
              background: selected ? `var(--pink-500)` : 'rgba(255,143,179,0.1)',
              color: selected ? '#fff' : 'var(--text-main)',
              border: selected ? 'none' : '1px solid rgba(255,143,179,0.2)',
              transition: 'all 0.15s',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </div>
        );
      })}
    </div>
  );
}

// 类型切换（收入/支出）
function TypeToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '14px', background: 'rgba(255,143,179,0.1)' }}>
      <button
        onClick={() => onChange && onChange('expense')}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: '10px',
          border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          background: value === 'expense' ? '#e55b7f' : 'transparent',
          color: value === 'expense' ? '#fff' : 'var(--text-sub)',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >支出</button>
      <button
        onClick={() => onChange && onChange('income')}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: '10px',
          border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          background: value === 'income' ? '#3bb273' : 'transparent',
          color: value === 'income' ? '#fff' : 'var(--text-sub)',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >收入</button>
    </div>
  );
}

// Toast
function showToast(msg, duration = 1500) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    padding: 10px 20px; background: rgba(74,46,58,0.85); color: #fff;
    border-radius: 20px; font-size: 13px; z-index: 9999;
    font-family: Nunito, sans-serif;
  `;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, duration);
}

// 确认弹窗 - 用全局状态和 React 渲染
let _confirmHandler = null;
let _confirmConfig = { title: '确认', message: '', onConfirm: null, onCancel: null, confirmText: '确定', cancelText: '取消', danger: false };

function showConfirm(config) {
  _confirmConfig = { ..._confirmConfig, ...config };
  if (_confirmHandler) _confirmHandler(_confirmConfig);
  return new Promise((resolve) => {
    _confirmConfig.onConfirm = () => resolve(true);
    _confirmConfig.onCancel = () => resolve(false);
    if (_confirmHandler) _confirmHandler({ ..._confirmConfig, visible: true });
  });
}

function ConfirmModal() {
  const [config, setConfig] = React.useState({ ..._confirmConfig, visible: false });
  
  React.useEffect(() => {
    _confirmHandler = setConfig;
    return () => { _confirmHandler = null; };
  }, []);
  
  if (!config.visible) return null;
  
  const handleConfirm = () => {
    setConfig(c => ({ ...c, visible: false }));
    config.onConfirm && config.onConfirm();
  };
  
  const handleCancel = () => {
    setConfig(c => ({ ...c, visible: false }));
    config.onCancel && config.onCancel();
  };
  
  return (
    <div className="modal-mask open" onClick={handleCancel}>
      <div className="modal" style={{ maxWidth: '300px', borderRadius: '20px', margin: 'auto', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{config.title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '18px' }}>
          {config.message}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleCancel}>{config.cancelText}</button>
          <button 
            className="btn" 
            style={{ flex: 1, background: config.danger ? '#e55b7f' : 'var(--pink-500)', color: '#fff' }} 
            onClick={handleConfirm}
          >{config.confirmText}</button>
        </div>
      </div>
    </div>
  );
}

// 浮动添加按钮
function FabButton({ onClick, label = '记一笔' }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '88px',
        right: 'calc(50% - 240px + 20px)',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff9dc0, #ff75a0)',
        color: '#fff',
        border: 'none',
        fontSize: '26px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(255,117,160,0.45)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      title={label}
    >+</button>
  );
}

// 暴露
Object.assign(window, {
  Banner, TabBar, Drawer, BookSwitchModal, Card, formatMoney, CategoryIcon,
  FormModal, FormField, TextInput, NumberInput, CategoryPicker, TypeToggle,
  showToast, FabButton, ConfirmModal, showConfirm,
});
