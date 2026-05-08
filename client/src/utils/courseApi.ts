/**
 * 服务端文件: server/src/routes/course.ts
 * 接口: GET /api/v1/courses
 * Header参数: Authorization?: Bearer <token>
 * Query参数: level?: string, age?: string, tag?: string, search?: string, sort?: string
 */
const getCourses = async (token?: string, params?: { 
  level?: string; 
  age?: string; 
  tag?: string; 
  search?: string; 
  sort?: string 
}) => {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const queryParams = new URLSearchParams();
  if (params?.level) queryParams.append('level', params.level);
  if (params?.age) queryParams.append('age', params.age);
  if (params?.tag) queryParams.append('tag', params.tag);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const queryString = queryParams.toString();
  const url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, { headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/course.ts
 * 接口: GET /api/v1/courses/:id
 * Header参数: Authorization?: Bearer <token>
 */
const getCourseDetail = async (token: string | undefined, courseId: string) => {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/${courseId}`, {
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/course.ts
 * 接口: GET /api/v1/courses/:id/syllabus
 */
const getCourseSyllabus = async (courseId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/${courseId}/syllabus`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/course.ts
 * 接口: POST /api/v1/courses/:id/enroll
 * Header参数: Authorization: Bearer <token>
 */
const enrollCourse = async (token: string, courseId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/course.ts
 * 接口: GET /api/v1/courses/my/enrollments
 * Header参数: Authorization: Bearer <token>
 */
const getMyEnrollments = async (token: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/my/enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

/**
 * 服务端文件: server/src/routes/course.ts
 * 接口: GET /api/v1/courses/:id/related
 */
const getRelatedCourses = async (courseId: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/${courseId}/related`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const courseApi = {
  getCourses,
  getCourseDetail,
  getCourseSyllabus,
  enrollCourse,
  getMyEnrollments,
  getRelatedCourses,
};
