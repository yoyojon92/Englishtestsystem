# 英语能力测评与课程服务系统 - 数据库设计

## 一、ER 图总览

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              用户体系 (User System)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────────┐          │
│   │   users     │ 1───N  │  children   │ 1───1  │ student_profiles │          │
│   ├─────────────┤         ├─────────────┤         ├─────────────────┤          │
│   │ user_id PK  │────────<│ child_id PK │────────<│ profile_id PK   │          │
│   │ openid      │         │ user_id FK  │         │ child_id FK     │          │
│   │ unionid     │         │ name        │         │ vocabulary_size │          │
│   │ nickname    │         │ gender      │         │ cefr_level      │          │
│   │ avatar      │         │ birthday    │         │ listening_score │          │
│   │ phone       │         │ grade       │         │ speaking_score  │          │
│   │ source_ch   │         │ avatar      │         │ reading_score   │          │
│   │ created_at  │         │ created_at  │         │ writing_score   │          │
│   └─────────────┘         └─────────────┘         │ weak_points JSON│          │
│                                                     │ strong_points  │          │
│                                                     │ last_updated   │          │
│                                                     └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              测评体系 (Assessment System)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │  assessment_orders   │ 1───1 │  assessment_reports  │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ order_id PK          │──────<│ report_id PK         │                      │
│   │ user_id FK           │       │ child_id FK          │                      │
│   │ child_id FK          │       │ order_id FK          │                      │
│   │ amount               │       │ vocabulary_size      │                      │
│   │ status               │       │ phonics_level        │                      │
│   │ paid_at              │       │ listening_score      │                      │
│   └──────────────────────┘       │ speaking_score      │                      │
│                                  │ reading_score       │                      │
│                                  │ writing_score       │                      │
│                                  │ overall_cefr        │                      │
│                                  │ recommendation JSON  │                      │
│                                  │ report_image_url     │                      │
│                                  └──────────────────────┘                      │
│                                                                                  │
│   ┌──────────────────────┐                                                      │
│   │   question_bank      │                                                      │
│   ├──────────────────────┤                                                      │
│   │ question_id PK       │                                                      │
│   │ type (vocab/listen/  │                                                      │
│   │       speaking/      │                                                      │
│   │       reading/       │                                                      │
│   │       writing)       │                                                      │
│   │ difficulty           │                                                      │
│   │ content JSON         │                                                      │
│   │ options JSON         │                                                      │
│   │ answer               │                                                      │
│   │ cefr_level           │                                                      │
│   │ source               │                                                      │
│   │ tags JSON            │                                                      │
│   └──────────────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              课程体系 (Course System)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │       schools        │ 1───N │       courses        │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ school_id PK         │──────<│ course_id PK         │                      │
│   │ name                 │       │ school_id FK         │                      │
│   │ address              │       │ type                 │                      │
│   │ contact              │       │ name                 │                      │
│   │ description          │       │ description          │                      │
│   │ rating               │       │ cover_image          │                      │
│   │ latitude             │       │ level_required       │                      │
│   │ longitude            │       │ status               │                      │
│   │ created_at           │       │ created_at           │                      │
│   └──────────────────────┘       └──────────┬───────────┘                      │
│                                             │ 1───N                            │
│                                             ▼                                  │
│                                  ┌──────────────────────┐                      │
│                                  │   course_progress    │                      │
│                                  ├──────────────────────┤                      │
│                                  │ progress_id PK      │                      │
│                                  │ child_id FK          │                      │
│                                  │ course_id FK         │                      │
│                                  │ completed_pct        │                      │
│                                  │ last_watched_at      │                      │
│                                  └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              考试体系 (Exam System) ⭐核心                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │     exam_catalog     │ 1───N │    exam_sessions     │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ exam_id PK           │──────<│ session_id PK       │                      │
│   │ exam_type            │       │ exam_id FK           │                      │
│   │ exam_name            │       │ city                 │                      │
│   │ cefr_level           │       │ center_name          │                      │
│   │ description          │       │ center_address       │                      │
│   │ exam_structure JSON  │       │ exam_dates JSON      │                      │
│   │ target_age           │       │ reg_open_date        │                      │
│   │ recommended_vocab    │       │ reg_close_date       │                      │
│   │ status               │       │ ticket_download_date │                      │
│   └──────────────────────┘       │ result_date         │                      │
│                                  │ total_seats         │                      │
│                                  │ available_seats     │                      │
│                                  │ fee                 │                      │
│                                  │ status              │                      │
│                                  └──────────────────────┘                      │
│                                             │ 1───N                            │
│                                             ▼                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │   exam_registrations │       │    mock_exams        │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ registration_id PK   │       │ exam_id PK           │                      │
│   │ user_id FK           │       │ child_id FK          │                      │
│   │ child_id FK          │       │ exam_type            │                      │
│   │ session_id FK        │       │ exam_date           │                      │
│   │ student_info JSON    │       │ reading_score       │                      │
│   │ parent_info JSON     │       │ writing_score       │                      │
│   │ service_type         │       │ listening_score      │                      │
│   │ service_fee          │       │ speaking_score      │                      │
│   │ status               │       │ total_score         │                      │
│   │ submitted_at         │       │ predicted_grade      │                      │
│   │ result_score         │       │ pass_confidence_pct  │                      │
│   │ result_grade         │       │ is_pass_ready        │                      │
│   └──────────────────────┘       └──────────────────────┘                      │
│                                                                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │   exam_prep_plans    │       │ crash_course_orders  │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ plan_id PK           │       │ order_id PK         │                      │
│   │ child_id FK          │       │ child_id FK         │                      │
│   │ exam_type            │       │ exam_type           │                      │
│   │ target_date          │       │ package_type        │                      │
│   │ current_level        │       │ amount              │                      │
│   │ plan_items JSON      │       │ mock_exam_quota     │                      │
│   │ progress_pct         │       │ remaining_quota     │                      │
│   │ created_at           │       │ valid_until         │                      │
│   └──────────────────────┘       │ status              │                      │
│                                  └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            教师与班级 (Teacher System)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │      teachers        │ 1───N │       classes       │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ teacher_id PK        │──────<│ class_id PK         │                      │
│   │ name                 │       │ teacher_id FK       │                      │
│   │ phone                │       │ school_id FK       │                      │
│   │ wecom_userid         │       │ name                │                      │
│   │ avatar               │       │ course_type         │                      │
│   │ bio                  │       │ level_required       │                      │
│   │ specialties JSON     │       │ schedule JSON       │                      │
│   │ school_id FK         │       │ max_students       │                      │
│   │ status               │       │ current_students   │                      │
│   │ hire_date            │       │ status              │                      │
│   └──────────────────────┘       └──────────┬───────────┘                      │
│                                             │ 1───N                            │
│                                             ▼                                  │
│                                  ┌──────────────────────┐                      │
│                                  │   class_students     │                      │
│                                  ├──────────────────────┤                      │
│                                  │ class_id FK          │                      │
│                                  │ child_id FK          │                      │
│                                  │ enrolled_at          │                      │
│                                  │ status               │                      │
│                                  └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              学校后台 (Admin System)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────┐       ┌──────────────────────┐                      │
│   │       roles          │ 1───N │      admins         │                      │
│   ├──────────────────────┤       ├──────────────────────┤                      │
│   │ role_id PK           │──────<│ admin_id PK         │                      │
│   │ name                 │       │ username            │                      │
│   │ permissions JSON     │       │ password_hash       │                      │
│   │ school_id FK         │       │ role_id FK          │                      │
│   └──────────────────────┘       │ school_id FK        │                      │
│                                  │ real_name           │                      │
│   ┌──────────────────────┐       │ wecom_userid        │                      │
│   │      coupons         │       │ status              │                      │
│   ├──────────────────────┤       └──────────────────────┘                      │
│   │ coupon_id PK         │                                                       │
│   │ code                 │       ┌──────────────────────┐                      │
│   │ type                 │       │     audit_logs      │                      │
│   │ value                │       ├──────────────────────┤                      │
│   │ min_amount           │       │ log_id PK           │                      │
│   │ valid_from           │       │ admin_id FK         │                      │
│   │ valid_to             │       │ action              │                      │
│   │ usage_limit          │       │ target_type         │                      │
│   │ used_count           │       │ target_id          │                      │
│   │ applicable_services   │       │ details JSON        │                      │
│   └──────────────────────┘       │ ip                 │                      │
│                                  │ created_at          │                      │
│   ┌──────────────────────┐       └──────────────────────┘                      │
│   │    qr_channels      │                                                       │
│   ├──────────────────────┤       ┌──────────────────────┐                      │
│   │ channel_id PK       │       │ school_settlements  │                      │
│   │ qr_code_url         │       ├──────────────────────┤                      │
│   │ channel_name        │       │ settlement_id PK    │                      │
│   │ channel_type        │       │ school_id FK        │                      │
│   │ school_id FK         │       │ period              │                      │
│   │ teacher_id FK       │       │ total_revenue       │                      │
│   │ scan_count           │       │ platform_cut        │                      │
│   │ conversion_count     │       │ school_cut          │                      │
│   │ created_at           │       │ status              │                      │
│   └──────────────────────┘       │ paid_at            │                      │
│                                  └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              课后评估 (Assessment System)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────┐   ┌──────────────────────────────┐           │
│   │   post_class_assessments    │   │   learning_paths           │           │
│   ├──────────────────────────────┤   ├──────────────────────────────┤           │
│   │ assessment_id PK            │   │ path_id PK                 │           │
│   │ child_id FK                 │   │ child_id FK                │           │
│   │ course_id FK                │   │ current_level              │           │
│   │ class_date                  │   │ target_level               │           │
│   │ ai_conversation_score       │   │ milestones JSON           │           │
│   │ pronunciation_score         │   │ recommended_courses JSON   │           │
│   │ fluency_score               │   │ generated_at              │           │
│   │ engagement_score            │   │ last_updated              │           │
│   │ focus_score                 │   └──────────────────────────────┘           │
│   │ emotion_summary             │                                              │
│   │ report_sent_to_parent       │   ┌──────────────────────────────┐           │
│   └──────────────────────────────┘   │ cefr_periodic_assessments  │           │
│                                      ├──────────────────────────────┤           │
│   ┌──────────────────────────────┐   │ assess_id PK               │           │
│   │   parent_notifications      │   │ child_id FK                │           │
│   ├──────────────────────────────┤   │ assess_date                │           │
│   │ notification_id PK          │   │ cefr_level                │           │
│   │ user_id FK                  │   │ confidence_pct            │           │
│   │ type                        │   │ reading_score             │           │
│   │ content_summary             │   │ listening_score           │           │
│   │ send_status                 │   │ speaking_score            │           │
│   │ sent_at                     │   │ writing_score             │           │
│   │ delivery_channel            │   │ ready_for_ket            │           │
│   └──────────────────────────────┘   │ ready_for_pet             │           │
│                                      └──────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 二、核心表结构说明

