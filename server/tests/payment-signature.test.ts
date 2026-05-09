/**
 * 微信支付回调签名验证测试
 * 测试支付回调的签名生成和验证逻辑
 */

import crypto from 'crypto';

// 模拟的微信支付配置
const WECHAT_CONFIG = {
  mchKey: 'your_merchant_key_32_chars_minimum',
};

// 待测试的签名工具函数
function generateWechatPaySign(params: Record<string, string>): string {
  // 按字典序排序参数
  const sortedKeys = Object.keys(params).sort();
  
  // 拼接成字符串
  const signString = sortedKeys
    .filter(key => key !== 'sign' && params[key])
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 拼接商户密钥
  const stringToSign = signString + '&key=' + WECHAT_CONFIG.mchKey;
  
  // MD5签名并转大写
  return crypto
    .createHash('md5')
    .update(stringToSign, 'utf8')
    .digest('hex')
    .toUpperCase();
}

function verifyWechatPaySign(params: Record<string, string>): boolean {
  const { sign, ...rest } = params;
  
  if (!sign) {
    return false;
  }
  
  const calculatedSign = generateWechatPaySign(rest);
  return calculatedSign === sign;
}

// 模拟的回调数据
const mockCallbackData = {
  return_code: 'SUCCESS',
  return_msg: 'OK',
  result_code: 'SUCCESS',
  mch_id: '1234567890',
  nonce_str: '5K8264ILTKCH16CQ2502SI8ZNMTM67VS',
  sign: '', // 待计算
  transaction_id: '4208450740201411110007820472',
  out_trade_no: 'TEST_ORDER_20240101_001',
  trade_type: 'NATIVE',
  trade_state: 'SUCCESS',
  total_fee: '5990',
  cash_fee: '5990',
  time_end: '20240101120000',
};

// ============ 运行测试 ============

runTests();

// 简单的测试运行器（不依赖 Jest）
function runTests(): void {
  console.log('\n========== WeChat Pay Signature Tests ==========\n');
  
  let passed = 0;
  let failed = 0;
  
  // 测试用例
  const tests = [
    {
      name: 'generate signature format',
      fn: () => {
        const sign = generateWechatPaySign({ key1: 'value1' });
        if (!/^[A-F0-9]{32}$/.test(sign)) {
          throw new Error('Invalid signature format');
        }
      },
    },
    {
      name: 'signatures differ for different inputs',
      fn: () => {
        const sign1 = generateWechatPaySign({ foo: 'bar' });
        const sign2 = generateWechatPaySign({ foo: 'baz' });
        if (sign1 === sign2) {
          throw new Error('Signatures should be different');
        }
      },
    },
    {
      name: 'verify valid signature',
      fn: () => {
        const params = { key1: 'value1' };
        const sign = generateWechatPaySign(params);
        if (!verifyWechatPaySign({ ...params, sign })) {
          throw new Error('Valid signature should verify');
        }
      },
    },
    {
      name: 'reject invalid signature',
      fn: () => {
        if (verifyWechatPaySign({ key1: 'value1', sign: 'INVALID' })) {
          throw new Error('Invalid signature should be rejected');
        }
      },
    },
    {
      name: 'reject missing signature',
      fn: () => {
        if (verifyWechatPaySign({ key1: 'value1' })) {
          throw new Error('Missing signature should be rejected');
        }
      },
    },
    {
      name: 'detect tampered data',
      fn: () => {
        const params = { amount: '100' };
        const sign = generateWechatPaySign(params);
        if (verifyWechatPaySign({ amount: '1', sign })) {
          throw new Error('Tampered data should be detected');
        }
      },
    },
  ];
  
  // 运行测试
  tests.forEach(test => {
    try {
      test.fn();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error: any) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('\n================================================\n');
  
  if (failed > 0) {
    process.exit(1);
  }
}

// 如果直接运行此文件
runTests();
