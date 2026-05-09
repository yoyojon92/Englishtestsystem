-- =====================================================
-- 英语能力测评与课程服务系统 - 数据库初始化脚本
-- PostgreSQL 15+
-- =====================================================

-- 1. 用户体系
-- =====================================================

-- 用户表（家长账户）
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openid VARCHAR(128) UNIQUE,
    unionid VARCHAR(128) UNIQUE,
    nickname VARCHAR(64),
    avatar VARCHAR(512),
    phone VARCHAR(20) UNIQUE,
    source_channel VARCHAR(32),
    status VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_openid ON users(openid);

-- 学员表（孩子）
CREATE TABLE IF NOT EXISTS children (
    child_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    gender VARCHAR(8) CHECK (gender IN ('male', 'female', 'other')),
    birthday DATE,
    age INTEGER,
    grade VARCHAR(32),
    avatar VARCHAR(512),
    current_level VARCHAR(16) DEFAULT 'Pre-A1' CHECK (current_level IN ('Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    status VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_children_user ON children(user_id);

-- 学员能力画像表
CREATE TABLE IF NOT EXISTS student_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
    vocabulary_size INTEGER DEFAULT 0,
    phonics_level VARCHAR(16) DEFAULT 'beginner',
    listening_score DECIMAL(5,2) DEFAULT 0,
    speaking_score DECIMAL(5,2) DEFAULT 0,
    reading_score DECIMAL(5,2) DEFAULT 0,
    writing_score DECIMAL(5,2) DEFAULT 0,
    overall_cefr VARCHAR(16) DEFAULT 'Pre-A1',
    weak_points JSONB DEFAULT '[]',
    strong_points JSONB DEFAULT '[]',
    learning_habits JSONB DEFAULT '{}',
    radar_data JSONB DEFAULT '{"listening":0,"speaking":0,"reading":0,"writing":0,"vocabulary":0,"grammar":0}',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_child ON student_profiles(child_id);

-- 2. 测评相关
-- =====================================================

-- 测评订单表
CREATE TABLE IF NOT EXISTS assessment_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    child_id UUID NOT NULL REFERENCES children(child_id),
    amount DECIMAL(10,2) NOT NULL DEFAULT 59.90,
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'refunded', 'cancelled')),
    payment_method VARCHAR(32),
    paid_at TIMESTAMP,
    report_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_orders_user ON assessment_orders(user_id);
CREATE INDEX idx_assessment_orders_child ON assessment_orders(child_id);

-- 测评报告表
CREATE TABLE IF NOT EXISTS assessment_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id),
    order_id UUID REFERENCES assessment_orders(order_id),
    vocabulary_size INTEGER,
    phonics_level VARCHAR(16),
    listening_score DECIMAL(5,2),
    speaking_score DECIMAL(5,2),
    reading_score DECIMAL(5,2),
    writing_score DECIMAL(5,2),
    overall_cefr VARCHAR(16),
    recommendation JSONB DEFAULT '{}',
    report_image_url VARCHAR(512),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_child ON assessment_reports(child_id);

-- 3. 课程相关
-- =====================================================

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(32) NOT NULL CHECK (type IN ('online', 'offline', 'exam_prep', 'free')),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    cover_image VARCHAR(512),
    level_required VARCHAR(16),
    school_id UUID,
    teacher_id UUID,
    price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2),
    duration VARCHAR(32),
    lessons_count INTEGER DEFAULT 0,
    status VARCHAR(16) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'offline', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_type ON courses(type);
CREATE INDEX idx_courses_level ON courses(level_required);

-- 课程报名表
CREATE TABLE IF NOT EXISTS course_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    child_id UUID NOT NULL REFERENCES children(child_id),
    course_id UUID NOT NULL REFERENCES courses(course_id),
    status VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_child ON course_enrollments(child_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);

-- 课程进度表
CREATE TABLE IF NOT EXISTS course_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id),
    course_id UUID NOT NULL REFERENCES courses(course_id),
    lesson_id UUID,
    completed_pct DECIMAL(5,2) DEFAULT 0,
    last_watched_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(child_id, course_id, lesson_id)
);

CREATE INDEX idx_progress_child ON course_progress(child_id);
CREATE INDEX idx_progress_course ON course_progress(course_id);

-- 4. 考试相关
-- =====================================================