### 2.1 用户体系

#### users 用户表
```sql
CREATE TABLE users (
  user_id VARCHAR(32) PRIMARY KEY,           -- 用户ID
  openid VARCHAR(64) UNIQUE,                 -- 微信OpenID
  unionid VARCHAR(64) UNIQUE,               -- 微信UnionID
  nickname VARCHAR(64),                      -- 昵称
  avatar VARCHAR(255),                       -- 头像URL
  phone VARCHAR(20) UNIQUE,                  -- 手机号
  source_channel VARCHAR(32),                -- 来源渠道
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_phone (phone),
  INDEX idx_openid (openid),
  INDEX idx_source (source_channel)
);
```

#### children 学员表
```sql
CREATE TABLE children (
  child_id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,                -- 学员姓名
  gender ENUM('male', 'female', 'other'),
  birthday DATE,                             -- 出生日期
  age TINYINT,                              -- 计算字段
  grade VARCHAR(32),                        -- 年级
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_user (user_id)
);
```

#### student_profiles 学员画像表
```sql
CREATE TABLE student_profiles (
  profile_id VARCHAR(32) PRIMARY KEY,
  child_id VARCHAR(32) NOT NULL,
  vocabulary_size INT DEFAULT 0,             -- 词汇量
  phonics_level VARCHAR(16),                -- 拼读等级
  cefr_level VARCHAR(8),                    -- CEFR等级
  listening_trend JSON,                     -- 听力趋势
  speaking_trend JSON,                      -- 口语趋势
  reading_trend JSON,                       -- 阅读趋势
  writing_trend JSON,                       -- 写作趋势
  weak_points JSON,                         -- 薄弱项
  strong_points JSON,                       -- 强项
  learning_habits JSON,                     -- 学习习惯
  last_updated TIMESTAMP,
  
  FOREIGN KEY (child_id) REFERENCES children(child_id),
  UNIQUE INDEX idx_child (child_id)
);
```

