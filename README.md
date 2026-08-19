# 喵账 · 记账工作台 ☁️ 云同步版

一款软萌可爱的记账小工具，支持 GitHub 云同步，可在手机浏览器中永久使用。

## 🌐 访问地址

**https://ttxuan-xingjo.github.io/miao-ledger-workbench/**

手机浏览器打开即可使用，建议添加到主屏幕。

## ✨ 功能特性

- 📊 15 个功能模块：概览、明细、统计、报表、预算、账户、理财、借贷、目标、模板、周期、账本、日历、设置、贷款还款
- 📒 多账本独立管理
- ☁️ **GitHub 云同步**：数据一键备份到 GitHub 仓库，换设备/清缓存后可恢复
- 🎨 5 套背景主题切换
- 📱 移动端适配，手机浏览器直接使用

## ☁️ 云同步使用方法

1. 打开应用，进入底部「设置」页面
2. 在「☁️ 云同步」区域填入你的 GitHub Personal Access Token（需要 `repo` 权限）
3. 点击「☁️ 上传到云端」备份数据
4. 在新设备上打开同一网址，填入相同令牌，点击「📥 从云端恢复」即可同步
5. 顶部 Banner 的 ☁️ 按钮可快速一键上传

> 令牌仅保存在你本机浏览器的 localStorage 中，不会上传到任何服务器。

## 🛠️ 技术栈

- 纯前端：React 18 + Babel Standalone（浏览器端编译）
- 图表：ECharts 5
- 数据存储：localStorage + GitHub Contents API（云同步）
- 托管：GitHub Pages（永久免费）

## 📁 项目结构

```
├── index.html        # 入口页面
├── app.jsx           # 主应用组件（路由与状态管理）
├── data.jsx          # 数据层（DataStore + localStorage）
├── cloudsync.jsx     # 云同步模块（GitHub API）
├── components.jsx    # 通用组件（Banner、TabBar、Drawer 等）
├── modules1.jsx      # 功能模块 1
├── modules2.jsx      # 功能模块 2（含设置页）
├── modules3.jsx      # 功能模块 3
├── styles.css        # 样式表
└── assets/           # 图片资源
```

---

Made with 💕
