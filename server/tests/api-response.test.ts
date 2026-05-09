/**
 * 英语能力测评与课程服务系统 - API 响应格式测试
 * 测试所有 API 端点的响应格式是否符合预期
 */

import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:9091/api/v1';

// 测试配置
const TEST_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 测试结果收集
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

// 辅助函数
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    results.push({
      name,
      status: 'PASS',
      message: 'Test passed',
      duration: Date.now() - startTime,
    });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({
      name,
      status: 'FAIL',
      message: error.message || 'Unknown error',
      duration: Date.now() - startTime,
    });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// ============ API 响应格式测试 ============

describe('API Response Format Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testChildId: string;

  // 健康检查测试
  describe('Health Check', () => {
    it('GET /health should return healthy status', async () => {
      const response = await axios.get(`${API_BASE}/health`, TEST_CONFIG);
      
      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.status === 'healthy', 'Status should be healthy');
    });
  });

  // 认证模块测试
  describe('Auth Module', () => {
    it('POST /auth/register should create user with valid format', async () => {
      const testPhone = `138${Date.now().toString().slice(-8)}`;
      const response = await axios.post(
        `${API_BASE}/auth/register`,
        {
          phone: testPhone,
          password: 'Test123456',
          nickname: 'Test User',
        },
        TEST_CONFIG
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.token, 'Response should contain token');
      assert(response.data.data?.user, 'Response should contain user object');
      
      authToken = response.data.data.token;
      testUserId = response.data.data.user.id;
    });

    it('POST /auth/login should return valid format', async () => {
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        {
          phone: '13800138001',
          password: 'Test123456',
        },
        TEST_CONFIG
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.token, 'Response should contain token');
    });

    it('GET /auth/me should return user profile', async () => {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        ...TEST_CONFIG,
        headers: {
          ...TEST_CONFIG.headers,
          Authorization: `Bearer ${authToken}`,
        },
      });

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.id, 'Response should contain user id');
      assert(response.data.data?.phone, 'Response should contain phone');
    });
  });

  // 学员管理测试
  describe('Children Module', () => {
    it('POST /children should create child profile', async () => {
      const response = await axios.post(
        `${API_BASE}/children`,
        {
          name: '测试学员',
          gender: 'male',
          birthday: '2015-06-15',
          grade: 3,
        },
        {
          ...TEST_CONFIG,
          headers: {
            ...TEST_CONFIG.headers,
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.id, 'Response should contain child id');
      assert(response.data.data?.name === '测试学员', 'Name should match');
      
      testChildId = response.data.data.id;
    });

    it('GET /children should return list with pagination', async () => {
      const response = await axios.get(`${API_BASE}/children`, {
        ...TEST_CONFIG,
        headers: {
          ...TEST_CONFIG.headers,
          Authorization: `Bearer ${authToken}`,
        },
      });

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data?.list), 'Data should contain list array');
      assert(typeof response.data.data?.total === 'number', 'Data should contain total count');
    });
  });

  // 测评模块测试
  describe('Assessment Module', () => {
    it('GET /assessment/catalog should return exam catalog', async () => {
      const response = await axios.get(`${API_BASE}/assessment/catalog`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data), 'Data should be array');
    });

    it('POST /assessment/start should start assessment', async () => {
      const response = await axios.post(
        `${API_BASE}/assessment/start`,
        {
          childId: testChildId,
          type: 'vocabulary',
        },
        {
          ...TEST_CONFIG,
          headers: {
            ...TEST_CONFIG.headers,
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.sessionId, 'Response should contain sessionId');
    });
  });

  // 课程模块测试
  describe('Course Module', () => {
    it('GET /courses should return course list', async () => {
      const response = await axios.get(`${API_BASE}/courses`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data), 'Data should be array');
    });

    it('GET /courses/:id should return course detail', async () => {
      const response = await axios.get(`${API_BASE}/courses/1`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.id, 'Response should contain course id');
    });

    it('GET /courses/categories should return categories', async () => {
      const response = await axios.get(`${API_BASE}/courses/categories`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data), 'Data should be array');
    });
  });

  // 考试模块测试
  describe('Exam Module', () => {
    it('GET /exam/catalog should return exam catalog', async () => {
      const response = await axios.get(`${API_BASE}/exam/catalog`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data), 'Data should be array');
    });

    it('GET /exam/sessions should return exam sessions', async () => {
      const response = await axios.get(`${API_BASE}/exam/sessions`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data), 'Data should be array');
    });
  });

  // 支付模块测试
  describe('Payment Module', () => {
    it('POST /payment/create should create payment order', async () => {
      const response = await axios.post(
        `${API_BASE}/payment/create`,
        {
          userId: testUserId,
          childId: testChildId,
          productType: 'assessment',
          productId: 'test-product',
          amount: 5990, // 59.9元
        },
        {
          ...TEST_CONFIG,
          headers: {
            ...TEST_CONFIG.headers,
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.orderNo, 'Response should contain orderNo');
    });

    it('GET /payment/list should return payment list', async () => {
      const response = await axios.get(`${API_BASE}/payment/list`, {
        ...TEST_CONFIG,
        headers: {
          ...TEST_CONFIG.headers,
          Authorization: `Bearer ${authToken}`,
        },
      });

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data?.orders), 'Data should contain orders array');
    });
  });

  // 学生画像测试
  describe('Student Profile Module', () => {
    it('GET /student-profile/:childId should return profile', async () => {
      const response = await axios.get(
        `${API_BASE}/student-profile/${testChildId}`,
        TEST_CONFIG
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(response.data.data?.childId === testChildId, 'Child ID should match');
    });
  });

  // 模拟考试测试
  describe('Mock Exam Module', () => {
    it('GET /mock-exam/sessions/:type should return sessions', async () => {
      const response = await axios.get(`${API_BASE}/mock-exam/sessions/KET`, TEST_CONFIG);

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data?.sessions), 'Data should contain sessions array');
    });
  });

  // CEFR 评估测试
  describe('CEFR Module', () => {
    it('GET /cefr/:childId/progress should return progress', async () => {
      const response = await axios.get(
        `${API_BASE}/cefr/${testChildId}/progress`,
        TEST_CONFIG
      );

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
    });
  });

  // 通知模块测试
  describe('Notification Module', () => {
    it('GET /notification should return notification list', async () => {
      const response = await axios.get(`${API_BASE}/notification`, {
        ...TEST_CONFIG,
        headers: {
          ...TEST_CONFIG.headers,
          Authorization: `Bearer ${authToken}`,
        },
      });

      assert(response.status === 200, 'Status should be 200');
      assert(response.data.success === true, 'Response should have success=true');
      assert(Array.isArray(response.data.data?.notifications), 'Data should contain notifications array');
    });
  });
});

// 输出测试结果
function printResults(): void {
  console.log('\n========== Test Results Summary ==========\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}\n`);
  
  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
  }
  
  console.log('\n==========================================\n');
}

// 运行测试并输出报告
printResults();