### 2.2 考试体系（⭐核心）

#### exam_catalog 考试目录表
```sql
CREATE TABLE exam_catalog (
  exam_id VARCHAR(32) PRIMARY KEY,
  exam_type VARCHAR(32) NOT NULL,           -- yle_starters/yle_movers/yle_flyers/ket/pet/fce
  exam_name VARCHAR(64) NOT NULL,           -- 考试名称
  cefr_level VARCHAR(8),                    -- 对应CEFR等级
  description TEXT,
  exam_structure JSON,                       -- 考试结构 {
                                              --   "reading": {"duration": 60, "questions": 50},
                                              --   "writing": {"duration": 45, "questions": 6},
                                              --   "listening": {"duration": 30, "questions": 25},
                                              --   "speaking": {"duration": 10, "questions": 4}
                                              -- }
  target_age VARCHAR(32),                   -- 目标年龄
  recommended_vocab INT,                    -- 推荐词汇量
  status ENUM('active', 'inactive') DEFAULT 'active',
  
  INDEX idx_type (exam_type),
  INDEX idx_cefr (cefr_level)
);
```

#### exam_sessions 考试场次表
```sql
CREATE TABLE exam_sessions (
  session_id VARCHAR(32) PRIMARY KEY,
  exam_id VARCHAR(32) NOT NULL,
  city VARCHAR(32) NOT NULL,
  center_name VARCHAR(128),
  center_address VARCHAR(255),
  exam_dates JSON,                         -- 考试日期安排
  registration_open_date DATE,
  registration_close_date DATE,
  ticket_download_date DATE,
  result_date DATE,
  total_seats INT,
  available_seats INT,
  fee DECIMAL(10,2),
  status ENUM('upcoming', 'registration_open', 'registration_closed', 
              'exam_conducted', 'results_released') DEFAULT 'upcoming',
  
  FOREIGN KEY (exam_id) REFERENCES exam_catalog(exam_id),
  INDEX idx_exam (exam_id),
  INDEX idx_city (city),
  INDEX idx_reg_date (registration_open_date, registration_close_date)
);
```

