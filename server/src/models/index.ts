// In-memory data store for MVP (Replace with real database in production)

// Users: Parents and Students
export interface User {
  id: string;
  phone: string;
  password: string; // hashed
  name: string;
  avatar?: string;
  role: 'parent' | 'student';
  parentId?: string; // if role is student
  grade?: string; // K1-K12
  createdAt: string;
  updatedAt: string;
}

// Assessment Records
export interface Assessment {
  id: string;
  userId: string;
  type: 'initial' | 'checkpoint' | 'certification';
  cambridgeLevel?: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  totalQuestions: number;
  answeredQuestions: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Assessment Questions
export interface AssessmentQuestion {
  id: string;
  assessmentType: 'initial' | 'checkpoint' | 'certification';
  cambridgeLevel?: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
  category: 'listening' | 'reading' | 'writing' | 'speaking';
  difficulty: 1 | 2 | 3;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
}

// Courses
export interface Course {
  id: string;
  title: string;
  description: string;
  cambridgeLevel: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
  targetAge: string;
  duration: number; // weeks
  lessons: number;
  price: number;
  originalPrice?: number;
  coverImage: string;
  tags: string[];
  features: string[];
  syllabus: CourseLesson[];
  status: 'active' | 'inactive' | 'draft';
  enrollmentCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  week: number;
  title: string;
  topics: string[];
  objectives: string[];
}

// Course Enrollments
export interface Enrollment {
  id: string;
  userId: string;
  studentId?: string;
  courseId: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  startDate: string;
  endDate?: string;
  createdAt: string;
}

// Learning Progress
export interface LearningProgress {
  id: string;
  userId: string;
  enrollmentId: string;
  lessonIndex: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  timeSpent: number; // minutes
  quizScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Assessment Reports
export interface AssessmentReport {
  id: string;
  userId: string;
  assessmentId: string;
  cambridgeLevel: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
  overallScore: number;
  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  speakingScore?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
  comparedPeers?: {
    percentile: number;
    average: number;
  };
  createdAt: string;
}

// Data Store
export const users: User[] = [];
export const assessments: Assessment[] = [];
export const assessmentQuestions: AssessmentQuestion[] = [];
export const courses: Course[] = [];
export const enrollments: Enrollment[] = [];
export const learningProgress: LearningProgress[] = [];
export const assessmentReports: AssessmentReport[] = [];

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
