/**
 * CEFR 评分计算测试
 * 测试 CEFR 等级计算、评分算法和考试就绪判定逻辑
 */

// CEFR 等级定义
type CEFRLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 分数范围定义
const SCORE_RANGES: Record<CEFRLevel, { min: number; max: number }> = {
  'Pre-A1': { min: 0, max: 100 },
  'A1': { min: 101, max: 200 },
  'A2': { min: 201, max: 300 },
  'B1': { min: 301, max: 400 },
  'B2': { min: 401, max: 500 },
  'C1': { min: 501, max: 600 },
  'C2': { min: 601, max: 700 },
};

// 技能权重
const SKILL_WEIGHTS = {
  listening: 0.25,
  speaking: 0.25,
  reading: 0.25,
  writing: 0.25,
};

// 考试就绪阈值
const READINESS_THRESHOLDS = {
  KET: {
    minimumScore: 120,
    minimumAttempts: 3,
    confidenceBoost: 10,
  },
  PET: {
    minimumScore: 140,
    minimumAttempts: 3,
    confidenceBoost: 10,
  },
};

/**
 * 计算综合 CEFR 分数
 */
function calculateOverallScore(skills: {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
}): number {
  return (
    skills.listening * SKILL_WEIGHTS.listening +
    skills.speaking * SKILL_WEIGHTS.speaking +
    skills.reading * SKILL_WEIGHTS.reading +
    skills.writing * SKILL_WEIGHTS.writing
  );
}

/**
 * 根据分数确定 CEFR 等级
 */
function determineCEFRLevel(score: number): CEFRLevel {
  const levels: CEFRLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  for (const level of levels) {
    if (score >= SCORE_RANGES[level].min && score <= SCORE_RANGES[level].max) {
      return level;
    }
  }
  
  // 超出范围的处理
  if (score < SCORE_RANGES['Pre-A1'].min) return 'Pre-A1';
  return 'C2';
}

/**
 * 计算等级差距
 */
function calculateLevelGap(currentLevel: CEFRLevel, targetLevel: CEFRLevel): number {
  const levels: CEFRLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);
  const targetIndex = levels.indexOf(targetLevel);
  return targetIndex - currentIndex;
}

/**
 * 估算达到目标等级所需时间（周）
 */
function estimateWeeksToTarget(
  currentLevel: CEFRLevel,
  targetLevel: CEFRLevel,
  weeklyStudyHours: number = 5
): number {
  const levelGap = calculateLevelGap(currentLevel, targetLevel);
  
  if (levelGap <= 0) return 0;
  
  // 假设每提升一个等级需要约 8-12 周（每周学习 5 小时）
  const baseWeeksPerLevel = 10;
  const adjustmentFactor = 5 / weeklyStudyHours;
  
  return Math.ceil(levelGap * baseWeeksPerLevel * adjustmentFactor);
}

/**
 * 计算考试就绪度
 */
function calculateExamReadiness(params: {
  mockExamScores: number[];
  cefrLevel: CEFRLevel;
  targetExam: 'KET' | 'PET';
}): {
  isReady: boolean;
  confidenceLevel: number;
  recommendation: string;
} {
  const { mockExamScores, cefrLevel, targetExam } = params;
  const threshold = READINESS_THRESHOLDS[targetExam];
  
  if (mockExamScores.length === 0) {
    return {
      isReady: false,
      confidenceLevel: 0,
      recommendation: '建议先进行模拟考试评估当前水平',
    };
  }
  
  const latestScore = mockExamScores[mockExamScores.length - 1];
  const averageScore = mockExamScores.reduce((a, b) => a + b, 0) / mockExamScores.length;
  const passCount = mockExamScores.filter(s => s >= threshold.minimumScore).length;
  
  // 基础置信度
  let confidenceLevel = (latestScore / 200) * 100;
  
  // 根据历史通过次数加分
  confidenceLevel += Math.min(passCount * threshold.confidenceBoost, 30);
  
  // 根据平均分调整
  if (averageScore > latestScore) {
    confidenceLevel -= 10;
  }
  
  // 限制在 0-100 范围内
  confidenceLevel = Math.max(0, Math.min(100, confidenceLevel));
  
  // 判断是否就绪
  const isReady = 
    latestScore >= threshold.minimumScore &&
    passCount >= threshold.minimumAttempts &&
    confidenceLevel >= 70;
  
  // 生成建议
  let recommendation: string;
  if (isReady) {
    recommendation = `您已达到 ${targetExam} 考试就绪水平，建议近期报名参加正式考试。`;
  } else if (latestScore < threshold.minimumScore * 0.8) {
    const weeks = estimateWeeksToTarget(cefrLevel, targetExam === 'KET' ? 'A1' : 'A2');
    recommendation = `当前水平距离 ${targetExam} 还有差距，建议继续备考约 ${weeks} 周后再参加模拟考试。`;
  } else if (passCount < threshold.minimumAttempts) {
    const remaining = threshold.minimumAttempts - passCount;
    recommendation = `您已有进步，建议再进行 ${remaining} 次模拟考试以巩固水平。`;
  } else {
    recommendation = `您的水平接近 ${targetExam} 要求，建议加强薄弱环节训练后再参加正式考试。`;
  }
  
  return { isReady, confidenceLevel: Math.round(confidenceLevel), recommendation };
}