#### exam_registrations 考试报名表
```sql
CREATE TABLE exam_registrations (
  registration_id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  child_id VARCHAR(32) NOT NULL,
  session_id VARCHAR(32) NOT NULL,
  student_info JSON,                        -- 学生信息 {
                                              --   "name": "张三",
                                              --   "gender": "male",
                                              --   "birthday": "2015-01-01",
                                              --   "id_card": "11010120150101XXXX",
                                              --   "photo_url": "https://..."
                                              -- }
  parent_info JSON,                         -- 家长信息 {
                                              --   "name": "李四",
                                              --   "phone": "13800138000",
                                              --   "relationship": "父亲"
                                              -- }
  service_type ENUM('basic', 'vip'),       -- 服务类型
  service_fee DECIMAL(10,2),
  status ENUM('pending', 'submitted', 'under_review', 
              'approved', 'rejected', 'ticket_ready',
              'exam_completed', 'results_released') DEFAULT 'pending',
  submitted_at TIMESTAMP,
  result_score DECIMAL(5,2),
  result_grade VARCHAR(8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (child_id) REFERENCES children(child_id),
  FOREIGN KEY (session_id) REFERENCES exam_sessions(session_id),
  
  INDEX idx_user (user_id),
  INDEX idx_child (child_id),
  INDEX idx_status (status)
);
```

