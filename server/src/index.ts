import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { questions } from './db/inMemory.js';
import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessment.js';
import courseRoutes from './routes/course.js';
import progressRoutes from './routes/progress.js';
import reportRoutes from './routes/report.js';
import examRoutes from './routes/exam.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notification/index.js';
import freeCourseRoutes from './routes/free-course/index.js';
import wecomRoutes from './routes/wecom/index.js';
import studentProfileRoutes from './routes/student-profile/index.js';
import paymentRoutes from './routes/payment.js';
import mockExamRoutes from './routes/mock-exam.js';
import prepPlanRoutes from './routes/prep-plan.js';
import cefrRoutes from './routes/cefr.js';
import qrcodeRoutes from './routes/qrcode.js';
import questionsRoutes from './routes/questions.js';
import learningPlanRoutes from './routes/learning-plan.js';
import answersRoutes from './routes/answers.js';
import diagnosisRoutes from './routes/diagnosis.js';
import testRoutes from './routes/test.js';
import { loadExamsFromDirectory, loadAllExams } from './db/loadExamData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 9091;

// Load all KET/PET questions into memory on startup
if (process.env.NODE_ENV !== 'production') {
  const ketPath = path.join(__dirname, 'db/questions/ket');
  const petPath = path.join(__dirname, 'db/questions/pet');
  try {
    const ketCount = loadExamsFromDirectory(ketPath);
    const petCount = loadExamsFromDirectory(petPath);
    console.log(`✅ Loaded ${ketCount + petCount} questions (KET: ${ketCount}, PET: ${petCount})`);
    console.log(`   questions Map size: ${questions.size}`);
  } catch (err) {
    console.log('⚠️ Could not load questions:', (err as Error).message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/free-courses', freeCourseRoutes);
app.use('/api/v1/wecom', wecomRoutes);
app.use('/api/v1/student-profile', studentProfileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/mock-exam', mockExamRoutes);
app.use('/api/v1/prep-plan', prepPlanRoutes);
app.use('/api/v1/cefr', cefrRoutes);
app.use('/api/v1/qrcode', qrcodeRoutes);
app.use('/api/v1/questions', questionsRoutes);
app.use('/api/v1/learning-plan', learningPlanRoutes);
app.use('/api/v1/answers', answersRoutes);
app.use('/api/v1/diagnosis', diagnosisRoutes);
app.use('/api/v1/test', testRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/api/v1/debug/questions', (req, res) => {
  res.json({ 
    questionsSize: questions.size,
    questionIds: Array.from(questions.keys()).slice(0, 5)
  });
});

// Share API 路由 (分享链接与渠道追踪)
import shareRouter from './routes/share';
app.use('/api/v1/share', shareRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
