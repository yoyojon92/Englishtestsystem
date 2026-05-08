/**
 * 自适应测试算法 (CAT - Computerized Adaptive Testing + IRT - Item Response Theory)
 * 
 * 功能：
 * - 基于 IRT 模型的题目难度估计
 * - 能力水平动态估计 (Maximum Likelihood Estimation)
 * - 题目选择算法 (Maximum Information)
 * - 终止规则 (Variable-Length Testing)
 * 
 * 参考论文：
 * - Lord, F. M. (1980). Applications of Item Response Theory to Practical Testing Problems.
 * - Weiss, D. J. (1982). Improving Measurement Quality and Efficiency with Adaptive Testing.
 */

/**
 * IRT 参数
 */
export interface ItemParameters {
  itemId: string;
  difficulty: number;      // b 参数: -3 到 +3 (对应 CEFR A1-C2)
  discrimination: number;  // a 参数: 0.5 到 2.5 (题目区分度)
  guessing: number;         // c 参数: 0 到 0.35 (猜测参数, 0.25 for 4-choice)
}

/**
 * 题目
 */
export interface TestItem extends ItemParameters {
  content: string;
  options?: string[];
  correctAnswer: string | number;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'vocabulary' | 'grammar' | 'reading' | 'listening';
  timeLimit?: number;       // 秒
}

/**
 * 学生响应记录
 */
export interface StudentResponse {
  itemId: string;
  answeredCorrectly: boolean;
  responseTime: number;     // 秒
  abilityEstimateAtResponse: number;
}

/**
 * 测试状态
 */
export interface AdaptiveTestState {
  studentId: string;
  currentAbility: number;   // theta 估计值
  standardError: number;     // 标准误
  responses: StudentResponse[];
  administeredItems: string[];
  remainingItems: string[];
  testLength: number;
  maxItems: number;
  minItems: number;
  startedAt: Date;
  isComplete: boolean;
  finalCEFR?: string;
}

/**
 * CEFR 难度映射
 */
const CEFR_TO_DIFFICULTY: Record<string, number> = {
  'Pre-A1': -2.5,
  'A1': -2.0,
  'A2': -1.0,
  'B1': 0,
  'B2': 1.0,
  'C1': 1.5,
  'C2': 2.0,
};

const DIFFICULTY_TO_CEFR: Record<number, string> = Object.fromEntries(
  Object.entries(CEFR_TO_DIFFICULTY).map(([k, v]) => [v, k])
);

/**
 * IRT 3-Parameter Logistic Model
 * P(θ) = c + (1-c) / (1 + e^(-Da(θ-b)))
 * 
 * D = 1.7 (scaling constant)
 */
export function irt3PL(
  theta: number,  // ability
  a: number,      // discrimination
  b: number,      // difficulty
  c: number = 0.25 // guessing
): number {
  const D = 1.7;
  const exponent = -D * a * (theta - b);
  return c + (1 - c) / (1 + Math.exp(exponent));
}

/**
 * 计算 Fisher Information
 * I(θ) = D²a² * (P-c)² * (1-P) / ((1-c)² * P)
 */
export function itemInformation(
  theta: number,
  item: ItemParameters
): number {
  const D = 1.7;
  const P = irt3PL(theta, item.discrimination, item.difficulty, item.guessing);
  const Q = 1 - P;
  const c = item.guessing;
  
  const numerator = Math.pow(D, 2) * Math.pow(item.discrimination, 2) * Math.pow(P - c, 2) * Q;
  const denominator = Math.pow(1 - c, 2) * P;
  
  return numerator / denominator;
}

/**
 * 能力估计 - Maximum Likelihood Estimation (MLE)
 * 使用 Newton-Raphson 迭代
 */
