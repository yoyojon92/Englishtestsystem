-- KET真题导入
-- 自动生成，请勿手动修改

BEGIN;

-- 题号 1: Q001
INSERT INTO question_bank (
    type,
    difficulty,
    content,
    options,
    answer,
    explanation,
    cefr_level,
    source,
    tags,
    metadata
) VALUES (
    'match_notice',
    2,
    '${QTEXT}',
    NULL,
    '',
    '${EXPLANATION}',
    'A2',
    'KET Official Sample',
    '["KET", "Reading Part 1", ""]'::jsonb,
    '{
        "exam": "KET",
        "part": 1,
        "question_id": "Q001",
        "prepare": {
            "level": "N/A",
            "unit": "N/A",
            "section": "N/A",
            "page": 38
        }
    }'::jsonb
);

-- 题号 2: Q002
INSERT INTO question_bank (
    type,
    difficulty,
    content,
    options,
    answer,
    explanation,
    cefr_level,
    source,
    tags,
    metadata
) VALUES (
    'match_notice',
    2,
    '${QTEXT}',
    NULL,
    '',
    '${EXPLANATION}',
    'A2',
    'KET Official Sample',
    '["KET", "Reading Part 1", ""]'::jsonb,
    '{
        "exam": "KET",
        "part": 1,
        "question_id": "Q002",
        "prepare": {
            "level": "N/A",
            "unit": "N/A",
            "section": "N/A",
            "page": 62
        }
    }'::jsonb
);

-- 题号 3: Q003
INSERT INTO question_bank (
    type,
    difficulty,
    content,
    options,
    answer,
    explanation,
    cefr_level,
    source,
    tags,
    metadata
) VALUES (
    'match_notice',
    2,
    '${QTEXT}',
    NULL,
    '',
    '${EXPLANATION}',
    'A2',
    'KET Official Sample',
    '["KET", "Reading Part 1", ""]'::jsonb,
    '{
        "exam": "KET",
        "part": 1,
        "question_id": "Q003",
        "prepare": {
            "level": "N/A",
            "unit": "N/A",
            "section": "N/A",
            "page": 40
        }
    }'::jsonb
);

-- 题号 4: Q004
INSERT INTO question_bank (
    type,
    difficulty,
    content,
    options,
    answer,
    explanation,
    cefr_level,
    source,
    tags,
    metadata
) VALUES (
    'match_notice',
    2,
    '${QTEXT}',
    NULL,
    '',
    '${EXPLANATION}',
    'A2',
    'KET Official Sample',
    '["KET", "Reading Part 1", ""]'::jsonb,
    '{
        "exam": "KET",
        "part": 1,
        "question_id": "Q004",
        "prepare": {
            "level": "N/A",
            "unit": "N/A",
            "section": "N/A",
            "page": 36
        }
    }'::jsonb
);

-- 题号 5: Q005
INSERT INTO question_bank (
    type,
    difficulty,
    content,
    options,
    answer,
    explanation,
    cefr_level,
    source,
    tags,
    metadata
) VALUES (
    'match_notice',
    2,
    '${QTEXT}',
    NULL,
    '',
    '${EXPLANATION}',
    'A2',
    'KET Official Sample',
    '["KET", "Reading Part 1", ""]'::jsonb,
    '{
        "exam": "KET",
        "part": 1,
        "question_id": "Q005",
        "prepare": {
            "level": "N/A",
            "unit": "N/A",
            "section": "N/A",
            "page": 40
        }
    }'::jsonb
);


COMMIT;

-- 显示导入结果
SELECT 'KET真题导入完成!' as message;
SELECT type, cefr_level, count(*) as count FROM question_bank WHERE source = 'KET Official Sample' GROUP BY type, cefr_level;
