import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 9091;

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

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
