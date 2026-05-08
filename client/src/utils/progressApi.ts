/**
 * 服务端文件: server/src/routes/progress.ts
 * 接口: GET /api/v1/progress/enrollment/:enrollmentId
 * Header参数: Authorization: Bearer <token>
 */
const getEnrollmentProgress = async (token: string, enrollmentId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/progress/enrollment/${enrollmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/progress.ts
 * 接口: POST /api/v1/progress/lesson
 * Header参数: Authorization: Bearer <token>
 * Body参数: enrollmentId: string, lessonIndex: number, status?: string, timeSpent?: number, quizScore?: number, notes?: string
 */
const updateLessonProgress = async (token: string, params: {
  enrollmentId: string;
  lessonIndex: number;
  status?: string;
  timeSpent?: number;
  quizScore?: number;
  notes?: string;
}) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/progress/lesson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/progress.ts
 * 接口: GET /api/v1/progress/user
 * Header参数: Authorization: Bearer <token>
 */
const getUserProgress = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/progress/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/progress.ts
 * 接口: GET /api/v1/progress/weekly-summary
 * Header参数: Authorization: Bearer <token>
 */
const getWeeklySummary = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/progress/weekly-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const progressApi = {
  getEnrollmentProgress,
  updateLessonProgress,
  getUserProgress,
  getWeeklySummary,
};