export function estimateAbility(
  responses: Array<{ item: ItemParameters; correct: boolean }>,
  initialTheta: number = 0
): { theta: number; standardError: number } {
  if (responses.length === 0) {
    return { theta: 0, standardError: 1 };
  }
  
  // 初始估计
  let theta = initialTheta;
  const maxIterations = 20;
  const tolerance = 0.001;
  
  for (let i = 0; i < maxIterations; i++) {
    let sumL1 = 0; // 一阶导数
    let sumL2 = 0; // 二阶导数
    
    for (const { item, correct } of responses) {
      const P = irt3PL(theta, item.discrimination, item.difficulty, item.guessing);
      const Q = 1 - P;
      const D = 1.7;
      const a = item.discrimination;
      const b = item.difficulty;
      const c = item.guessing;
      
      const u = correct ? 1 : 0;
      
      // 一阶导数: L1 = ΣDa(u-P)(P-c) / ((1-c)P)
      const common = (D * a * (u - P) * (P - c)) / ((1 - c) * P);
      sumL1 += common;
      
      // 二阶导数: L2 = ΣD²a²(P-c)²(Q) / ((1-c)²P²) - ΣD²a²(u-P)(P-c)(Q) / ((1-c)P²)
      // 简化为负的信息量
      const info = itemInformation(theta, item);
      sumL2 -= info;
    }
    
    // Newton-Raphson 更新
    if (Math.abs(sumL2) < 0.0001) break;
    
    const delta = sumL1 / sumL2;
    theta = theta - delta;
    
    // 边界约束
    theta = Math.max(-4, Math.min(4, theta));
    
    if (Math.abs(delta) < tolerance) break;
  }
  
  // 计算标准误 (基于信息量)
  let totalInfo = 0;
  for (const { item } of responses) {
    totalInfo += itemInformation(theta, item);
  }
  const standardError = totalInfo > 0 ? 1 / Math.sqrt(totalInfo) : 1;
  
  return { theta, standardError };
}

/**
 * 选择下一道题目 - Maximum Information
 */
export function selectNextItem(
  theta: number,
  administeredItemIds: string[],
  itemPool: TestItem[]
): TestItem | null {
  // 过滤已使用的题目
  const availableItems = itemPool.filter(item => !administeredItemIds.includes(item.itemId));
  
  if (availableItems.length === 0) {
    return null;
  }
  
  // 计算每个题目的信息量
  const itemsWithInfo = availableItems.map(item => ({
    item,
    information: itemInformation(theta, item),
  }));
  
  // 按信息量降序排序
  itemsWithInfo.sort((a, b) => b.information - a.information);
  
  // 选择信息量最大的题目
  return itemsWithInfo[0].item;
}

/**
 * 检查终止条件
 */
export function checkTermination(
  state: AdaptiveTestState,
  options: {
    minItems?: number;
    maxItems?: number;
    minSE?: number;
    maxSE?: number;
  } = {}
): { shouldTerminate: boolean; reason: string } {
  const {
    minItems = 10,
    maxItems = 30,
    minSE = 0.3,
    maxSE = 0.5,
  } = options;
  
  // 达到最大题数
  if (state.testLength >= maxItems) {
    return { shouldTerminate: true, reason: 'max_items_reached' };
  }
  
  // 达到最小题数且标准误足够小
  if (state.testLength >= minItems && state.standardError <= minSE) {
    return { shouldTerminate: true, reason: 'precision_achieved' };
  }
  
  // 达到最大标准误（测量不准确）
  if (state.standardError >= maxSE) {
    return { shouldTerminate: true, reason: 'max_uncertainty' };
  }
  
  // 题目用尽
  if (state.remainingItems.length === 0) {
    return { shouldTerminate: true, reason: 'items_exhausted' };
  }
  
  return { shouldTerminate: false, reason: '' };
}

/**
 * 能力水平转 CEFR 等级
 */
export function abilityToCEFR(theta: number): string {
  // 使用阈值映射
  if (theta < -2) return 'Pre-A1';
  if (theta < -1) return 'A1';
  if (theta < 0) return 'A2';
  if (theta < 1) return 'B1';
  if (theta < 1.5) return 'B2';
  return 'C1';
}

/**
 * CEFR 等级转能力水平
 */
export function cefrToAbility(cefr: string): number {
  return CEFR_TO_DIFFICULTY[cefr] || 0;
}