/**
 * 计算词汇量对应 CEFR 等级
 */
function getVocabularyCEFR(vocabularySize: number): CEFRLevel {
  if (vocabularySize < 500) return 'Pre-A1';
  if (vocabularySize < 1000) return 'A1';
  if (vocabularySize < 2500) return 'A2';
  if (vocabularySize < 4000) return 'B1';
  if (vocabularySize < 6000) return 'B2';
  if (vocabularySize < 12000) return 'C1';
  return 'C2';
}

/**
 * 计算能力雷达图数据
 */
function calculateRadarData(skills: {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  vocabulary: number;
}): { skill: string; value: number; max: number }[] {
  const maxScores = {
    listening: 100,
    speaking: 100,
    reading: 100,
    writing: 100,
    vocabulary: 700, // 对应 C2 等级
  };
  
  return [
    { skill: '听力', value: skills.listening, max: maxScores.listening },
    { skill: '口语', value: skills.speaking, max: maxScores.speaking },
    { skill: '阅读', value: skills.reading, max: maxScores.reading },
    { skill: '写作', value: skills.writing, max: maxScores.writing },
    { skill: '词汇', value: skills.vocabulary, max: maxScores.vocabulary },
  ];
}

/**
 * 生成学习建议
 */
function generateLearningSuggestions(
  cefrLevel: CEFRLevel,
  weakSkills: string[]
): string[] {
  const suggestions: string[] = [];
  
  // 基础建议
  switch (cefrLevel) {
    case 'Pre-A1':
    case 'A1':
      suggestions.push('建议加强基础词汇积累，每天学习 10-15 个新单词');
      suggestions.push('多听简单的英语对话和儿歌，培养语感');
      break;
    case 'A2':
      suggestions.push('可以开始阅读简单的英文绘本和分级读物');
      suggestions.push('尝试用英语进行简单的日常交流');
      break;
    case 'B1':
      suggestions.push('建议开始接触更复杂的阅读材料，如新闻摘要');
      suggestions.push('练习写作，可以从写日记开始');
      break;
    default:
      suggestions.push('建议大量阅读原版英文材料');
      suggestions.push('可以参加一些英语角活动提高口语流利度');
  }
  
  // 针对薄弱环节的建议
  if (weakSkills.includes('listening')) {
    suggestions.push('听力较弱，建议每天听英语 30 分钟，可使用 VOA 慢速英语');
  }
  if (weakSkills.includes('speaking')) {
    suggestions.push('口语较弱，建议跟读模仿，尝试用英语自言自语');
  }
  if (weakSkills.includes('reading')) {
    suggestions.push('阅读较弱，建议分级阅读，从简单材料开始');
  }
  if (weakSkills.includes('writing')) {
    suggestions.push('写作较弱，建议每天写几句英语日记，逐步增加长度');
  }
  
  return suggestions;
}

// ============ 运行测试 ============

runTests();

// 简单的测试运行器
function runTests(): void {
  console.log('\n========== CEFR Calculation Tests ==========\n');
  
  let passed = 0;
  let failed = 0;
  
  const tests = [
    {
      name: 'Overall score calculation',
      fn: () => {
        const score = calculateOverallScore({
          listening: 80,
          speaking: 70,
          reading: 90,
          writing: 60,
        });
        if (score !== 75) throw new Error(`Expected 75, got ${score}`);
      },
    },
    {
      name: 'CEFR level determination',
      fn: () => {
        if (determineCEFRLevel(150) !== 'A1') throw new Error('Failed for A1 range');
        if (determineCEFRLevel(50) !== 'Pre-A1') throw new Error('Failed for Pre-A1');
        if (determineCEFRLevel(500) !== 'B2') throw new Error('Failed for B2');
      },
    },
    {
      name: 'Level gap calculation',
      fn: () => {
        if (calculateLevelGap('A1', 'B1') !== 2) throw new Error('Gap should be 2');
        if (calculateLevelGap('A1', 'A1') !== 0) throw new Error('Same level gap should be 0');
      },
    },
    {
      name: 'Exam readiness - not ready',
      fn: () => {
        const result = calculateExamReadiness({
          mockExamScores: [],
          cefrLevel: 'A1',
          targetExam: 'KET',
        });
        if (result.isReady) throw new Error('Should not be ready without history');
      },
    },
    {
      name: 'Exam readiness - ready',
      fn: () => {
        const result = calculateExamReadiness({
          mockExamScores: [130, 140, 150],
          cefrLevel: 'A1',
          targetExam: 'KET',
        });
        if (!result.isReady) throw new Error('Should be ready with good scores');
      },
    },
    {
      name: 'Vocabulary CEFR mapping',
      fn: () => {
        if (getVocabularyCEFR(700) !== 'A1') throw new Error('Vocabulary 700 should be A1');
        if (getVocabularyCEFR(3000) !== 'B1') throw new Error('Vocabulary 3000 should be B1');
      },
    },
  ];
  
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
  console.log('\n============================================\n');
  
  if (failed > 0) {
    process.exit(1);
  }
}

// 如果直接运行此文件
runTests();
