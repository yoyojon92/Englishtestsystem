import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// 二维码存储（内存，实际应存入数据库）
const qrCodeChannels: Map<string, any> = new Map();

/**
 * 生成唯一渠道ID
 */
function generateChannelId(): string {
  return `CH${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

/**
 * 生成短链接
 */
function generateShortUrl(longUrl: string): string {
  const hash = crypto.createHash('md5').update(longUrl).digest('hex');
  return hash.substring(0, 8);
}

/**
 * 生成二维码
 * POST /api/v1/qrcode/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      url,
      channelName,
      channelType = 'general',
      schoolId,
      teacherId,
      size = 300,
    } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const channelId = generateChannelId();
    const shortCode = generateShortUrl(url);
    
    // 构建H5落地页URL（带渠道参数）
    const landingUrl = new URL(url);
    landingUrl.searchParams.set('channel', channelId);
    const fullUrl = landingUrl.toString();

    // 生成二维码内容（可以是URL或参数化的短码）
    const qrContent = fullUrl;

    // 调用二维码生成服务（这里使用草料二维码API作为示例）
    // 实际项目中可以替换为自建的二维码生成服务
    let qrCodeUrl = '';
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/`;
      const params = new URLSearchParams({
        size: `${size}x${size}`,
        data: qrContent,
        format: 'png',
        margin: '10',
      });
      qrCodeUrl = `${qrApiUrl}?${params.toString()}`;
    } catch (e) {
      // 如果第三方API失败，返回占位符
      qrCodeUrl = '';
    }

    // 存储渠道信息
    const channelInfo = {
      channelId,
      shortCode,
      channelName: channelName || `渠道${channelId}`,
      channelType,
      url,
      qrCodeUrl,
      schoolId: schoolId || null,
      teacherId: teacherId || null,
      scanCount: 0,
      conversionCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    qrCodeChannels.set(channelId, channelInfo);

    res.json({
      success: true,
      data: {
        channelId,
        shortCode,
        qrCodeUrl,
        landingUrl: fullUrl,
        channelInfo,
      },
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

/**
 * 获取二维码列表
 * GET /api/v1/qrcode/list
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { schoolId, channelType, page = 1, pageSize = 20 } = req.query;
    
    let channels = Array.from(qrCodeChannels.values());
    
    // 按学校筛选
    if (schoolId) {
      channels = channels.filter((c: any) => c.schoolId === schoolId);
    }
    
    // 按类型筛选
    if (channelType) {
      channels = channels.filter((c: any) => c.channelType === channelType);
    }
    
    // 分页
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedChannels = channels.slice(start, end);
    
    res.json({
      success: true,
      data: {
        list: paginatedChannels,
        total: channels.length,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error('List QR codes error:', error);
    res.status(500).json({ error: 'Failed to list QR codes' });
  }
});

/**
 * 获取单个二维码详情
 * GET /api/v1/qrcode/:channelId
 */
router.get('/:channelId', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params as { channelId: string };
    
    const channel = qrCodeChannels.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json({
      success: true,
      data: channel,
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to get QR code' });
  }
});

/**
 * 获取二维码统计数据
 * GET /api/v1/qrcode/:channelId/stats
 */
router.get('/:channelId/stats', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params as { channelId: string };
    
    const channel = qrCodeChannels.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // 计算转化率
    const conversionRate = channel.scanCount > 0
      ? ((channel.conversionCount / channel.scanCount) * 100).toFixed(2)
      : '0.00';
    
    res.json({
      success: true,
      data: {
        channelId,
        channelName: channel.channelName,
        scanCount: channel.scanCount,
        conversionCount: channel.conversionCount,
        conversionRate: `${conversionRate}%`,
        dailyStats: [
          // 模拟每日数据
          { date: '2024-01-01', scans: 45, conversions: 12 },
          { date: '2024-01-02', scans: 52, conversions: 15 },
          { date: '2024-01-03', scans: 38, conversions: 10 },
          { date: '2024-01-04', scans: 61, conversions: 18 },
          { date: '2024-01-05', scans: 55, conversions: 16 },
        ],
      },
    });
  } catch (error) {
    console.error('Get QR code stats error:', error);
    res.status(500).json({ error: 'Failed to get QR code stats' });
  }
});

/**
 * 更新二维码扫描/转化数据
 * POST /api/v1/qrcode/:channelId/track
 */
router.post('/:channelId/track', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params as { channelId: string };
    const { eventType } = req.body; // 'scan' or 'conversion'
    
    const channel = qrCodeChannels.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    if (eventType === 'conversion') {
      channel.conversionCount = (channel.conversionCount || 0) + 1;
    } else {
      channel.scanCount = (channel.scanCount || 0) + 1;
    }
    
    qrCodeChannels.set(channelId, channel);
    
    res.json({
      success: true,
      data: { scanCount: channel.scanCount, conversionCount: channel.conversionCount },
    });
  } catch (error) {
    console.error('Track QR code error:', error);
    res.status(500).json({ error: 'Failed to track QR code' });
  }
});

/**
 * 删除二维码
 * DELETE /api/v1/qrcode/:channelId
 */
router.delete('/:channelId', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params as { channelId: string };
    
    if (!qrCodeChannels.has(channelId)) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    qrCodeChannels.delete(channelId);
    
    res.json({
      success: true,
      message: 'QR code deleted successfully',
    });
  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({ error: 'Failed to delete QR code' });
  }
});

/**
 * 生成批量二维码
 * POST /api/v1/qrcode/batch
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { urls, channelName, channelType = 'batch', size = 300 } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }
    
    const results = [];
    for (const urlInfo of urls) {
      const { url, name } = urlInfo;
      const channelId = generateChannelId();
      const shortCode = generateShortUrl(url);
      
      // 构建带渠道参数的URL
      const landingUrl = new URL(url);
      landingUrl.searchParams.set('channel', channelId);
      const fullUrl = landingUrl.toString();
      
      // 生成二维码
      let qrCodeUrl = '';
      try {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/`;
        const params = new URLSearchParams({
          size: `${size}x${size}`,
          data: fullUrl,
          format: 'png',
          margin: '10',
        });
        qrCodeUrl = `${qrApiUrl}?${params.toString()}`;
      } catch (e) {
        // ignore
      }
      
      const channelInfo = {
        channelId,
        shortCode,
        channelName: name || channelName || `批量渠道${channelId}`,
        channelType,
        url,
        qrCodeUrl,
        scanCount: 0,
        conversionCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      qrCodeChannels.set(channelId, channelInfo);
      results.push(channelInfo);
    }
    
    res.json({
      success: true,
      data: {
        count: results.length,
        list: results,
      },
    });
  } catch (error) {
    console.error('Batch generate QR codes error:', error);
    res.status(500).json({ error: 'Failed to batch generate QR codes' });
  }
});

export default router;