/**
 * 创建自适应测试状态
 */
export function createTestState(
  studentId: string,
  itemPool: TestItem[],
  options: {
    maxItems?: number;
    minItems?: number;
    initialDifficulty?: number;
  } = {}
): AdaptiveTestState {
  const {
    maxItems = 30,
    minItems = 10,
    initialDifficulty = 0,
  } = options;
  
  return {
    studentId,
    currentAbility: initialDifficulty,
    standardError: 1,
    responses: [],
    administeredItems: [],
    remainingItems: itemPool.map(i => i.itemId),
    testLength: 0,
    maxItems,
    minItems,
    startedAt: new Date(),
    isComplete: false,
  };
}

/**
 * 处理学生回答
 */
export function processResponse(
  state: AdaptiveTestState,
  item: TestItem,
  correct: boolean,
  responseTime: number
): AdaptiveTestState {
  // 记录响应
  const response: StudentResponse = {
    itemId: item.itemId,
    answeredCorrectly: correct,
    responseTime,
    abilityEstimateAtResponse: state.currentAbility,
  };
  
  // 更新响应历史
  const newResponses = [...state.responses, response];
  const newAdministered = [...state.administeredItems, item.itemId];
  const newRemaining = state.remainingItems.filter(id => id !== item.itemId);
  
  // 重新估计能力
  const allResponses = newResponses.map(r => {
    const matchedItem = {
      itemId: r.itemId,
      difficulty: item.difficulty,
      discrimination: item.discrimination,
      guessing: item.guessing,
    };
    return { item: matchedItem, correct: r.answeredCorrectly };
  });
  
  // 使用之前已施测的题目重新估计
  const previousResponses = newResponses.slice(0, -1).map((r, idx) => ({
    item: itemPool.find(i => i.itemId === r.itemId) || item,
    correct: r.answeredCorrectly,
  }));
  
  const { theta, standardError } = estimateAbility(
    previousResponses.concat([{ item, correct }]),
    state.currentAbility
  );
  
  return {
    ...state,
    currentAbility: theta,
    standardError,
    responses: newResponses,
    administeredItems: newAdministered,
    remainingItems: newRemaining,
    testLength: newResponses.length,
    isComplete: checkTermination(
      { ...state, currentAbility: theta, standardError, testLength: newResponses.length, responses: newResponses },
      { minItems: state.minItems, maxItems: state.maxItems }
    ).shouldTerminate,
    finalCEFR: abilityToCEFR(theta),
  };
}

// 全局题目池引用（实际使用时从数据库加载）
let itemPool: TestItem[] = [];

/**
 * 初始化题目池
 */
export function initializeItemPool(questions: TestItem[]): void {
  itemPool = questions;
}

/**
 * 运行自适应测试
 */
export function runAdaptiveTest(
  studentId: string,
  options: {
    maxItems?: number;
    minItems?: number;
    category?: 'vocabulary' | 'grammar' | 'reading' | 'listening';
    targetCEFR?: string;
  } = {}
): {
  startTest: () => AdaptiveTestState;
  submitAnswer: (state: AdaptiveTestState, itemId: string, correct: boolean, time: number) => AdaptiveTestState;
  getNextItem: (state: AdaptiveTestState) => TestItem | null;
  isComplete: (state: AdaptiveTestState) => boolean;
  getResults: (state: AdaptiveTestState) => {
    cefrLevel: string;
    abilityScore: number;
    confidence: number;
    recommendedItems: string[];
  };
} {
  const filteredPool = itemPool.filter(item => {
    if (options.category && item.category !== options.category) return false;
    if (options.targetCEFR) {
      const targetDiff = cefrToAbility(options.targetCEFR);
      // 只选择目标难度附近的题目
      if (Math.abs(item.difficulty - targetDiff) > 1.5) return false;
    }
    return true;
  });
  
  return {
    startTest: () => createTestState(studentId, filteredPool, options),
    
    submitAnswer: (state, itemId, correct, time) => {
      const item = itemPool.find(i => i.itemId === itemId);
      if (!item) return state;
      return processResponse(state, item, correct, time);
    },
    
    getNextItem: (state) => {
      return selectNextItem(state.currentAbility, state.administeredItems, filteredPool);
    },
    
    isComplete: (state) => {
      return checkTermination(state, options).shouldTerminate;
    },
    
    getResults: (state) => {
      const cefrLevel = abilityToCEFR(state.currentAbility);
      const confidence = 1 - Math.min(1, state.standardError / 1);
      
      return {
        cefrLevel,
        abilityScore: Math.round(state.currentAbility * 100) / 100,
        confidence: Math.round(confidence * 100),
        recommendedItems: filteredPool
          .filter(i => i.difficulty > state.currentAbility - 0.5 && i.difficulty < state.currentAbility + 0.5)
          .slice(0, 5)
          .map(i => i.itemId),
      };
    },
  };
}

