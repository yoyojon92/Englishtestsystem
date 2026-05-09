#!/bin/bash
# KET真题导入脚本
# 用法: ./import-ket-questions.sh [json文件路径]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认路径
DEFAULT_DIR="/workspace/projects/server/src/db/questions"
JSON_FILE="${1:-$DEFAULT_DIR/ket/reading_part1_test1.json}"

echo "=========================================="
echo "       KET 真题导入工具"
echo "=========================================="
echo ""

# 检查文件是否存在
if [ ! -f "$JSON_FILE" ]; then
    echo -e "${RED}错误: 文件不存在 - $JSON_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 找到文件: $JSON_FILE"

# 解析JSON基本信息
echo ""
echo "正在解析JSON..."
EXAM=$(cat "$JSON_FILE" | grep -o '"exam"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
LEVEL=$(cat "$JSON_FILE" | grep -o '"level"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
PART=$(cat "$JSON_FILE" | grep -o '"part"[[:space:]]*:[[:space:]]*[0-9]*' | head -1 | sed 's/.*:[[:space:]]*\([0-9]*\)/\1/')
Q_COUNT=$(cat "$JSON_FILE" | grep -o '"id"[[:space:]]*:[[:space:]]*"Q[0-9]*"' | wc -l)
NOTICE_COUNT=$(cat "$JSON_FILE" | grep -o '"id"[[:space:]]*:[[:space:]]*"[A-Z]"[[:space:]]*,' | wc -l)

echo -e "${GREEN}✓${NC} 解析完成:"
echo "   考试类型: $EXAM"
echo "   级别: $LEVEL"
echo "   Part: $PART"
echo "   题目数量: $Q_COUNT"
echo "   选项数量: $NOTICE_COUNT"

# 生成SQL
echo ""
echo "正在生成SQL..."

OUTPUT_FILE="${JSON_FILE%.json}.sql"

cat > "$OUTPUT_FILE" << 'HEADER'
-- KET真题导入
-- 自动生成，请勿手动修改

BEGIN;

HEADER

# 添加题目
QUESTION_NUM=1
cat "$JSON_FILE" | grep -oP '"id":\s*"\K[^"]+' | grep "^Q" | while read -r qid; do
    # 获取题目类型
    QTYPE=$(cat "$JSON_FILE" | grep -A 20 "\"id\": \"$qid\"" | grep -o '"type":\s*"\K[^"]+' | head -1)
    QTYPE="${QTYPE:-match_notice}"
    
    # 获取题目内容
    QTEXT=$(cat "$JSON_FILE" | grep -A 20 "\"id\": \"$qid\"" | grep -o '"question":\s*"\K[^"]+' | head -1)
    QTEXT="${QTEXT//\"/\\\"}"
    
    # 获取答案
    ANSWER=$(cat "$JSON_FILE" | grep -A 30 "\"id\": \"$qid\"" | grep -o '"answer":\s*"\K[^"]+' | head -1)
    
    # 获取解释
    EXPLANATION=$(cat "$JSON_FILE" | grep -A 30 "\"id\": \"$qid\"" | grep -o '"explanation":\s*"\K[^"]+' | head -1)
    EXPLANATION="${EXPLANATION//\"/\\\"}"
    
    # 获取难度
    DIFFICULTY=$(cat "$JSON_FILE" | grep -A 30 "\"id\": \"$qid\"" | grep -o '"difficulty":\s*"\K[^"]+' | head -1)
    DIFFICULTY="${DIFFICULTY:-medium}"
    
    # 获取知识点
    TAG=$(cat "$JSON_FILE" | grep -A 40 "\"id\": \"$qid\"" | grep -o '"tag":\s*"\K[^"]+' | head -1)
    
    # 获取备考参考
    PREP_LEVEL=$(cat "$JSON_FILE" | grep -A 50 "\"id\": \"$qid\"" | grep -o '"level":\s*"\K[^"]+' | head -1)
    PREP_UNIT=$(cat "$JSON_FILE" | grep -A 50 "\"id\": \"$qid\"" | grep -o '"unit":\s*"\K[^"]+' | head -1)
    PREP_SECTION=$(cat "$JSON_FILE" | grep -A 50 "\"id\": \"$qid\"" | grep -o '"section":\s*"\K[^"]+' | head -1)
    PREP_PAGE=$(cat "$JSON_FILE" | grep -A 50 "\"id\": \"$qid\"" | grep -o '"page":\s*[0-9]*' | head -1 | sed 's/.*:[[:space:]]*\([0-9]*\)/\1/')
    
    # 转换难度到数值 (easy=1, medium=2, hard=3)
    DIFF_NUM=2
    if [ "$DIFFICULTY" = "easy" ]; then
        DIFF_NUM=1
    elif [ "$DIFFICULTY" = "hard" ]; then
        DIFF_NUM=3
    fi
    
    # 生成SQL
    cat >> "$OUTPUT_FILE" << SQL
-- 题号 $QUESTION_NUM: $qid
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
    '$QTYPE',
    $DIFF_NUM,
    '\${QTEXT}',
    NULL,
    '$ANSWER',
    '\${EXPLANATION}',
    '$LEVEL',
    'KET Official Sample',
    '["$EXAM", "Reading Part $PART", "$TAG"]'::jsonb,
    '{
        "exam": "$EXAM",
        "part": $PART,
        "question_id": "$qid",
        "prepare": {
            "level": "${PREP_LEVEL:-N/A}",
            "unit": "${PREP_UNIT:-N/A}",
            "section": "${PREP_SECTION:-N/A}",
            "page": ${PREP_PAGE:-null}
        }
    }'::jsonb
);

SQL
    
    QUESTION_NUM=$((QUESTION_NUM + 1))
done

cat >> "$OUTPUT_FILE" << 'FOOTER'

COMMIT;

-- 显示导入结果
SELECT 'KET真题导入完成!' as message;
SELECT type, cefr_level, count(*) as count FROM question_bank WHERE source = 'KET Official Sample' GROUP BY type, cefr_level;
FOOTER

echo -e "${GREEN}✓${NC} SQL生成完成: $OUTPUT_FILE"

# 显示预览
echo ""
echo "=========================================="
echo "       SQL预览 (前30行)"
echo "=========================================="
head -30 "$OUTPUT_FILE"

echo ""
echo "=========================================="
echo "       导入说明"
echo "=========================================="
echo ""
echo "生成的SQL文件包含:"
echo "  - $Q_COUNT 道选择题"
echo "  - 格式: INSERT INTO question_bank"
echo ""
echo "如需导入到数据库，执行:"
echo "  psql -h localhost -U postgres -d english_app -f $OUTPUT_FILE"
echo ""
echo "或通过API导入:"
echo "  curl -X POST http://localhost:9091/api/v1/questions/batch-import"
echo ""

echo -e "${GREEN}✓${NC} KET真题处理完成!"
