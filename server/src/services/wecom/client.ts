/**
 * 企业微信 API 封装
 * 官方文档: https://developer.work.weixin.qq.com/document/path/90000
 */

const WECOM_CONFIG = {
  corpId: process.env.WECOM_CORP_ID || 'YOUR_CORP_ID',
  corpSecret: process.env.WECOM_CORP_SECRET || 'YOUR_CORP_SECRET',
  agentId: process.env.WECOM_AGENT_ID || 'YOUR_AGENT_ID',
  apiBaseUrl: 'https://qyapi.weixin.qq.com/cgi-bin',
};

// 内存存储 Access Token（生产环境应使用 Redis）
let accessTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * 获取 Access Token
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // 检查缓存
  if (accessTokenCache && accessTokenCache.expiresAt > now) {
    return accessTokenCache.token;
  }

  const url = `${WECOM_CONFIG.apiBaseUrl}/gettoken?corpid=${WECOM_CONFIG.corpId}&corpsecret=${WECOM_CONFIG.corpSecret}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json() as { access_token?: string; expires_in?: number };
    
    if (data.access_token) {
      accessTokenCache = {
        token: data.access_token,
        expiresAt: now + ((data.expires_in || 7200) - 300) * 1000, // 提前5分钟过期
      };
      return data.access_token;
    }
    
    throw new Error((data as any).errmsg || 'Failed to get access token');
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}

/**
 * 发送应用消息
 * @see https://developer.work.weixin.qq.com/document/path/90236
 */
export async function sendMessage(message: {
  toUser: string | string[];
  msgType: 'text' | 'image' | 'news' | 'mpnews' | 'markdown';
  content: string;
  agentId?: string;
}): Promise<{ errcode: number; errmsg: string }> {
  const token = await getAccessToken();
  const url = `${WECOM_CONFIG.apiBaseUrl}/message/send?access_token=${token}`;
  
  const payload = {
    touser: Array.isArray(message.toUser) ? message.toUser.join('|') : message.toUser,
    msgtype: message.msgType,
    agentid: message.agentId || WECOM_CONFIG.agentId,
    [message.msgType]: message.msgType === 'text' 
      ? { content: message.content }
      : message.content,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return await response.json() as { errcode: number; errmsg: string };
}

/**
 * 发送文本消息
 */
export async function sendTextMessage(
  toUser: string | string[],
  content: string
): Promise<{ errcode: number; errmsg: string }> {
  return sendMessage({ toUser, msgType: 'text', content });
}

/**
 * 发送 Markdown 消息（支持富文本）
 */
export async function sendMarkdownMessage(
  toUser: string | string[],
  content: string
): Promise<{ errcode: number; errmsg: string }> {
  return sendMessage({ toUser, msgType: 'markdown', content });
}

/**
 * 获取用户信息（网页授权）
 * @see https://developer.work.weixin.qq.com/document/path/91019
 */
export async function getUserInfo(code: string): Promise<{
  errcode?: number;
  errmsg?: string;
  UserId?: string;
  OpenId?: string;
  name?: string;
  avatar?: string;
}> {
  const token = await getAccessToken();
  const url = `${WECOM_CONFIG.apiBaseUrl}/user/getuserinfo?access_token=${token}&code=${code}`;
  
  const response = await fetch(url);
  return await response.json() as { errcode?: number; errmsg?: string; UserId?: string; OpenId?: string; name?: string; avatar?: string };
}

/**
 * 获取用户详情
 */
export async function getUserDetail(userId: string): Promise<{
  errcode?: number;
  errmsg?: string;
  userid?: string;
  name?: string;
  avatar?: string;
  mobile?: string;
  department?: number[];
  position?: string;
}> {
  const token = await getAccessToken();
  const url = `${WECOM_CONFIG.apiBaseUrl}/user/get?access_token=${token}&userid=${userId}`;
  
  const response = await fetch(url);
  return await response.json() as { errcode?: number; errmsg?: string; userid?: string; name?: string; avatar?: string; mobile?: string; department?: number[]; position?: string };
}

/**
 * 创建群发消息
 * @see https://developer.work.weixin.qq.com/document/path/90248
 */
export async function createGroupMessage(message: {
  toUsers?: string[];
  toDepartments?: number[];
  msgType: 'text' | 'image' | 'news' | 'mpnews' | 'textcard';
  content: string;
  safe?: number;
}): Promise<{ errcode: number; errmsg: string; msgid?: string }> {
  const token = await getAccessToken();
  const url = `${WECOM_CONFIG.apiBaseUrl}/appmsg/create?access_token=${token}`;
  
  const payload = {
    touser: message.toUsers?.join('|') || '|',
    toparty: message.toDepartments?.join('|') || '|',
    msgtype: message.msgType,
    agentid: WECOM_CONFIG.agentId,
    [message.msgType]: message.msgType === 'text' 
      ? { content: message.content }
      : message.content,
    safe: message.safe || 0,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return await response.json() as { errcode: number; errmsg: string; msgid?: string };
}

/**
 * 生成网页授权 URL
 */
export function getOAuthUrl(redirectUri: string, state?: string): string {
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WECOM_CONFIG.corpId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=snsapi_privateinfo&state=${state || ''}#wechat_redirect`;
}

/**
 * 生成应用授权 URL（教师登录）
 */
export function getAppLoginUrl(redirectUri: string): string {
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  return `${WECOM_CONFIG.apiBaseUrl}/gettoken?corpid=${WECOM_CONFIG.corpId}&corpsecret=${WECOM_CONFIG.corpSecret}`;
}

export default {
  getAccessToken,
  sendMessage,
  sendTextMessage,
  sendMarkdownMessage,
  getUserInfo,
  getUserDetail,
  createGroupMessage,
  getOAuthUrl,
};
