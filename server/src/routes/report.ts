import express from 'express';
import { assessmentReports, assessments, courses, enrollments, generateId } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

interface AuthRequest extends Record<string, any> {
  userId?: string;
  userRole?: string;
}

const { Router, Response } = express;
const router = Router();

// Get all assessment reports for user
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const reports = assessmentReports
      .filter(r => r.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Add assessment info to each report
    const reportsWithInfo = reports.map(report => {
      const assessment = assessments.find(a => a.id === report.assessmentId);
      return { ...report, assessment };
    });
    
    res.json({ reports: reportsWithInfo });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Get latest report
router.get('/latest', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const latestReport = assessmentReports
      .filter(r => r.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!latestReport) {
      return res.status(404).json({ error: 'No reports found' });
    }
    
    const assessment = assessments.find(a => a.id === latestReport.assessmentId);
    
    // Get recommended courses based on level
    const recommendedCourses = courses
      .filter(c => 
        c.status === 'active' &&
        (c.cambridgeLevel === latestReport.cambridgeLevel ||
         getNextLevel(latestReport.cambridgeLevel) === c.cambridgeLevel)
      )
      .slice(0, 3);
    
    res.json({ 
      report: { ...latestReport, assessment },
      recommendedCourses 
    });
  } catch (error) {
    console.error('Get latest report error:', error);
    res.status(500).json({ error: 'Failed to get latest report' });
  }
});

