import express, { type Response } from 'express';
import { learningProgress, enrollments, courses, generateId } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

interface AuthRequest extends Record<string, any> {
  userId?: string;
  userRole?: string;
}

const router = express.Router();

// Get learning progress for an enrollment
router.get('/enrollment/:enrollmentId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    
    const enrollment = enrollments.find(e => 
      e.id === enrollmentId && e.userId === req.userId
    );
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    const course = courses.find(c => c.id === enrollment.courseId);
    
    const progress = learningProgress
      .filter(p => p.enrollmentId === enrollmentId)
      .sort((a, b) => a.lessonIndex - b.lessonIndex);
    
    res.json({ 
      enrollment,
      course,
      progress,
      totalLessons: course?.syllabus.length || 0
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update lesson progress
router.post('/lesson', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId, lessonIndex, status, timeSpent, quizScore, notes } = req.body;
    
    if (!enrollmentId || lessonIndex === undefined) {
      return res.status(400).json({ error: 'Enrollment ID and lesson index are required' });
    }
    
    const enrollment = enrollments.find(e => 
      e.id === enrollmentId && e.userId === req.userId && e.status === 'active'
    );
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    const course = courses.find(c => c.id === enrollment.courseId);
    const totalLessons = course?.syllabus.length || 0;
    
    // Find existing progress or create new
    let progress = learningProgress.find(p => 
      p.enrollmentId === enrollmentId && p.lessonIndex === lessonIndex
    );
    
    if (progress) {
      // Update existing progress
      if (status) progress.status = status;
      if (timeSpent) progress.timeSpent += timeSpent;
      if (quizScore !== undefined) progress.quizScore = quizScore;
      if (notes) progress.notes = notes;
      if (status === 'completed') progress.completedAt = new Date().toISOString();
      progress.updatedAt = new Date().toISOString();
    } else {
      // Create new progress
      progress = {
        id: generateId(),
        userId: req.userId!,
        enrollmentId,
        lessonIndex,
        status: status || 'in_progress',
        timeSpent: timeSpent || 0,
        quizScore,
        notes,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      learningProgress.push(progress);
    }
    
    // Update enrollment progress percentage
    const completedLessons = learningProgress.filter(p => 
      p.enrollmentId === enrollmentId && p.status === 'completed'
    ).length;
    
    enrollment.progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    // Mark enrollment as completed if all lessons done
    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
      enrollment.endDate = new Date().toISOString();
    }
    
    res.json({ 
      message: 'Progress updated',
      progress,
      enrollmentProgress: enrollment.progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get all progress for user
router.get('/user', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userEnrollments = enrollments
      .filter(e => e.userId === req.userId)
      .map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        const progress = learningProgress
          .filter(p => p.enrollmentId === enrollment.id)
          .sort((a, b) => a.lessonIndex - b.lessonIndex);
        
        return {
          enrollment,
          course,
          progress,
          completedLessons: progress.filter(p => p.status === 'completed').length,
          totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
          averageQuizScore: progress.length > 0
            ? Math.round(progress.reduce((sum, p) => sum + (p.quizScore || 0), 0) / 
                progress.filter(p => p.quizScore !== undefined).length || 1)
            : null
        };
      });
    
    // Overall stats
    const totalEnrollments = userEnrollments.length;
    const completedCourses = userEnrollments.filter(e => e.enrollment.status === 'completed').length;
    const totalTimeSpent = userEnrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0);
    
    res.json({ 
      enrollments: userEnrollments,
      stats: {
        totalEnrollments,
        completedCourses,
        inProgressCourses: totalEnrollments - completedCourses,
        totalTimeSpent,
        totalTimeFormatted: formatTime(totalTimeSpent)
      }
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Get weekly study summary
router.get('/weekly-summary', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentProgress = learningProgress.filter(p => 
      p.userId === req.userId && 
      new Date(p.createdAt) >= weekAgo
    );
    
    // Group by day
    const dailyData: Record<string, { minutes: number; lessonsCompleted: number }> = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { minutes: 0, lessonsCompleted: 0 };
    }
    
    recentProgress.forEach(p => {
      const dateStr = p.createdAt.split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].minutes += p.timeSpent;
        if (p.status === 'completed') {
          dailyData[dateStr].lessonsCompleted++;
        }
      }
    });
    
    res.json({ 
      dailyData: Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .reverse(),
      weeklyTotal: {
        minutes: Object.values(dailyData).reduce((sum, d) => sum + d.minutes, 0),
        lessons: Object.values(dailyData).reduce((sum, d) => sum + d.lessonsCompleted, 0)
      }
    });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    res.status(500).json({ error: 'Failed to get weekly summary' });
  }
});

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
}

export default router;