-- 考试目录表
CREATE TABLE IF NOT EXISTS exam_catalogs (
    exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type VARCHAR(32) NOT NULL,
    exam_name VARCHAR(128) NOT NULL,
    cefr_level VARCHAR(16) NOT NULL,
    description TEXT,
    exam_structure JSONB DEFAULT '{}',
    target_age VARCHAR(32),
    recommended_vocab VARCHAR(64),
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 考试场次表
CREATE TABLE IF NOT EXISTS exam_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exam_catalogs(exam_id),
    city VARCHAR(64),
    center_name VARCHAR(128),
    center_address VARCHAR(256),
    exam_date DATE,
    registration_open_date DATE,
    registration_close_date DATE,
    ticket_download_date DATE,
    result_date DATE,
    total_seats INTEGER DEFAULT 0,
    available_seats INTEGER DEFAULT 0,
    fee DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(16) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_exam ON exam_sessions(exam_id);
CREATE INDEX idx_sessions_city ON exam_sessions(city);
CREATE INDEX idx_sessions_date ON exam_sessions(exam_date);

-- 考试报名表
CREATE TABLE IF NOT EXISTS exam_registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    child_id UUID NOT NULL REFERENCES children(child_id),
    session_id UUID NOT NULL REFERENCES exam_sessions(session_id),
    student_info JSONB NOT NULL,
    parent_info JSONB NOT NULL,
    service_type VARCHAR(16) DEFAULT 'basic' CHECK (service_type IN ('basic', 'vip', 'group')),
    service_fee DECIMAL(10,2) DEFAULT 99,
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewing', 'confirmed', 'failed', 'completed')),
    submitted_at TIMESTAMP,
    result_score DECIMAL(5,2),
    result_grade VARCHAR(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registrations_user ON exam_registrations(user_id);
CREATE INDEX idx_registrations_child ON exam_registrations(child_id);
CREATE INDEX idx_registrations_session ON exam_registrations(session_id);

-- 模拟考试记录表
CREATE TABLE IF NOT EXISTS mock_exams (
    mock_exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id),
    exam_type VARCHAR(16) NOT NULL,
    exam_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reading_score DECIMAL(5,2) DEFAULT 0,
    reading_max DECIMAL(5,2) DEFAULT 100,
    writing_score DECIMAL(5,2) DEFAULT 0,
    writing_max DECIMAL(5,2) DEFAULT 100,
    listening_score DECIMAL(5,2) DEFAULT 0,
    listening_max DECIMAL(5,2) DEFAULT 100,
    speaking_score DECIMAL(5,2) DEFAULT 0,
    speaking_max DECIMAL(5,2) DEFAULT 100,
    total_score DECIMAL(5,2) DEFAULT 0,
    total_max DECIMAL(5,2) DEFAULT 400,
    predicted_grade VARCHAR(16),
    pass_confidence_pct DECIMAL(5,2) DEFAULT 0,
    is_pass_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mock_child ON mock_exams(child_id);

-- 备考计划表
CREATE TABLE IF NOT EXISTS exam_prep_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id),
    exam_type VARCHAR(16) NOT NULL,
    target_date DATE,
    current_level VARCHAR(16),
    plan_items JSONB DEFAULT '[]',
    progress_pct DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 冲刺包订单表
CREATE TABLE IF NOT EXISTS crash_course_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    child_id UUID NOT NULL REFERENCES children(child_id),
    exam_type VARCHAR(16) NOT NULL,
    package_type VARCHAR(16) DEFAULT 'ket' CHECK (package_type IN ('ket', 'pet', 'fce')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'active', 'expired', 'refunded')),
    mock_exam_quota INTEGER DEFAULT 8,
    remaining_quota INTEGER DEFAULT 8,
    valid_until DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crash_orders_user ON crash_course_orders(user_id);
CREATE INDEX idx_crash_orders_child ON crash_course_orders(child_id);

-- 5. 通知相关
-- =====================================================

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    type VARCHAR(32) NOT NULL,
    title VARCHAR(128) NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- 通知模板表
CREATE TABLE IF NOT EXISTS notification_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    title_template VARCHAR(256),
    content_template TEXT,
    channels JSONB DEFAULT '["app"]',
    variables JSONB DEFAULT '[]',
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 教师与班级
-- =====================================================