// Get progress comparison over time
router.get('/progress', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const reports = assessmentReports
      .filter(r => r.userId === req.userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    if (reports.length < 2) {
      return res.json({ 
        message: 'Need at least 2 assessments for progress comparison',
        progressData: []
      });
    }
    
    const progressData = reports.map(r => ({
      date: r.createdAt,
      cambridgeLevel: r.cambridgeLevel,
      overallScore: r.overallScore,
      listeningScore: r.listeningScore,
      readingScore: r.readingScore,
      writingScore: r.writingScore,
      speakingScore: r.speakingScore
    }));
    
    // Calculate improvement
    const firstReport = reports[0];
    const lastReport = reports[reports.length - 1];
    
    const improvement = {
      overall: lastReport.overallScore - firstReport.overallScore,
      listening: (lastReport.listeningScore || 0) - (firstReport.listeningScore || 0),
      reading: (lastReport.readingScore || 0) - (firstReport.readingScore || 0),
      writing: (lastReport.writingScore || 0) - (firstReport.writingScore || 0),
      speaking: (lastReport.speakingScore || 0) - (firstReport.speakingScore || 0)
    };
    
    res.json({ 
      progressData,
      improvement,
      assessmentCount: reports.length,
      averageScore: Math.round(
        reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length
      )
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Get report detail
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const report = assessmentReports.find(r => 
      r.id === id && r.userId === req.userId
    );
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const assessment = assessments.find(a => a.id === report.assessmentId);
    
    // Get recommended courses
    const recommendedCourses = courses
      .filter(c => 
        c.status === 'active' &&
        (c.cambridgeLevel === report.cambridgeLevel ||
         getNextLevel(report.cambridgeLevel) === c.cambridgeLevel)
      )
      .slice(0, 3);
    
    // Generate detailed analysis
    const detailedAnalysis = generateDetailedAnalysis(report);
    
    res.json({ 
      report: { ...report, assessment },
      recommendedCourses,
      detailedAnalysis
    });
  } catch (error) {
    console.error('Get report detail error:', error);
    res.status(500).json({ error: 'Failed to get report detail' });
  }
});

// Get skill breakdown
router.get('/:id/skills', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const report = assessmentReports.find(r => 
      r.id === id && r.userId === req.userId
    );
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const skills = [
      {
        name: '听力',
        nameEn: 'Listening',
        score: report.listeningScore || 0,
        status: getSkillStatus(report.listeningScore || 0),
        description: getListeningDescription(report.listeningScore || 0)
      },
      {
        name: '阅读',
        nameEn: 'Reading',
        score: report.readingScore || 0,
        status: getSkillStatus(report.readingScore || 0),
        description: getReadingDescription(report.readingScore || 0)
      },
      {
        name: '写作',
        nameEn: 'Writing',
        score: report.writingScore || 0,
        status: getSkillStatus(report.writingScore || 0),
        description: getWritingDescription(report.writingScore || 0)
      },
      {
        name: '口语',
        nameEn: 'Speaking',
        score: report.speakingScore || 0,
        status: getSkillStatus(report.speakingScore || 0),
        description: getSpeakingDescription(report.speakingScore || 0)
      }
    ];
    
    res.json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

// Helper functions
function getNextLevel(current: string): string {
  const levels: Record<string, string> = {
    'Pre-A1': 'A1',
    'A1': 'A2',
    'A2': 'B1',
    'B1': 'B2',
    'B2': 'C1'
  };
  return levels[current] || current;
}

function getSkillStatus(score: number): 'excellent' | 'good' | 'average' | 'needs_improvement' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'average';
  return 'needs_improvement';
}

function getListeningDescription(score: number): string {
  if (score >= 85) return '能够准确理解日常对话和简单短文，捕捉关键信息和细节';
  if (score >= 70) return '基本理解简单对话，对主要信息把握较好，偶有遗漏';
  if (score >= 55) return '能理解简单词汇和句子，但长对话理解有困难';
  return '需要加强基础听力训练，建议多听英语儿歌和简单对话';
}

function getReadingDescription(score: number): string {
  if (score >= 85) return '阅读理解能力强，能够快速获取文章主旨和细节';
  if (score >= 70) return '能够理解常见话题的文章，对主要内容把握较好';
  if (score >= 55) return '能理解简单句子，但复杂文章理解有困难';
  return '词汇量需要扩充，建议加强基础阅读训练';
}

function getWritingDescription(score: number): string {
  if (score >= 85) return '书面表达能力优秀，语法准确，句型多样，逻辑清晰';
  if (score >= 70) return '能够完成基本写作任务，语法错误较少';
  if (score >= 55) return '能写出简单句子，但复杂句式和连词使用不足';
  return '需要加强语法基础和句型练习，多进行写作训练';
}

function getSpeakingDescription(score: number): string {
  if (score >= 85) return '口语表达流畅自然，发音清晰，能够进行有效沟通';
  if (score >= 70) return '能够进行基本口语交流，表达较为清晰';
  if (score >= 55) return '能表达简单意思，但流利度和准确性需要提高';
  return '建议增加口语练习机会，模仿标准发音';
}

function generateDetailedAnalysis(report: typeof assessmentReports[0]): any {
  return {
    summary: {
      overallLevel: report.cambridgeLevel,
      overallBand: convertScoreToBand(report.overallScore),
      percentile: report.comparedPeers?.percentile || 50,
      peerAverage: report.comparedPeers?.average || 65
    },
    skillsAnalysis: {
      listening: {
        score: report.listeningScore,
        band: convertScoreToBand(report.listeningScore || 0),
        strength: (report.listeningScore || 0) >= 75,
        focusAreas: (report.listeningScore || 0) < 75 ? ['辨音训练', '连读弱读', '关键词捕捉'] : []
      },
      reading: {
        score: report.readingScore,
        band: convertScoreToBand(report.readingScore || 0),
        strength: (report.readingScore || 0) >= 75,
        focusAreas: (report.readingScore || 0) < 75 ? ['词汇积累', '句型理解', '阅读速度'] : []
      },
      writing: {
        score: report.writingScore,
        band: convertScoreToBand(report.writingScore || 0),
        strength: (report.writingScore || 0) >= 75,
        focusAreas: (report.writingScore || 0) < 75 ? ['语法基础', '句型多样', '写作逻辑'] : []
      },
      speaking: {
        score: report.speakingScore,
        band: convertScoreToBand(report.speakingScore || 0),
        strength: (report.speakingScore || 0) >= 75,
        focusAreas: (report.speakingScore || 0) < 75 ? ['发音纠正', '流利度', '口语素材'] : []
      }
    },
    learningPath: generateLearningPath(report)
  };
}

function convertScoreToBand(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  return 'D';
}

function generateLearningPath(report: typeof assessmentReports[0]): any[] {
  const path = [];
  
  // Current level
  path.push({
    level: report.cambridgeLevel,
    status: 'current',
    score: report.overallScore,
    action: '完成当前级别核心课程'
  });
  
  // Next level
  const nextLevel = getNextLevel(report.cambridgeLevel);
  if (report.overallScore >= 75) {
    path.push({
      level: nextLevel,
      status: 'recommended',
      score: null,
      action: '建议进入下一级别学习'
    });
  } else {
    path.push({
      level: report.cambridgeLevel,
      status: 'strengthen',
      score: null,
      action: '强化当前级别薄弱环节'
    });
  }
  
  return path;
}

export default router;
