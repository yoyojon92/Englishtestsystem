import crypto from 'crypto';
import axios from 'axios';

interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  serialNo: string;
  privateKey: string;
  notifyUrl: string;
}

interface UnifiedOrderParams {
  outTradeNo: string;
  totalFee: number;
  description: string;
  openid?: string;
}

interface UnifiedOrderResult {
  codeUrl: string;
  prepayId: string;
  nonceStr: string;
  sign: string;
  timestamp: string;
}

class WechatPayService {
  private config: WechatPayConfig;
  private baseUrl = 'https://api.mch.weixin.qq.com';

  constructor() {
    this.config = {
      appId: process.env.WECHAT_APP_ID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_API_KEY || '',
      serialNo: process.env.WECHAT_SERIAL_NO || '',
      privateKey: process.env.WECHAT_PRIVATE_KEY || '',
      notifyUrl: process.env.WECHAT_NOTIFY_URL || 'https://api.example.com/api/v1/payment/notify',
    };
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 生成签名
   */
  private generateSign(params: Record<string, string>): string {
    const signType = 'MD5';
    const sortedKeys = Object.keys(params).sort();
    const signStr = sortedKeys
      .filter(key => key !== 'sign' && params[key])
      .map(key => `${key}=${params[key]}`)
      .join('&') + `&key=${this.config.apiKey}`;

    return crypto
      .createHash('md5')
      .update(signStr, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  /**
   * 统一下单
   */
  async unifiedOrder(params: UnifiedOrderParams): Promise<UnifiedOrderResult> {
    const nonceStr = this.generateNonceStr();
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const xmlParams: Record<string, string | number> = {
      appid: this.config.appId,
      mchid: '1563694321', // 示例商户号
      out_trade_no: params.outTradeNo,
      total_fee: Math.round(params.totalFee * 100), // 金额，单位分
      description: params.description,
      notify_url: this.config.notifyUrl,
      nonce_str: nonceStr,
      ...(params.openid && { openid: params.openid }),
    };

    // 生成签名
    const sign = this.generateSign(xmlParams);
    const xmlBody = `
      <xml>
        ${Object.entries(xmlParams).map(([k, v]) => `<${k}>${v}</${k}>`).join('\n')}
        <sign>${sign}</sign>
      </xml>
    `.trim();

    try {
      const response = await axios.post(
        `${this.baseUrl}/pay/unifiedorder`,
        xmlBody,
        {
          headers: {
            'Content-Type': 'text/xml',
          },
        }
      );

      const result = this.parseXml(response.data);

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          codeUrl: result.code_url || result.prepay_id,
          prepayId: result.prepay_id,
          nonceStr,
          sign,
          timestamp,
        };
      } else {
        throw new Error(result.err_code_des || result.return_msg || '统一下单失败');
      }
    } catch (error: any) {
      console.error('Wechat Pay unified order error:', error.message);
      throw error;
    }
  }

  /**
   * 解析XML响应
   */
  private parseXml(xml: string): Record<string, string> {
    const result: Record<string, string> = {};
    const regex = /<(\w+)>([^<]+)<\/\1>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }
    return result;
  }

  /**
   * 生成JSAPI调起支付参数
   */
  generateAppPayParams(prepayId: string): {
    appId: string;
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
  } {
    const nonceStr = this.generateNonceStr();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = {
      appId: this.config.appId,
      timeStamp: timestamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MD5',
    };

    const paySign = this.generateSign(params);

    return {
      appId: this.config.appId,
      timeStamp: timestamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MD5',
      paySign,
    };
  }

  /**
   * 验证支付回调签名
   */
  verifyCallback(params: Record<string, string>): boolean {
    const sign = params.sign;
    const paramsCopy = { ...params };
    delete paramsCopy.sign;

    const calculatedSign = this.generateSign(paramsCopy);
    return sign === calculatedSign;
  }

  /**
   * 查询订单
   */
  async queryOrder(outTradeNo: string): Promise<Record<string, string>> {
    const nonceStr = this.generateNonceStr();
    const params = {
      appid: this.config.appId,
      mchid: this.config.mchId,
      out_trade_no: outTradeNo,
      nonce_str: nonceStr,
    };

    const sign = this.generateSign(params);
    const xmlBody = `
      <xml>
        ${Object.entries(params).map(([k, v]) => `<${k}>${v}</${k}>`).join('\n')}
        <sign>${sign}</sign>
      </xml>
    `.trim();

    const response = await axios.post(
      `${this.baseUrl}/pay/orderquery`,
      xmlBody,
      { headers: { 'Content-Type': 'text/xml' } }
    );

    return this.parseXml(response.data);
  }

  /**
   * 申请退款
   */
  async refund(outTradeNo: string, totalFee: number, refundFee: number): Promise<boolean> {
    const nonceStr = this.generateNonceStr();
    const refundId = `REF${Date.now()}${this.generateNonceStr().substring(0, 8)}`;

    const params: Record<string, string | number> = {
      appid: this.config.appId,
      mchid: this.config.mchId,
      out_trade_no: outTradeNo,
      out_refund_no: refundId,
      total_fee: Math.round(totalFee * 100),
      refund_fee: Math.round(refundFee * 100),
      nonce_str: nonceStr,
    };

    const sign = this.generateSign(params);
    const xmlBody = `
      <xml>
        ${Object.entries(params).map(([k, v]) => `<${k}>${v}</${k}>`).join('\n')}
        <sign>${sign}</sign>
      </xml>
    `.trim();

    const response = await axios.post(
      `${this.baseUrl}/secapi/pay/refund`,
      xmlBody,
      {
        headers: { 'Content-Type': 'text/xml' },
        // 需要双向证书认证，简化处理
      }
    );

    const result = this.parseXml(response.data);
    return result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS';
  }

  /**
   * 关闭订单
   */
  async closeOrder(outTradeNo: string): Promise<boolean> {
    const nonceStr = this.generateNonceStr();
    const params = {
      appid: this.config.appId,
      mchid: this.config.mchId,
      out_trade_no: outTradeNo,
      nonce_str: nonceStr,
    };

    const sign = this.generateSign(params);
    const xmlBody = `
      <xml>
        ${Object.entries(params).map(([k, v]) => `<${k}>${v}</${k}>`).join('\n')}
        <sign>${sign}</sign>
      </xml>
    `.trim();

    const response = await axios.post(
      `${this.baseUrl}/pay/closeorder`,
      xmlBody,
      { headers: { 'Content-Type': 'text/xml' } }
    );

    const result = this.parseXml(response.data);
    return result.return_code === 'SUCCESS';
  }
}

export const wechatPayService = new WechatPayService();
export default wechatPayService;