-- 教师表
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    phone VARCHAR(20),
    wecom_userid VARCHAR(64) UNIQUE,
    avatar VARCHAR(512),
    bio TEXT,
    specialties JSONB DEFAULT '[]',
    school_id UUID,
    status VARCHAR(16) DEFAULT 'active',
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_wecom ON teachers(wecom_userid);

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
    class_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    course_type VARCHAR(32),
    level_required VARCHAR(16),
    teacher_id UUID REFERENCES teachers(teacher_id),
    school_id UUID,
    schedule JSONB DEFAULT '{}',
    max_students INTEGER DEFAULT 20,
    current_students INTEGER DEFAULT 0,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 班级学员关联表
CREATE TABLE IF NOT EXISTS class_students (
    class_id UUID NOT NULL REFERENCES classes(class_id),
    child_id UUID NOT NULL REFERENCES children(child_id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(16) DEFAULT 'active',
    PRIMARY KEY (class_id, child_id)
);

-- 课后报告表
CREATE TABLE IF NOT EXISTS post_class_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(teacher_id),
    child_id UUID NOT NULL REFERENCES children(child_id),
    class_id UUID REFERENCES classes(class_id),
    class_date DATE,
    content JSONB DEFAULT '{}',
    ai_scores JSONB DEFAULT '{}',
    teacher_comment TEXT,
    status VARCHAR(16) DEFAULT 'pending_review',
    pushed_to_parent BOOLEAN DEFAULT FALSE,
    pushed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_class_child ON post_class_reports(child_id);
CREATE INDEX idx_post_class_teacher ON post_class_reports(teacher_id);

-- 7. 营销相关
-- =====================================================

-- 优惠券表
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) UNIQUE NOT NULL,
    type VARCHAR(16) NOT NULL CHECK (type IN ('discount', 'fixed')),
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    usage_limit INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    applicable_services JSONB DEFAULT '[]',
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 渠道二维码表
CREATE TABLE IF NOT EXISTS qr_channels (
    channel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_url VARCHAR(512),
    channel_name VARCHAR(64) NOT NULL,
    channel_type VARCHAR(32),
    school_id UUID,
    teacher_id UUID,
    scan_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 支付相关
-- =====================================================

-- 支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(user_id),
    order_type VARCHAR(32) NOT NULL CHECK (order_type IN ('assessment', 'course', 'exam_registration', 'crash_course', 'vip')),
    related_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled', 'expired')),
    payment_method VARCHAR(32),
    payment_time TIMESTAMP,
    wechat_pay_id VARCHAR(128),
    wechat_pay_url VARCHAR(512),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_no ON payment_orders(order_no);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_type ON payment_orders(order_type);

-- 9. 徽章成就
-- =====================================================

-- 用户徽章表
CREATE TABLE IF NOT EXISTS user_badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id),
    badge_code VARCHAR(64) NOT NULL,
    badge_name VARCHAR(64),
    icon VARCHAR(32),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, badge_code)
);

CREATE INDEX idx_badges_child ON user_badges(child_id);

-- 10. 免费课程
-- =====================================================

-- 课程分类表
CREATE TABLE IF NOT EXISTS course_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(32),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课时表
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(course_id),
    title VARCHAR(128) NOT NULL,
    description TEXT,
    video_url VARCHAR(512),
    duration INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_course ON lessons(course_id);

-- 小测验表
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(lesson_id),
    questions JSONB DEFAULT '[]',
    passing_score INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 课后评估
-- =====================================================

