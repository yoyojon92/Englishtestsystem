/**
 * 分享链接参数和签名验证模块
 * 参考文档: 英语诊断测试与转化系统-扣子(Coze)移动端APP开发指令 v1.0
 */

import * as crypto from 'crypto';

// 签名密钥 (生产环境应从环境变量读取)
const SIGN_SECRET = process.env.SHARE_LINK_SECRET || 'nutshell_english_secret_key';

// 分享链接域名
export const SHARE_DOMAIN = process.env.SHARE_DOMAIN || 'https://example.com';

// 分享链接参数接口
export interface ShareParams{
  test_id: string;      // 测试模板ID (必填)
  source: string;       // 来源渠道 (必填): wechat/mini_program/xhs/douyin
  ref_id: string;        // 推荐人/分享者ID (必填)
  level?: string;        // 指定测试级别: KET/PET/FCE (可选)
  channel?: string;      // 细分渠道: friend/moments/search (可选)
  entry_point?: string;  // 入口点位: banner/chatbot/article (可选)
  utm_source?: string;   // UTM来源 (可选)
  utm_medium?: string;   // UTM媒介 (可选)
  utm_campaign?: string; // UTM活动 (可选)
  _t: number;           // 时间戳(秒) (必填)
  sign: string;          // 签名(防篡改) (必填)
}

/**
 * 生成链接签名
 */
export function generateLinkSign(testId: string, source: string, refId: string): string {
  const date = Math.floor(Date.now() / 1000);
  const raw = `${testId}_${source}_${refId}_${date}`;
  return md5(`${raw}_${SIGN_SECRET}`).substring(0, 16);
}

/**
 * 验证链接签名
 */
export function verifyLinkSign(params: ShareParams): boolean {
  const { sign, test_id, source, ref_id, _t, ...rest } = params;
  
  // 检查时间戳是否过期 (7天)
  const now = Math.floor(Date.now() / 1000);
  if (now - _t > 7 * 24 * 60 * 60) {
    console.warn('[ShareLink] Link expired:', { _t, now });
    return false;
  }
  
  // 重新计算签名
  const date = Math.floor(_t / (24 * 60 * 60));
  const raw = `${test_id}_${source}_${ref_id}_${date}`;
  const expectedSign = md5(`${raw}_${SIGN_SECRET}`).substring(0, 16);
  
  return sign === expectedSign;
}

/**
 * 解析分享链接参数
 */
export function parseShareParams(url: string): ShareParams | null {
  try {
    const urlObj = new URL(url);
    const params: ShareParams = {
      test_id: urlObj.searchParams.get('test_id') || '',
      source: urlObj.searchParams.get('source') || '',
      ref_id: urlObj.searchParams.get('ref_id') || '',
      level: urlObj.searchParams.get('level') || undefined,
      channel: urlObj.searchParams.get('channel') || undefined,
      entry_point: urlObj.searchParams.get('entry_point') || undefined,
      utm_source: urlObj.searchParams.get('utm_source') || undefined,
      utm_medium: urlObj.searchParams.get('utm_medium') || undefined,
      utm_campaign: urlObj.searchParams.get('utm_campaign') || undefined,
      _t: parseInt(urlObj.searchParams.get('_t') || '0'),
      sign: urlObj.searchParams.get('sign') || '',
    };
    
    // 验证必填参数
    if (!params.test_id || !params.source || !params.ref_id) {
      console.warn('[ShareLink] Missing required params:', { test_id: params.test_id, source: params.source, ref_id: params.ref_id });
      return null;
    }
    
    return params;
  } catch (error) {
    console.error('[ShareLink] Failed to parse URL:', error);
    return null;
  }
}

/**
 * 生成分享链接
 */
export function generateShareLink(
  testId: string,
  source: string,
  refId: string,
  options?: {
    level?: string;
    channel?: string;
    entryPoint?: string;
  }
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = generateLinkSign(testId, source, refId);
  
  const params = new URLSearchParams({
    test_id: testId,
    source,
    ref_id: refId,
    _t: timestamp.toString(),
    sign,
  });
  
  if (options?.level) params.append('level', options.level);
  if (options?.channel) params.append('channel', options.channel);
  if (options?.entryPoint) params.append('entry_point', options.entryPoint);
  
  return `${SHARE_DOMAIN}/test/entry?${params.toString()}`;
}

// 简单的MD5实现
function md5(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * 渠道统计接口
 */
export interface ChannelStats{
  channel: string;
  source: string;
  clicks: number;
  test_starts: number;
  test_completions: number;
  conversions: number;
  conversion_rate: number;
}

// 渠道统计存储 (内存)
const channelStats: Map<string, ChannelStats> = new Map();

/**
 * 记录链接点击
 */
export function recordLinkClick(params: ShareParams): void {
  const key = `${params.source}_${params.channel || 'unknown'}`;
  const stats = channelStats.get(key) || {
    channel: params.channel || 'unknown',
    source: params.source,
    clicks: 0,
    test_starts: 0,
    test_completions: 0,
    conversions: 0,
    conversion_rate: 0,
  };
  stats.clicks++;
  channelStats.set(key, stats);
  
  console.log('[ShareLink] Click recorded:', { key, clicks: stats.clicks });
}

/**
 * 记录测试开始
 */
export function recordTestStart(params: ShareParams): void {
  const key = `${params.source}_${params.channel || 'unknown'}`;
  const stats = channelStats.get(key);
  if (stats) {
    stats.test_starts++;
    channelStats.set(key, stats);
  }
}

/**
 * 记录测试完成
 */
export function recordTestCompletion(params: ShareParams): void {
  const key = `${params.source}_${params.channel || 'unknown'}`;
  const stats = channelStats.get(key);
  if (stats) {
    stats.test_completions++;
    updateConversionRate(key);
    channelStats.set(key, stats);
  }
}

/**
 * 记录转化
 */
export function recordConversion(params: ShareParams): void {
  const key = `${params.source}_${params.channel || 'unknown'}`;
  const stats = channelStats.get(key);
  if (stats) {
    stats.conversions++;
    updateConversionRate(key);
    channelStats.set(key, stats);
  }
}

/**
 * 更新转化率
 */
function updateConversionRate(key: string): void {
  const stats = channelStats.get(key);
  if (stats && stats.clicks > 0) {
    stats.conversion_rate = Math.round((stats.conversions / stats.clicks) * 10000) / 100;
  }
}

/**
 * 获取渠道统计
 */
export function getChannelStats(source?: string, channel?: string): ChannelStats[] {
  if (source && channel) {
    const stats = channelStats.get(`${source}_${channel}`);
    return stats ? [stats] : [];
  }
  if (source) {
    return Array.from(channelStats.values()).filter(s => s.source === source);
  }
  return Array.from(channelStats.values());
}

// 导出类型