#### mock_exams 模拟考试表
```sql
CREATE TABLE mock_exams (
  exam_id VARCHAR(32) PRIMARY KEY,
  child_id VARCHAR(32) NOT NULL,
  exam_type VARCHAR(32) NOT NULL,
  exam_date TIMESTAMP NOT NULL,
  reading_score DECIMAL(5,2),
  reading_max DECIMAL(5,2) DEFAULT 50,
  writing_score DECIMAL(5,2),
  writing_max DECIMAL(5,2) DEFAULT 40,
  listening_score DECIMAL(5,2),
  listening_max DECIMAL(5,2) DEFAULT 25,
  speaking_score DECIMAL(5,2),
  speaking_max DECIMAL(5,2) DEFAULT 30,
  total_score DECIMAL(5,2),
  total_max DECIMAL(5,2),
  predicted_grade VARCHAR(16),              -- A1/A2/B1/B2/Pass/Merit/Distinction
  pass_confidence_pct INT,                 -- 通过信心指数
  time_spent JSON,                          -- 各部分用时
  detailed_analysis JSON,                   -- 详细分析
  is_pass_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (child_id) REFERENCES children(child_id),
  INDEX idx_child (child_id),
  INDEX idx_date (exam_date),
  INDEX idx_pass_ready (is_pass_ready)
);
```

### 2.3 课后评估体系

#### post_class_assessments 课后评估表
```sql
CREATE TABLE post_class_assessments (
  assessment_id VARCHAR(32) PRIMARY KEY,
  child_id VARCHAR(32) NOT NULL,
  course_id VARCHAR(32) NOT NULL,
  class_date DATE NOT NULL,
  ai_conversation_score DECIMAL(5,2),
  vocabulary_accuracy DECIMAL(5,2),
  grammar_accuracy DECIMAL(5,2),
  pronunciation_score DECIMAL(5,2),
  fluency_score DECIMAL(5,2),
  turn_count JSON,                          -- 对话轮次统计
  error_records JSON,                       -- 错误记录
  engagement_score DECIMAL(5,2),
  focus_score DECIMAL(5,2),
  emotion_summary VARCHAR(128),
  report_generated BOOLEAN DEFAULT FALSE,
  report_sent_to_parent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (child_id) REFERENCES children(child_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id),
  
  INDEX idx_child (child_id),
  INDEX idx_date (class_date)
);
```

## 三、外键关系图

```
users ─────────────────────────┐
    │ (1:N)                    │
    ▼                          │
children ──────────────────────┼──────> student_profiles (1:1)
    │                          │
    ├──────> course_progress (1:N)
    │
    ├──────> exam_registrations (1:N)
    │
    ├──────> mock_exams (1:N)
    │
    ├──────> exam_prep_plans (1:N)
    │
    ├──────> post_class_assessments (1:N)
    │
    ├──────> class_students (N:1) <────── classes (1:N) <────── teachers (1:N)
    │                                                     │
    └─────────────────────────────────────────────────────┴──────> schools (1:N)

schools ─────────────────────────┐
    │ (1:N)                      │
    ├──────> courses             │
    ├──────> teachers            │
    ├──────> admins              │
    ├──────> qr_channels         │
    └──────> school_settlements

exam_catalog ───────────────────┐
    │ (1:N)                      │
    └──────> exam_sessions ──────> exam_registrations (1:N)

children ──────────────────────────────> learning_paths (1:1)
    │
    └──────> cefr_periodic_assessments (1:N)
```

## 四、索引优化建议

### 高频查询优化

| 查询场景 | 索引设计 |
|----------|----------|
| 按用户查询学员 | idx_user (user_id) |
| 按学员查询进度 | idx_child (child_id) |
| 按考试类型查询 | idx_type (exam_type) |
| 按CEFR等级查询 | idx_cefr (cefr_level) |
| 按日期范围查询 | idx_date (exam_date, created_at) |
| 按状态查询 | idx_status (status) |
| 组合查询 | idx_child_type (child_id, exam_type) |

### 复合索引设计

```sql
-- 学员考试历史查询
CREATE INDEX idx_child_exam ON mock_exams(child_id, exam_type, exam_date DESC);

-- 报名状态查询
CREATE INDEX idx_reg_status ON exam_registrations(user_id, status, created_at DESC);

-- 成绩趋势查询
CREATE INDEX idx_score_trend ON mock_exams(child_id, exam_type, created_at DESC);
```

## 五、分区表设计

### 模拟考试表（按月分区）
```sql
CREATE TABLE mock_exams (
  exam_id VARCHAR(32),
  child_id VARCHAR(32),
  ...
  created_at TIMESTAMP,
  PRIMARY KEY (exam_id, created_at)
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  PARTITION p2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
  PARTITION p2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
  PARTITION p2024_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```
