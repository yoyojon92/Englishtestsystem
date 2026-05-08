# 英语能力测评与课程服务系统 - API 接口文档

## 一、接口规范

### 1.1 基本信息

| 项目 | 说明 |
|------|------|
| 协议 | HTTPS |
| 数据格式 | JSON |
| 编码 | UTF-8 |
| 认证方式 | JWT Bearer Token |

### 1.2 统一前缀

```
/api/v1/{module}/{resource}
```

### 1.3 统一响应格式

```json
{
  "code": 200,           // 状态码
  "message": "success",   // 消息
  "data": {},            // 数据
  "timestamp": 1700000000  // 时间戳
}
```

### 1.4 错误码定义

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 二、认证模块 (Auth)

### 2.1 发送验证码
```
POST /api/v1/auth/send-code
```

**请求参数：**
```json
{
  "phone": "13800138000",
  "type": "login"      // login | bind
}
```

**响应：**
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expiresIn": 300
  }
}
```

### 2.2 手机号登录
```
POST /api/v1/auth/login
```

**请求参数：**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": "u_xxx",
    "expiresIn": 86400
  }
}
```

### 2.3 获取用户信息
```
GET /api/v1/auth/me
```

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "userId": "u_xxx",
    "nickname": "张三",
    "avatar": "https://...",
    "phone": "138****8000",
    "children": [
      {
        "childId": "c_xxx",
        "name": "张小明",
        "gender": "male",
        "age": 10,
        "grade": "四年级",
        "avatar": "https://..."
      }
    ]
  }
}
```

---

## 三、测评模块 (Assessment)

### 3.1 获取测评级别
```
GET /api/v1/assessments/levels
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "level": "Pre-A1",
      "name": "零基础",
      "description": "适合刚开始接触英语的孩子",
      "estimatedVocab": "0-500"
    },
    {
      "level": "A1",
      "name": "入门级",
      "description": "掌握基础词汇和简单句型",
      "estimatedVocab": "500-1000"
    },
    {
      "level": "A2",
      "name": "基础级",
      "description": "可以进行日常简单交流",
      "estimatedVocab": "1000-2000"
    }
  ]
}
```

### 3.2 开始测评
```
POST /api/v1/assessments/start
```

**请求参数：**
```json
{
  "childId": "c_xxx",
  "level": "A1",
  "modules": ["vocabulary", "listening", "speaking", "reading", "writing"]
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "sessionId": "s_xxx",
    "totalQuestions": 50,
    "estimatedMinutes": 15,
    "questions": [
      {
        "questionId": "q_001",
        "type": "vocabulary",
        "content": {
          "word": "apple",
          "options": ["苹果", "香蕉", "橙子", "葡萄"]
        },
        "timeLimit": 30
      }
    ]
  }
}
```

### 3.3 提交测评答案
```
POST /api/v1/assessments/answer
```

**请求参数：**
```json
{
  "sessionId": "s_xxx",
  "questionId": "q_001",
  "answer": "苹果",
  "timeSpent": 5
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "correct": true,
    "nextQuestion": {
      "questionId": "q_002",
      "type": "vocabulary",
      "content": {...},
      "timeLimit": 30
    }
  }
}
```

### 3.4 提交测评并生成报告
```
POST /api/v1/assessments/submit
```

**请求参数：**
```json
{
  "sessionId": "s_xxx"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "orderId": "o_xxx",
    "amount": 59.9,
    "paymentRequired": true
  }
}
```

### 3.5 支付测评订单
```
POST /api/v1/assessments/pay
```

**请求参数：**
```json
{
  "orderId": "o_xxx",
  "paymentMethod": "wechat"   // wechat | alipay
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "paymentId": "p_xxx",
    "paymentParams": {...}    // 微信/支付宝支付参数
  }
}
```

### 3.6 获取测评报告
```
GET /api/v1/assessments/report/{reportId}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "reportId": "r_xxx",
    "childId": "c_xxx",
    "childName": "张小明",
    "overallLevel": "A2",
    "scores": {
      "vocabulary": {
        "score": 78,
        "level": "A2",
        "vocabularySize": 1650
      },
      "listening": {
        "score": 82,
        "level": "A2"
      },
      "speaking": {
        "score": 75,
        "level": "A2",
        "pronunciation": 78,
        "fluency": 72,
        "accuracy": 75
      },
      "reading": {
        "score": 80,
        "level": "A2"
      },
      "writing": {
        "score": 70,
        "level": "A2"
      }
    },
    "weakPoints": ["时态运用", "听力长句理解"],
    "strongPoints": ["词汇积累", "口语发音"],
    "recommendations": [
      "建议加强一般过去时的练习",
      "建议每天进行15分钟听力训练"
    ],
    "generatedAt": "2024-01-15T10:30:00Z",
    "reportImageUrl": "https://..."
  }
}
```

---

## 四、课程模块 (Course)

### 4.1 获取课程列表
```
GET /api/v1/courses
```

**Query参数：**
```
level=A1&type=online&page=1&pageSize=10
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "courseId": "cs_xxx",
        "name": "A1 口语强化班",
        "description": "针对A1水平的口语专项训练",
        "coverImage": "https://...",
        "level": "A1",
        "type": "online",
        "price": 2999,
        "originalPrice": 3999,
        "duration": "12周",
        "lessonsCount": 24,
        "rating": 4.8,
        "enrolledCount": 1250
      }
    ]
  }
}
```

### 4.2 获取课程详情
```
GET /api/v1/courses/{courseId}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "courseId": "cs_xxx",
    "name": "A1 口语强化班",
    "description": "...",
    "coverImage": "https://...",
    "level": "A1",
    "type": "online",
    "price": 2999,
    "chapters": [
      {
        "chapterId": "ch_001",
        "title": "第一章：基础问候",
        "lessons": [
          {
            "lessonId": "ls_001",
            "title": "Lesson 1: Hello!",
            "duration": 15,
            "videoUrl": "https://..."
          }
        ]
      }
    ],
    "teachers": [
      {
        "teacherId": "t_xxx",
        "name": "Sarah老师",
        "avatar": "https://...",
        "title": "剑桥认证培训师"
      }
    ]
  }
}
```

### 4.3 购买课程
```
POST /api/v1/courses/purchase
```

**请求参数：**
```json
{
  "courseId": "cs_xxx",
  "childId": "c_xxx",
  "paymentMethod": "wechat"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "orderId": "o_xxx",
    "paymentParams": {...}
  }
}
```

---

## 五、考试模块 (Exam) ⭐核心

### 5.1 获取考试列表
```
GET /api/v1/exams
```

**Query参数：**
```
level=A2&type=yle
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "examId": "ex_001",
      "examType": "yle_flyers",
      "examName": "YLE Flyers",
      "cefrLevel": "A2",
      "description": "剑桥少儿英语高级",
      "targetAge": "9-12岁",
      "recommendedVocab": 2000,
      "examStructure": {
        "listening": {"duration": 25, "questions": 6},
        "reading": {"duration": 40, "questions": 7},
        "writing": {"duration": 20, "questions": 2}
      }
    },
    {
      "examId": "ex_002",
      "examType": "ket",
      "examName": "KET",
      "cefrLevel": "A2",
      "description": "剑桥英语初级认证",
      "targetAge": "10-14岁",
      "recommendedVocab": 1500
    }
  ]
}
```

### 5.2 获取考试详情
```
GET /api/v1/exams/{examId}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "examId": "ex_002",
    "examType": "ket",
    "examName": "KET",
    "cefrLevel": "A2",
    "description": "...",
    "examStructure": {
      "reading_writing": {
        "duration": 60,
        "questions": 50,
        "parts": [
          {"part": 1, "type": "选项匹配", "count": 5},
          {"part": 2, "type": "完形填空", "count": 8}
        ]
      },
      "listening": {
        "duration": 30,
        "questions": 25
      },
      "speaking": {
        "duration": 10,
        "parts": [
          {"part": 1, "type": "问答", "duration": "3-4分钟"},
          {"part": 2, "type": "看图说话", "duration": "3-4分钟"}
        ]
      }
    },
    "gradingStandard": {
      "distinction": {"min": 140, "max": 150},
      "merit": {"min": 133, "max": 139},
      "pass": {"min": 120, "max": 132},
      "level_a1": {"min": 100, "max": 119}
    },
    "passRate": 65.5,
    "examFrequency": "每年4次"
  }
}
```

### 5.3 获取考试场次
```
GET /api/v1/exams/{examId}/sessions
```

**Query参数：**
```
city=北京&date=2024-03
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "sessionId": "ss_001",
      "examId": "ex_002",
      "city": "北京",
      "centerName": "北京外国语大学考点",
      "centerAddress": "北京市海淀区西三环北路19号",
      "examDates": {
        "paper": "2024-04-13",
        "computer": "2024-04-14"
      },
      "registrationOpenDate": "2024-02-01",
      "registrationCloseDate": "2024-03-15",
      "ticketDownloadDate": "2024-04-01",
      "resultDate": "2024-05-20",
      "totalSeats": 200,
      "availableSeats": 45,
      "fee": 500,
      "status": "registration_open"
    }
  ]
}
```

### 5.4 提交考试报名
```
POST /api/v1/exams/registrations
```

**请求参数：**
```json
{
  "sessionId": "ss_001",
  "childId": "c_xxx",
  "studentInfo": {
    "name": "张小明",
    "gender": "male",
    "birthday": "2014-05-01",
    "idCard": "11010120140501XXXX",
    "photoUrl": "https://..."
  },
  "parentInfo": {
    "name": "张三",
    "phone": "13800138000",
    "relationship": "父亲"
  },
  "serviceType": "vip"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "registrationId": "reg_xxx",
    "serviceFee": 199,
    "paymentRequired": true
  }
}
```

### 5.5 支付报名费
```
POST /api/v1/exams/registrations/{registrationId}/pay
```

**请求参数：**
```json
{
  "paymentMethod": "wechat"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "paymentParams": {...}
  }
}
```

### 5.6 获取报名列表
```
GET /api/v1/exams/registrations
```

**Query参数：**
```
status=approved&page=1
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "total": 5,
    "items": [
      {
        "registrationId": "reg_xxx",
        "examName": "KET",
        "sessionInfo": {
          "city": "北京",
          "examDate": "2024-04-13",
          "centerName": "北京外国语大学考点"
        },
        "serviceType": "vip",
        "serviceFee": 199,
        "status": "approved",
        "ticketUrl": "https://...",
        "resultScore": null
      }
    ]
  }
}
```

### 5.7 获取报名详情
```
GET /api/v1/exams/registrations/{registrationId}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "registrationId": "reg_xxx",
    "examName": "KET",
    "statusTimeline": [
      {"status": "pending", "time": "2024-02-15 10:00"},
      {"status": "submitted", "time": "2024-02-15 10:05"},
      {"status": "under_review", "time": "2024-02-15 14:00"},
      {"status": "approved", "time": "2024-02-16 09:00"}
    ],
    "currentStatus": "approved",
    "nextStep": {
      "action": "下载准考证",
      "deadline": "2024-04-01",
      "url": "https://..."
    }
  }
}
```

---

## 六、模拟考试模块 (Mock Exam)

### 6.1 获取模拟考试
```
GET /api/v1/mock-exams
```

**Query参数：**
```
examType=ket&childId=c_xxx
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "examId": "me_001",
      "examType": "ket",
      "examDate": "2024-01-10T14:00:00Z",
      "totalScore": 135,
      "totalMax": 150,
      "predictedGrade": "Merit",
      "passConfidencePct": 85,
      "scores": {
        "reading": {"score": 45, "max": 50},
        "writing": {"score": 32, "max": 40},
        "listening": {"score": 22, "max": 25},
        "speaking": {"score": 28, "max": 30}
      },
      "isPassReady": true
    }
  ]
}
```

### 6.2 开始模拟考试
```
POST /api/v1/mock-exams/start
```

**请求参数：**
```json
{
  "childId": "c_xxx",
  "examType": "ket",
  "modules": ["reading", "writing", "listening", "speaking"]
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "examId": "me_002",
    "totalQuestions": 100,
    "totalDuration": 150,    // 分钟
    "modules": [
      {
        "name": "Reading & Writing",
        "duration": 60,
        "questionCount": 55
      },
      {
        "name": "Listening",
        "duration": 30,
        "questionCount": 25
      },
      {
        "name": "Speaking",
        "duration": 10,
        "questionCount": 4
      }
    ]
  }
}
```

### 6.3 提交模拟考试答案
```
POST /api/v1/mock-exams/answer
```

**请求参数：**
```json
{
  "examId": "me_002",
  "questionId": "q_001",
  "answer": "A",
  "timeSpent": 45
}
```

### 6.4 获取口语考试题目
```
GET /api/v1/mock-exams/{examId}/speaking
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "examId": "me_002",
    "parts": [
      {
        "part": 1,
        "type": "greeting_questions",
        "questions": [
          "What's your name?",
          "How old are you?"
        ],
        "timeLimit": 180
      },
      {
        "part": 2,
        "type": "picture_description",
        "imageUrl": "https://...",
        "preparationTime": 60,
        "speakingTime": 120
      },
      {
        "part": 3,
        "type": "collaborative_task",
        "scenario": "Two children are talking about food...",
        "timeLimit": 180
      }
    ]
  }
}
```

### 6.5 提交口语答案
```
POST /api/v1/mock-exams/speaking/submit
```

**请求参数：**
```json
{
  "examId": "me_002",
  "part": 1,
  "audioUrl": "https://...",
  "duration": 15
}
```

### 6.6 获取模拟考试报告
```
GET /api/v1/mock-exams/{examId}/report
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "examId": "me_001",
    "examType": "ket",
    "examDate": "2024-01-10",
    "totalScore": 135,
    "totalMax": 150,
    "percentage": 90,
    "predictedGrade": "Merit",
    "passConfidencePct": 85,
    "isPassReady": true,
    "scores": {
      "reading": {
        "score": 45,
        "max": 50,
        "percentage": 90,
        "accuracy": [
          {"type": "vocabulary", "correct": 85},
          {"type": "grammar", "correct": 88},
          {"type": "comprehension", "correct": 92}
        ]
      },
      "writing": {...},
      "listening": {...},
      "speaking": {...}
    },
    "weakPoints": [
      {"topic": "时态", "accuracy": 65, "suggestion": "加强一般过去时练习"}
    ],
    "improvement": {
      "comparedToLast": "+5分",
      "trend": "improving"
    },
    "recommendations": [
      "建议加强写作部分的句子衔接",
      "听力长对话需要更多练习"
    ],
    "nextExamPlan": {
      "suggestedDate": "2024-02-01",
      "focusAreas": ["写作", "听力"]
    }
  }
}
```

---

## 七、进度模块 (Progress)

### 7.1 获取学习进度
```
GET /api/v1/progress/{childId}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "childId": "c_xxx",
    "streak": {
      "currentDays": 7,
      "longestDays": 21,
      "lastStudyDate": "2024-01-15"
    },
    "courses": [
      {
        "courseId": "cs_xxx",
        "courseName": "A1 口语强化班",
        "progress": 65,
        "lastLesson": {
          "lessonId": "ls_015",
          "title": "Lesson 15: At School"
        }
      }
    ],
    "stats": {
      "totalLearningMinutes": 1250,
      "totalLessonsCompleted": 45,
      "thisWeekMinutes": 120
    }
  }
}
```

### 7.2 记录学习时长
```
POST /api/v1/progress/record
```

**请求参数：**
```json
{
  "childId": "c_xxx",
  "courseId": "cs_xxx",
  "lessonId": "ls_015",
  "duration": 15
}
```

---

## 八、报告模块 (Report)

### 8.1 获取报告列表
```
GET /api/v1/reports
```

**Query参数：**
```
childId=c_xxx&type=assessment
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "reportId": "rpt_001",
      "type": "assessment",
      "title": "英语能力综合测评报告",
      "summary": "CEFR A2水平，词汇量1650",
      "overallLevel": "A2",
      "generatedAt": "2024-01-15T10:30:00Z",
      "childName": "张小明"
    }
  ]
}
```

---

## 九、学校模块 (School)

### 9.1 获取学校列表
```
GET /api/v1/schools
```

**Query参数：**
```
city=北京&page=1
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "schoolId": "sch_001",
      "name": "星光剑桥英语",
      "address": "北京市朝阳区建国路88号",
      "rating": 4.8,
      "coursesCount": 15,
      "teachersCount": 8,
      "distance": "1.2km"
    }
  ]
}
```

### 9.2 获取学校详情
```
GET /api/v1/schools/{schoolId}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "schoolId": "sch_001",
    "name": "星光剑桥英语",
    "address": "北京市朝阳区建国路88号",
    "phone": "400-888-6666",
    "businessHours": "周一~周日 9:00-21:00",
    "description": "...",
    "rating": 4.8,
    "courses": [...],
    "teachers": [...],
    "reviews": [...],
    "photos": [...]
  }
}
```

---

## 十、渠道模块 (Channel)

### 10.1 记录渠道访问
```
POST /api/v1/channels/visit
```

**请求参数：**
```json
{
  "channel": "poster",
  "schoolId": "sch_001",
  "teacherId": "t_xxx",
  "activityId": "act_xxx"
}
```

### 10.2 生成渠道二维码
```
POST /api/v1/channels/qr
```

**请求参数：**
```json
{
  "channelType": "poster",
  "schoolId": "sch_001",
  "teacherId": "t_xxx",
  "logo": "https://...",
  "color": "#FF6B35"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "channelId": "ch_xxx",
    "qrCodeUrl": "https://...",
    "shortUrl": "https://exam.cn/abc123"
  }
}
```

---

## 十一、WebSocket 实时接口

### 11.1 AI 口语考官
```
ws://api.example.com/ws/speaking/{examId}
```

**消息格式：**
```json
{
  "type": "message",      // message | audio | score
  "content": "Hello, how are you today?",
  "timestamp": 1700000000
}
```
