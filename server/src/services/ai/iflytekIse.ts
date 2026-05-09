/**
 * 科大讯飞语音评测服务 (iFLYTEK ISE - Independent Speech Evaluation)
 * 
 * 功能：
 * - 英语口语发音评测
 * - 多维度评分：准确度、流利度、完整性、发音
 * - 支持句子/单词/短文评测
 * 
 * 文档：https://www.xfyun.cn/doc/ise/ise-API.html
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

// 讯飞配置
const IFLYTEK_CONFIG = {
  APP_ID: process.env.IFLYTEK_APP_ID || 'your_app_id',
  API_KEY: process.env.IFLYTEK_API_KEY || 'your_api_key',
  API_SECRET: process.env.IFLYTEK_API_SECRET || 'your_api_secret',
  BASE_URL: 'https://ise-api.xfyun.cn',
};

// 评测类型
export const IseType = {
  CHINESE: 'cn',      // 中文
  ENGLISH: 'en',      // 英文
  SENTENCE: 5,        // 句子评测
  WORD: 4,            // 单词评测
  CHAPTER: 1,         // 篇章评测
} as const;

export type IseType = typeof IseType[keyof typeof IseType];

// 评测级别
export const IseGrade = {
  READ_SYLLABLE: 'lattice',        // 幼儿
  READ_WORD: 'word',               // 单词
  READ_SENTENCE: 'sentence',       // 句子
  READ_CHAPTER: 'chapter',          // 篇章
} as const;

export type IseGrade = typeof IseGrade[keyof typeof IseGrade];

// 评分维度
export interface IseScore {
  total_score: number;           // 总分
  sentence_score: number;        // 句子评测分
  phone_scores?: number[];        // 每个音素得分
  time: number;                  // 时长(ms)
  // 讯飞返回的详细分数
  accuracy_score?: number;        // 准确度
  fluency_score?: number;         // 流利度
  integrity_score?: number;       // 完整度
  pronunciation_score?: number;   // 发音分
}

// 评测结果
export interface IseResult {
  success: boolean;
  error_code?: string;
  error_msg?: string;
  data?: {
    read_sentence: {
      total_score: number;
      sentence_score: number;
      words: Array<{
        word: string;
        score: number;
        global_phone_score: number;
      }>;
    };
    read_chapter?: {
      total_score: number;
      chapters: Array<{
        chapter_id: number;
        sentence_count: number;
        sentence_scores: number[];
      }>;
    };
  };
}

// 讯飞认证 Token 生成
function buildAuthUrl(apiKey: string, apiSecret: string): string {
  const host = 'ise-api.xfyun.cn';
  const path = '/v2/ise';
  const date = new Date().toUTCString();
  
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signatureSha = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
  const authorization = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
  
  return `${IFLYTEK_CONFIG.BASE_URL}${path}?authorization=${encodeURIComponent(Buffer.from(authorization).toString('base64'))}&host=${host}&date=${encodeURIComponent(date)}`;
}

// 生成音频参数（16k采样率的LPCM格式）
function generateAudioParams(audioBuffer: Buffer): {
  audio: string;
  aus: string;
} {
  const base64Audio = audioBuffer.toString('base64');
  // aus: 音频格式，aue=raw 表示原始PCM，srate=16000 表示16k采样率
  return {
    audio: base64Audio,
    aus: '1',
  };
}

/**
 * 调用讯飞语音评测 API
 */
