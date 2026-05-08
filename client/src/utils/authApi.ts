/**
 * 服务端文件: server/src/routes/auth.ts
 * 接口: POST /api/v1/auth/login
 * Body参数: phone: string, password: string
 */
const login = async (phone: string, password: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/auth.ts
 * 接口: POST /api/v1/auth/register
 * Body参数: phone: string, password: string, name: string, role?: 'parent' | 'student', grade?: string
 */
const register = async (params: {
  phone: string;
  password: string;
  name: string;
  role?: 'parent' | 'student';
  grade?: string;
}) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/auth.ts
 * 接口: GET /api/v1/auth/me
 * Header参数: Authorization: Bearer <token>
 */
const getCurrentUser = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/auth.ts
 * 接口: PUT /api/v1/auth/profile
 * Header参数: Authorization: Bearer <token>
 * Body参数: name?: string, avatar?: string, grade?: string
 */
const updateProfile = async (token: string, params: { name?: string; avatar?: string; grade?: string }) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/profile`, {
    method: 'PUT',
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
 * 服务端文件: server/src/routes/auth.ts
 * 接口: POST /api/v1/auth/students
 * Header参数: Authorization: Bearer <token>
 * Body参数: name: string, grade?: string
 */
const addStudent = async (token: string, params: { name: string; grade?: string }) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/students`, {
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

export const authApi = {
  login,
  register,
  getCurrentUser,
  updateProfile,
  addStudent,
};
