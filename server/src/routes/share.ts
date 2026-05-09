/**
 * 分享链接 API 路由
 * 参考文档: 英语诊断测试与转化系统-扣子(Coze)移动端APP开发指令 v1.0
 * 
 * 功能:
 * - 生成带签名的分享链接
 * - 解析分享链接参数
 * - 渠道统计
 * - DeepLink 处理
 */

import { Router } from 'express';
import {
  generateShareLink,
  parseShareParams,
  verifyLinkSign,
  recordLinkClick,
  recordTestStart,
  recordTestCompletion,
  recordConversion,
  getChannelStats,
  SHARE_DOMAIN,
} from '../utils/shareLink';
import type { ShareParams, ChannelStats } from '../utils/shareLink';

const router = Router();

/**
 * POST /api/v1/share/generate
 * 生成分享链接
 * 
 * 请求体:
 * - test_id: string (必填) - 测试模板ID
 * - source: string (必填) - 来源渠道
 * - ref_id: string (必填) - 推荐人ID
 * - level?: string - 指定测试级别
 * - channel?: string - 细分渠道
 * - entry_point?: string - 入口点位
 * 
 * 返回:
 * - share_url: string - 完整分享链接
 * - short_url?: string - 短链接
 * - qr_code?: string - 二维码URL
 */
router.post('/generate', (req, res) => {
  try {
    const { test_id, source, ref_id, level, channel, entry_point } = req.body;
    
    // 参数校验
    if (!test_id || !source || !ref_id) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: test_id, source, ref_id',
      });
      return;
    }
    
    // 验证来源渠道
    const validSources = ['wechat', 'mini_program', 'xhs', 'douyin', 'friend', 'unknown'];
    if (!validSources.includes(source)) {
      res.status(400).json({
        success: false,
        error: `Invalid source: ${source}. Valid sources: ${validSources.join(', ')}`,
      });
      return;
    }
    
    // 生成分享链接
    const shareUrl = generateShareLink(test_id, source, ref_id, {
      level,
      channel,
      entryPoint: entry_point,
    });
    
    res.json({
      success: true,
      data: {
        share_url: shareUrl,
        domain: SHARE_DOMAIN,
        test_id,
        source,
        ref_id,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ShareAPI] Generate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate share link',
    });
  }
});

/**
 * GET /api/v1/share/parse
 * 解析分享链接参数
 * 
 * 查询参数:
 * - url: string (必填) - 要解析的分享链接
 * 
 * 返回:
 * - params: ShareParams - 解析后的参数
 * - valid: boolean - 签名是否有效
 * - channel_info: ChannelStats - 渠道统计
 */
router.get('/parse', (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing url parameter',
      });
      return;
    }
    
    // 解析参数
    const params = parseShareParams(url);
    
    if (!params) {
      res.status(400).json({
        success: false,
        error: 'Invalid share URL format',
      });
      return;
    }
    
    // 验证签名
    const valid = verifyLinkSign(params);
    
    // 记录点击
    if (valid) {
      recordLinkClick(params);
    }
    
    // 获取渠道统计
    const stats = getChannelStats(params.source, params.channel);
    
    res.json({
      success: true,
      data: {
        params,
        valid,
        channel_info: stats[0] || null,
      },
    });
  } catch (error) {
    console.error('[ShareAPI] Parse error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse share link',
    });
  }
});

/**
 * POST /api/v1/share/track
 * 记录用户行为
 * 
 * 请求体:
 * - action: string (必填) - 行为类型: click/start/complete/convert
 * - params: object (必填) - 分享链接参数
 * 
 * 行为类型:
 * - click: 链接点击
 * - start: 开始测试
 * - complete: 完成测试
 * - convert: 转化(预约/购买)
 */