-- 定期CEFR评估表
CREATE TABLE IF NOT EXISTS cefr_assessments (
    assess_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(child_id),
    assess_date DATE NOT NULL,
    cefr_level VARCHAR(16) NOT NULL,
    confidence_pct DECIMAL(5,2) DEFAULT 0,
    reading_score DECIMAL(5,2) DEFAULT 0,
    listening_score DECIMAL(5,2) DEFAULT 0,
    speaking_score DECIMAL(5,2) DEFAULT 0,
    writing_score DECIMAL(5,2) DEFAULT 0,
    ready_for_exam VARCHAR(32),
    next_assess_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cefr_child ON cefr_assessments(child_id);
CREATE INDEX idx_cefr_date ON cefr_assessments(assess_date);

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入考试目录数据
INSERT INTO exam_catalogs (exam_id, exam_type, exam_name, cefr_level, description, exam_structure, target_age, recommended_vocab) VALUES
('11111111-1111-1111-1111-111111111111', 'YLE', 'YLE Pre-A1 Starters', 'Pre-A1', '剑桥少儿英语入门级，适合6-8岁儿童', '{"paper": "Starters", "parts": 3}', '6-8岁', '约500词汇'),
('22222222-2222-2222-2222-222222222222', 'YLE', 'YLE A1 Movers', 'A1', '剑桥少儿英语进阶级，适合8-10岁儿童', '{"paper": "Movers", "parts": 3}', '8-10岁', '约900词汇'),
('33333333-3333-3333-3333-333333333333', 'YLE', 'YLE A2 Flyers', 'A2', '剑桥少儿英语高级，适合9-12岁儿童', '{"paper": "Flyers", "parts": 3}', '9-12岁', '约1400词汇'),
('44444444-4444-4444-4444-444444444444', 'KET', 'A2 Key for Schools (KET)', 'A2', '剑桥英语初级认证，适合10-14岁', '{"paper": "KET", "parts": 4, "duration": {"RW": "60min", "L": "30min", "S": "8-10min"}}', '10-14岁', '约1500词汇'),
('55555555-5555-5555-5555-555555555555', 'PET', 'B1 Preliminary for Schools (PET)', 'B1', '剑桥英语中级认证，适合12-15岁', '{"paper": "PET", "parts": 4, "duration": {"R": "45min", "W": "45min", "L": "30min", "S": "10-12min"}}', '12-15岁', '约3500词汇'),
('66666666-6666-6666-6666-666666666666', 'FCE', 'B2 First for Schools (FCE)', 'B2', '剑桥英语中高级认证，适合14-17岁', '{"paper": "FCE", "parts": 4}', '14-17岁', '约6000词汇');

-- 插入课程分类数据
INSERT INTO course_categories (category_id, name, code, description, icon, sort_order) VALUES
('a1111111-1111-1111-1111-111111111111', 'Pre-A1 入门', 'pre-a1', '适合6-8岁英语零基础学员', '🌟', 1),
('a2222222-2222-2222-2222-222222222222', 'A1 基础', 'a1', '适合8-10岁有基础学员', '📚', 2),
('a3333333-3333-3333-3333-333333333333', 'A2 进阶', 'a2', '适合9-12岁进阶学员', '🎯', 3),
('a4444444-4444-4444-4444-444444444444', '自然拼读', 'phonics', '适合5-12岁学习phonics', '🔤', 4),
('a5555555-5555-5555-5555-555555555555', '阅读技巧', 'reading', '适合7-12岁阅读提升', '📖', 5);

-- 插入通知模板数据
INSERT INTO notification_templates (code, name, title_template, content_template, channels, variables) VALUES
('ASSESSMENT_COMPLETE', '测评完成通知', '您的测评报告已生成', '恭喜完成英语能力测评，点击查看详细报告。', '["in_app", "wechat"]', '["report_url"]'),
('CLASS_REMINDER', '上课提醒', '明天有课别忘了！', '明天 {class_name} 课程 {start_time} 开始，请提前做好准备。', '["in_app", "wechat"]', '["class_name", "start_time"]'),
('POST_CLASS_REPORT', '课后报告', '课后报告已发布', '孩子本次课程表现良好，已生成课后报告，请查看。', '["in_app", "wechat", "sms"]', '["class_name", "report_url"]'),
('EXAM_REMINDER', '考试提醒', '距离考试还有 {days} 天', '您的孩子报名的 {exam_name} 将于 {exam_date} 进行，请做好准备。', '["in_app", "wechat"]', '["days", "exam_name", "exam_date"]'),
('EXAM_RESULT', '考试成绩', '考试成绩已公布', '恭喜！您的孩子在 {exam_name} 中取得了 {grade} 的成绩。', '["in_app", "wechat"]', '["exam_name", "grade"]'),
('EXAM_READY', '考试就绪', '您的孩子已达到考试水平', '根据近期学习数据，孩子已达到 {exam_name} 考试水平，建议报名参试。', '["in_app", "wechat"]', '["exam_name"]'),
('TEACHER_MESSAGE', '教师消息', '老师有话对您说', '{teacher_name}：{message}', '["in_app", "wechat"]', '["teacher_name", "message"]');

-- =====================================================
-- 创建更新时间触发器函数
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新 updated_at 的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_orders_updated_at BEFORE UPDATE ON assessment_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON exam_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prep_plans_updated_at BEFORE UPDATE ON exam_prep_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_class_updated_at BEFORE UPDATE ON post_class_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 完成
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
END $$;
