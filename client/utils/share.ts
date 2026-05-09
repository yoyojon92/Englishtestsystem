/**
 * 分享工具函数
 * 前端使用
 */

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

/**
 * 生成分享链接
 */
export async function generateShareLink(params: {
  testId: string;
  source: string;
  refId: string;
  level?: string;
  channel?: string;
  entryPoint?: string;
}) {
  const response = await fetch(`${API_BASE}/api/v1/share/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  return data.data;
}

/**
 * 记录用户行为
 */
export async function trackShareAction(action: string, params: any) {
  const response = await fetch(`${API_BASE}/api/v1/share/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params }),
  });
  const data = await response.json();
  return data;
}

/**
 * 获取渠道统计
 */
export async function getChannelStats(source?: string, channel?: string) {
  const query = new URLSearchParams();
  if (source) query.append('source', source);
  if (channel) query.append('channel', channel);
  
  const response = await fetch(`${API_BASE}/api/v1/share/stats?${query.toString()}`);
  const data = await response.json();
  return data.data;
}

/**
 * 获取渠道列表
 */
export function getSourceList() {
  return [
    { value: 'wechat', label: '微信' },
    { value: 'mini_program', label: '小程序' },
    { value: 'xhs', label: '小红书' },
    { value: 'douyin', label: '抖音' },
    { value: 'friend', label: '朋友圈' },
    { value: 'qr_code', label: '二维码' },
    { value: 'sms', label: '短信' },
    { value: 'email', label: '邮件' },
    { value: 'other', label: '其他' },
  ];
}

/**
 * 获取 DeepLink (APP跳转)
 */
export async function getDeeplink(params: {
  testId: string;
  source: string;
  refId: string;
  platform: 'ios' | 'android';
}) {
  const query = new URLSearchParams(params as any);
  const response = await fetch(`${API_BASE}/api/v1/share/deeplink?${query.toString()}`);
  const data = await response.json();
  return data.data;
}

/**
 * 分享到微信 (Web环境使用网页分享)
 */
export function getWebShareData(title: string, description: string, url: string, imageUrl?: string) {
  return {
    title,
    description,
    url,
    imageUrl,
  };
}
