// 分享追踪路由
import { Router } from 'express';
import * as shareLink from '../utils/shareLink';

const router = Router();

/**
 * POST /api/v1/share/generate
 * 生成分享链接
 */
router.post('/generate', (req, res) => {
  try {
    const { test_id, source, ref_id } = req.body;
    const url = shareLink.generateShareLink(test_id, source, ref_id);
    res.json({ success: true, data: { url } });
  } catch (error) {
    res.status(500).json({ success: false, error: '生成链接失败' });
  }
});

/**
 * POST /api/v1/share/track
 * 记录行为
 */
router.post('/track', (req, res) => {
  try {
    const { action, params } = req.body;
    const result = shareLink.recordLinkClick({ action, ...params });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: '记录失败' });
  }
});

/**
 * GET /api/v1/share/stats
 * 获取渠道统计
 */
router.get('/stats', (req, res) => {
  try {
    const stats = shareLink.getChannelStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取统计失败' });
  }
});

export default router;