router.post('/track', (req, res) => {
  try {
    const { action, params } = req.body;
    
    if (!action || !params) {
      res.status(400).json({
        success: false,
        error: 'Missing action or params',
      });
      return;
    }
    
    const shareParams = params as ShareParams;
    
    switch (action) {
      case 'click':
        recordLinkClick(shareParams);
        break;
      case 'start':
        recordTestStart(shareParams);
        break;
      case 'complete':
        recordTestCompletion(shareParams);
        break;
      case 'convert':
        recordConversion(shareParams);
        break;
      default:
        res.status(400).json({
          success: false,
          error: `Invalid action: ${action}`,
        });
        return;
    }
    
    res.json({
      success: true,
      data: {
        action,
        tracked_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ShareAPI] Track error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track action',
    });
  }
});

/**
 * GET /api/v1/share/stats
 * 获取渠道统计
 * 
 * 查询参数:
 * - source?: string - 按来源筛选
 * - channel?: string - 按渠道筛选
 * 
 * 返回:
 * - stats: ChannelStats[] - 渠道统计列表
 */
router.get('/stats', (req, res) => {
  try {
    const { source, channel } = req.query;
    
    const stats = getChannelStats(
      source as string | undefined,
      channel as string | undefined
    );
    
    // 计算汇总
    const summary = stats.reduce(
      (acc, stat) => ({
        total_clicks: acc.total_clicks + stat.clicks,
        total_test_starts: acc.total_test_starts + stat.test_starts,
        total_test_completions: acc.total_test_completions + stat.test_completions,
        total_conversions: acc.total_conversions + stat.conversions,
      }),
      { total_clicks: 0, total_test_starts: 0, total_test_completions: 0, total_conversions: 0 }
    );
    
    summary.total_conversion_rate = summary.total_clicks > 0
      ? Math.round((summary.total_conversions / summary.total_clicks) * 10000) / 100
      : 0;
    
    res.json({
      success: true,
      data: {
        stats,
        summary,
      },
    });
  } catch (error) {
    console.error('[ShareAPI] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
    });
  }
});

/**
 * GET /api/v1/share/deeplink
 * 生成 DeepLink (用于APP跳转)
 * 
 * 查询参数:
 * - test_id: string (必填)
 * - source: string (必填)
 * - ref_id: string (必填)
 * - platform: string (必填) - ios/android
 * 
 * 返回:
 * - deeplink: string - 应用的DeepLink URL
 * - universal_link?: string - iOS Universal Link
 * - app_link?: string - Android App Link
 */
router.get('/deeplink', (req, res) => {
  try {
    const { test_id, source, ref_id, platform } = req.query;
    
    if (!test_id || !source || !ref_id || !platform) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
      return;
    }
    
    // 生成基础链接
    const baseParams = new URLSearchParams({
      test_id: test_id as string,
      source: source as string,
      ref_id: ref_id as string,
      _t: Math.floor(Date.now() / 1000).toString(),
    });
    
    const webUrl = `${SHARE_DOMAIN}/test/entry?${baseParams.toString()}`;
    
    // 根据平台生成对应DeepLink
    let deeplink = '';
    let universalLink = '';
    let appLink = '';
    
    if (platform === 'ios') {
      universalLink = `https://${SHARE_DOMAIN.replace('https://', '')}/test/entry?${baseParams.toString()}`;
      deeplink = `nutshellenglish://test/entry?${baseParams.toString()}`;
    } else if (platform === 'android') {
      appLink = `https://${SHARE_DOMAIN.replace('https://', '')}/test/entry?${baseParams.toString()}`;
      deeplink = `intent://test/entry?${baseParams.toString()}#Intent;scheme=nutshellenglish;package=com.nutshell.english;end`;
    }
    
    res.json({
      success: true,
      data: {
        deeplink,
        universal_link: universalLink,
        app_link: appLink,
        web_url: webUrl,
        platform,
      },
    });
  } catch (error) {
    console.error('[ShareAPI] Deeplink error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate deeplink',
    });
  }
});

export default router;