/**
 * 词汇量估计
 * 使用正确率反推词汇量
 */
export function estimateVocabularySize(
  correctCount: number,
  totalQuestions: number,
  knownWordRatio: number = 0.5
): number {
  // 假设题目按词汇频率分布
  // 常用词比例约为 85% (覆盖 5000 词)
  // 学术词比例约为 15% (覆盖 10000+ 词)
  
  const baseVocabulary = 1000; // 基础词汇量
  const maxVocabulary = 12000; // 最高词汇量
  
  // 计算正确率
  const accuracy = correctCount / totalQuestions;
  
  // 估算词汇量
  // 假设每10题代表约500词汇
  const estimatedVocab = baseVocabulary + (accuracy * totalQuestions * 50);
  
  // 考虑已知词比例调整
  const adjustedVocab = estimatedVocab * (1 + knownWordRatio * 0.5);
  
  return Math.round(Math.min(maxVocabulary, Math.max(baseVocabulary, adjustedVocab)));
}

/**
 * 预测 KET/PET 通过率
 * 基于能力估计和模拟考表现
 */
export function predictExamPassRate(
  ability: number,
  examType: 'KET' | 'PET',
  mockExamHistory: Array<{ score: number; maxScore: number }>
): {
  passRate: number;
  recommendation: 'recommend' | 'prepare' | 'not_ready';
  suggestedWeeks: number;
} {
  // KET/PET 通过门槛
  const passThresholds = {
    'KET': 0,      // theta = 0 对应 KET 通过
    'PET': 0.5,    // theta = 0.5 对应 PET 通过
  };
  
  const threshold = passThresholds[examType];
  
  // 基础通过率
  const zScore = (ability - threshold) / 0.8; // 假设 SD = 0.8
  let passRate = 0.5 + 0.5 * (1 + Math.exp(-zScore * Math.PI / Math.sqrt(3)));
  
  // 根据历史模拟考调整
  if (mockExamHistory.length > 0) {
    const avgAccuracy = mockExamHistory.reduce((sum, h) => sum + h.score / h.maxScore, 0) / mockExamHistory.length;
    passRate = passRate * 0.7 + avgAccuracy * 0.3;
  }
  
  passRate = Math.min(0.99, Math.max(0.1, passRate));
  
  // 生成建议
  let recommendation: 'recommend' | 'prepare' | 'not_ready';
  let suggestedWeeks: number;
  
  if (passRate >= 0.85) {
    recommendation = 'recommend';
    suggestedWeeks = 0;
  } else if (passRate >= 0.6) {
    recommendation = 'prepare';
    suggestedWeeks = Math.round((0.85 - passRate) * 20);
  } else {
    recommendation = 'not_ready';
    suggestedWeeks = Math.round((0.85 - passRate) * 30);
  }
  
  return {
    passRate: Math.round(passRate * 100),
    recommendation,
    suggestedWeeks,
  };
}

export default {
  irt3PL,
  itemInformation,
  estimateAbility,
  selectNextItem,
  checkTermination,
  abilityToCEFR,
  cefrToAbility,
  createTestState,
  processResponse,
  runAdaptiveTest,
  estimateVocabularySize,
  predictExamPassRate,
};