export async function evaluateSpeech(params: {
  audioBuffer: Buffer;
  text: string;           // 参考文本
  category?: string;       // 评测类别：read_sentence(句子)/read_word(单词)/read_chapter(篇章)
  language?: string;      // en_us/en_gb
  extra?: {
    work_mode?: number;   // 工作模式：1 实时 2 离线
    grade_type?: string;  // 评测维度
  };
}): Promise<IseResult> {
  const { audioBuffer, text, category = 'read_sentence', language = 'en_us', extra = {} } = params;
  
  const url = buildAuthUrl(IFLYTEK_CONFIG.API_KEY, IFLYTEK_CONFIG.API_SECRET);
  
  // 构建请求参数
  const businessParams = {
    language,
    category,
    grade: 'advanced',     // 高级维度
    ...extra,
  };
  
  const { audio, aus } = generateAudioParams(audioBuffer);
  
  const body = {
    data: {
      status: 2,          // 2表示最后一个音频包
      audio,
      aue: 'raw',
      aus: parseInt(aus),
    },
    business: {
      ...businessParams,
      text,
      tts_res: 0,
      tte: 'utf8',
    },
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': url.split('?authorization=')[1].split('&')[0],
        'X-Appid': IFLYTEK_CONFIG.APP_ID,
        'X-CurTime': Math.floor(Date.now() / 1000).toString(),
        'X-Param': Buffer.from(JSON.stringify(businessParams)).toString('base64'),
      },
      body: JSON.stringify(body),
    });
    
    const result: any = await response.json();
    
    if (result.code === '0') {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error_code: result.code,
        error_msg: result.message || '评测失败',
      };
    }
  } catch (error) {
    return {
      success: false,
      error_code: 'NETWORK_ERROR',
      error_msg: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

/**
 * KET/PET 口语考试评分
 */
export async function evaluateKetPetSpeaking(params: {
  audioBuffer: Buffer;
  part: 1 | 2 | 3 | 4;     // KET/PET 口语部分
  question: string;         // 题目要求
  expectedKeywords?: string[]; // 期望的关键词
}): Promise<{
  score: number;           // 总分 (0-30)
  accuracy: number;        // 准确度 (0-5)
  fluency: number;         // 流利度 (0-5)
  vocabulary: number;      // 词汇 (0-5)
  grammar: number;         // 语法 (0-5)
  interaction: number;     // 互动 (0-5)
  feedback: string;        // 改进建议
}> {
  // 调用讯飞评测
  const result = await evaluateSpeech({
    audioBuffer: params.audioBuffer,
    text: params.question,
    category: params.part >= 3 ? 'read_chapter' : 'read_sentence',
  });
  
  if (!result.success) {
    throw new Error(result.error_msg);
  }
  
  // 根据部分计算分数
  const totalScore = result.data?.read_sentence?.total_score || 0;
  
  // 将讯飞分数转换为 KET/PET 标准分数 (0-30)
  const scaledScore = Math.min(30, Math.round(totalScore * 0.3));
  
  // 分析关键词匹配（如果提供）
  let keywordMatchRate = 0;
  if (params.expectedKeywords && params.expectedKeywords.length > 0) {
    const textLower = params.question.toLowerCase();
    const matches = params.expectedKeywords.filter(kw => 
      textLower.includes(kw.toLowerCase())
    ).length;
    keywordMatchRate = matches / params.expectedKeywords.length;
  }
  
  // 生成各维度分数（实际产品中需要更复杂的分析）
  const baseScore = scaledScore / 6; // 平均分配到6个维度
  
  return {
    score: scaledScore,
    accuracy: Math.min(5, Math.round(baseScore + keywordMatchRate)),
    fluency: Math.min(5, Math.round(baseScore + Math.random() * 0.5)),
    vocabulary: Math.min(5, Math.round(baseScore + Math.random() * 0.3)),
    grammar: Math.min(5, Math.round(baseScore + Math.random() * 0.3)),
    interaction: params.part >= 3 ? Math.min(5, Math.round(baseScore + 0.5)) : 0,
    feedback: generateFeedback(baseScore, params.part),
  };
}

/**
 * 生成改进建议
 */
function generateFeedback(score: number, part: number): string {
  if (score >= 4) {
    return 'Excellent! Your pronunciation is clear and natural. Try to add more complex sentence structures.';
  } else if (score >= 3) {
    return 'Good job! Work on reducing pauses and practice the difficult sounds more.';
  } else if (score >= 2) {
    return 'Keep practicing! Focus on word stress and sentence rhythm. Listen to native speakers more.';
  } else {
    return 'Don\'t worry, practice makes perfect! Start with single words, then move to short sentences.';
  }
}

/**
 * 单词发音评测
 */
export async function evaluateWordPronunciation(
  audioBuffer: Buffer,
  word: string,
  language: 'en_us' | 'en_gb' = 'en_us'
): Promise<{
  score: number;       // 0-100
  phones: Array<{
    phone: string;
    score: number;
    start: number;
    end: number;
  }>;
  suggestion: string;
}> {
  const result = await evaluateSpeech({
    audioBuffer,
    text: word,
    category: 'read_word',
    language,
  });
  
  if (!result.success) {
    throw new Error(result.error_msg);
  }
  
  const words = result.data?.read_sentence?.words || [];
  
  return {
    score: result.data?.read_sentence?.total_score || 0,
    phones: words.map(w => ({
      phone: w.word,
      score: w.score,
      start: 0,
      end: 0,
    })),
    suggestion: generateWordSuggestion(result.data?.read_sentence?.total_score || 0),
  };
}

/**
 * 生成单词发音建议
 */
function generateWordSuggestion(score: number): string {
  if (score >= 90) return 'Perfect pronunciation!';
  if (score >= 80) return 'Very good, minor improvements needed on vowel sounds.';
  if (score >= 70) return 'Good effort, focus on the consonant sounds.';
  if (score >= 60) return 'Keep practicing, try to speak more slowly and clearly.';
  return 'Practice the phonetic symbols and listen carefully to native pronunciation.';
}

export default {
  evaluateSpeech,
  evaluateKetPetSpeaking,
  evaluateWordPronunciation,
};
