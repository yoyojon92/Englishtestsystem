-- ===========================================
-- KET/PET 真题题库增强表结构
-- ===========================================

BEGIN;

-- 1. 知识点字典表
CREATE TABLE IF NOT EXISTS knowledge_points (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(100) NOT NULL UNIQUE,           -- 知识点标签，如"价格与优惠表达"
    category VARCHAR(50),                         -- 分类，如"词汇"、"语法"、"场景"
    cefr_level VARCHAR(10),                      -- 对应CEFR级别
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_points_tag ON knowledge_points(tag);
CREATE INDEX idx_knowledge_points_cefr ON knowledge_points(cefr_level);

-- 2. 题目表（增强版）
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    exam_type VARCHAR(20) NOT NULL,              -- KET/PET/FCE/YLE
    part INTEGER NOT NULL,                       -- Part 1/2/3/4/5/6/7
    question_type VARCHAR(50) NOT NULL,          -- match_notice/choice/fill_blank等
    instruction TEXT,                            -- 题目说明
    content TEXT NOT NULL,                       -- 题目内容
    options JSONB,                              -- 选项（JSON数组格式）
    answer VARCHAR(500) NOT NULL,               -- 答案
    explanation TEXT,                            -- 解析
    difficulty INTEGER DEFAULT 2,                 -- 1=easy, 2=medium, 3=hard
    cefr_level VARCHAR(10) DEFAULT 'A2',         -- A1/A2/B1/B2
    source VARCHAR(100),                         -- 来源，如"KET Official Sample"
    metadata JSONB,                             -- 扩展信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_exam_type ON questions(exam_type);
CREATE INDEX idx_questions_part ON questions(part);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_cefr ON questions(cefr_level);

-- 3. 题目-知识点关联表
CREATE TABLE IF NOT EXISTS question_knowledge_points (
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    knowledge_point_id INTEGER REFERENCES knowledge_points(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, knowledge_point_id)
);

CREATE INDEX idx_qkp_question ON question_knowledge_points(question_id);
CREATE INDEX idx_qkp_knowledge ON question_knowledge_points(knowledge_point_id);

-- 4. 题目附件表（通知/图片等）
CREATE TABLE IF NOT EXISTS question_attachments (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    attachment_type VARCHAR(20) NOT NULL,       -- notice/image/text
    identifier VARCHAR(10),                      -- 如 A/B/C 或图片编号
    content TEXT,                                -- 文本内容或图片URL
    order_index INTEGER DEFAULT 0,               -- 显示顺序
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qa_question ON question_attachments(question_id);

-- 5. 备考参考表
CREATE TABLE IF NOT EXISTS prepare_references (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    knowledge_point_id INTEGER REFERENCES knowledge_points(id) ON DELETE CASCADE,
    prepare_level VARCHAR(50),                  -- Prepare Level 2 (A2)
    unit VARCHAR(100),                          -- Unit 4 - Shopping
    section VARCHAR(100),                        -- 4.2 Prices and Discounts
    page INTEGER,                                -- 页码
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pr_question ON prepare_references(question_id);

-- 6. 导入批次记录表
CREATE TABLE IF NOT EXISTS question_import_batches (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    exam_type VARCHAR(20),
    total_questions INTEGER,
    imported_questions INTEGER,
    status VARCHAR(20) DEFAULT 'pending',       -- pending/importing/completed/failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

COMMIT;

-- ===========================================
-- 测试数据：知识点
-- ===========================================

BEGIN;

-- 插入知识点
INSERT INTO knowledge_points (tag, category, cefr_level) VALUES
    ('价格与优惠表达', '词汇', 'A2'),
    ('安全警告标识', '词汇', 'A2'),
    ('付款方式表达', '词汇', 'A2'),
    ('促销广告用语', '词汇', 'A2'),
    ('时间表达', '语法', 'A2'),
    ('地点与位置', '语法', 'A2'),
    ('日常活动', '场景', 'A2'),
    ('购物场景', '场景', 'A2'),
    ('交通出行', '场景', 'A2'),
    ('餐饮美食', '场景', 'A2')
ON CONFLICT (tag) DO NOTHING;

COMMIT;
