// 云同步模块 - 通过 GitHub Contents API 将数据同步到仓库
const CLOUD_CONFIG_KEY = 'miao_cloud_config';
const CLOUD_LAST_SYNC_KEY = 'miao_cloud_last_sync';
const SYNC_FILENAME = 'sync_data.json';

// 默认仓库配置（可在设置中修改）
const DEFAULT_CLOUD_CONFIG = {
  owner: 'TTXuan-XingJo',
  repo: 'miao-ledger-workbench',
  branch: 'main',
  token: '',
};

// 读取云同步配置
function getCloudConfig() {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...DEFAULT_CLOUD_CONFIG };
}

// 保存云同步配置
function saveCloudConfig(config) {
  const merged = { ...getCloudConfig(), ...config };
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(merged));
  return merged;
}

// 获取最后同步时间
function getLastSync() {
  return localStorage.getItem(CLOUD_LAST_SYNC_KEY) || '';
}

function setLastSync(time) {
  localStorage.setItem(CLOUD_LAST_SYNC_KEY, time);
}

// GitHub API 请求封装
async function githubApi(method, path, body = null, token) {
  const config = getCloudConfig();
  const authToken = token || config.token;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (authToken) {
    headers['Authorization'] = `token ${authToken}`;
  }
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const url = `https://api.github.com${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `GitHub API ${res.status}`);
  }
  return data;
}

// 从云端获取文件内容（返回 { content, sha } 或 null）
async function fetchCloudFile() {
  const config = getCloudConfig();
  try {
    const data = await githubApi(
      'GET',
      `/repos/${config.owner}/${config.repo}/contents/${SYNC_FILENAME}?ref=${config.branch}`
    );
    // content 是 base64 编码
    const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
    return { content: JSON.parse(content), sha: data.sha };
  } catch (e) {
    if (e.message && e.message.includes('Not Found')) {
      return null; // 文件不存在
    }
    throw e;
  }
}

// 上传数据到云端
async function uploadToCloud(onProgress) {
  const config = getCloudConfig();
  if (!config.token) {
    throw new Error('请先在设置中填写 GitHub 令牌');
  }

  if (onProgress) onProgress('正在读取云端文件...');

  // 先获取现有文件的 SHA（用于更新）
  let existingSha = null;
  try {
    const existing = await fetchCloudFile();
    if (existing) existingSha = existing.sha;
  } catch (e) {
    // 文件不存在，正常创建
  }

  if (onProgress) onProgress('正在上传数据...');

  const payload = {
    message: `sync: ${new Date().toISOString()}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(DataStore.data, null, 2)))),
    branch: config.branch,
  };
  if (existingSha) {
    payload.sha = existingSha;
  }

  await githubApi(
    'PUT',
    `/repos/${config.owner}/${config.repo}/contents/${SYNC_FILENAME}`,
    payload
  );

  const now = new Date().toLocaleString('zh-CN');
  setLastSync(now);
  return now;
}

// 从云端下载并恢复数据
async function downloadFromCloud(onProgress) {
  const config = getCloudConfig();
  if (!config.token) {
    throw new Error('请先在设置中填写 GitHub 令牌');
  }

  if (onProgress) onProgress('正在从云端获取数据...');

  const file = await fetchCloudFile();
  if (!file) {
    throw new Error('云端还没有备份数据，请先上传一次');
  }

  if (onProgress) onProgress('正在恢复数据...');

  // 用云端数据替换本地数据
  DataStore.data = file.content;
  DataStore.save();

  const now = new Date().toLocaleString('zh-CN');
  setLastSync(now);
  return now;
}

// 检查云端是否有备份
async function checkCloudBackup() {
  try {
    const file = await fetchCloudFile();
    return file ? true : false;
  } catch (e) {
    return false;
  }
}

// 暴露到 window
Object.assign(window, {
  getCloudConfig,
  saveCloudConfig,
  getLastSync,
  setLastSync,
  uploadToCloud,
  downloadFromCloud,
  checkCloudBackup,
});
