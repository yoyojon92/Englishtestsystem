/**
 * 服务端文件: server/src/routes/report.ts
 * 接口: GET /api/v1/reports
 * Header参数: Authorization: Bearer <token>
 */
const getReports = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/report.ts
 * 接口: GET /api/v1/reports/latest
 * Header参数: Authorization: Bearer <token>
 */
const getLatestReport = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/reports/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/report.ts
 * 接口: GET /api/v1/reports/:id
 * Header参数: Authorization: Bearer <token>
 */
const getReportDetail = async (token: string, reportId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/reports/${reportId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/report.ts
 * 接口: GET /api/v1/reports/:id/skills
 * Header参数: Authorization: Bearer <token>
 */
const getReportSkills = async (token: string, reportId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/reports/${reportId}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/report.ts
 * 接口: GET /api/v1/reports/progress
 * Header参数: Authorization: Bearer <token>
 */
const getProgressComparison = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/reports/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const reportApi = {
  getReports,
  getLatestReport,
  getReportDetail,
  getReportSkills,
  getProgressComparison,
};
