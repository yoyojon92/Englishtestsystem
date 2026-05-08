/**
 * 服务端文件: server/src/routes/assessment.ts
 * 接口: GET /api/v1/assessments/levels
 * Header参数: Authorization?: Bearer <token>
 */
const getAssessmentLevels = async (token?: string) => {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assessments/levels`, {
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/assessment.ts
 * 接口: POST /api/v1/assessments
 * Header参数: Authorization: Bearer <token>
 * Body参数: type?: 'initial' | 'checkpoint' | 'certification', cambridgeLevel?: string
 */
const startAssessment = async (token: string, params?: { type?: string; cambridgeLevel?: string }) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params || {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/assessment.ts
 * 接口: GET /api/v1/assessments/:id/questions
 * Header参数: Authorization: Bearer <token>
 */
const getAssessmentQuestions = async (token: string, assessmentId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assessments/${assessmentId}/questions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/assessment.ts
 * 接口: POST /api/v1/assessments/:id/submit
 * Header参数: Authorization: Bearer <token>
 * Body参数: answers: Record<string, string> -- questionId: userAnswer
 */
const submitAssessment = async (token: string, assessmentId: string, answers: Record<string, string>) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assessments/${assessmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/assessment.ts
 * 接口: GET /api/v1/assessments/history
 * Header参数: Authorization: Bearer <token>
 */
const getAssessmentHistory = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assessments/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/assessment.ts
 * 接口: GET /api/v1/assessments/:id/report
 * Header参数: Authorization: Bearer <token>
 */
const getAssessmentReport = async (token: string, assessmentId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assessments/${assessmentId}/report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const assessmentApi = {
  getAssessmentLevels,
  startAssessment,
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentHistory,
  getAssessmentReport,
};
