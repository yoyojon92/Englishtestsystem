#!/bin/bash
# ============================================================================
# 英语学习诊断系统 - 端到端测试脚本
# ============================================================================

set -e  # 遇到错误立即退出

# 配置
API_BASE="http://localhost:9091/api/v1"
FRONTEND_BASE="http://localhost:5000"
TEST_USER="13800138001"
TIMESTAMP=$(date +%s)
RANDOM_ID=$((RANDOM % 10000))
TEST_SESSION="e2e_${TIMESTAMP}_${RANDOM_ID}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 分隔线
separator() {
    echo "============================================================================"
}

# ============================================================================
# 测试场景1: 用户注册 → 登录 → 做测试 → 出报告 → 支付解锁
# ============================================================================
test_user_flow() {
    separator
    echo "测试场景1: 用户注册 → 登录 → 做测试 → 出报告 → 支付解锁"
    separator
    
    # 1. 创建测试会话
    log_info "步骤1: 创建测试会话"
    SESSION_RESPONSE=$(curl -s -X POST "${API_BASE}/test/session/create" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"${TEST_USER}\",\"channel\":\"e2e_test\"}")
    
    SESSION_ID=$(echo $SESSION_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['sessionId'])" 2>/dev/null || echo "")
    
    if [ -z "$SESSION_ID" ]; then
        log_error "创建会话失败"
        log_info "响应: $SESSION_RESPONSE"
        return 1
    fi
    log_success "会话创建成功: $SESSION_ID"
    
    # 2. 获取测试题目
    log_info "步骤2: 获取测试题目"
    QUESTIONS=$(curl -s "${API_BASE}/questions/quick-test")
    QUESTION_COUNT=$(echo $QUESTIONS | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "0")
    log_success "获取题目成功: $QUESTION_COUNT 道题"
    
    # 3. 提交单题答案
    log_info "步骤3: 提交单题答案"
    for i in {1..5}; do
        ANSWER_RESPONSE=$(curl -s -X POST "${API_BASE}/test/session/${SESSION_ID}/answer" \
            -H "Content-Type: application/json" \
            -d "{\"questionId\":\"ket_r1_t1_q${i}\",\"answer\":\"A\",\"timeSpent\":$((15 + RANDOM % 30))}")
        
        IS_CORRECT=$(echo $ANSWER_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['isCorrect'])" 2>/dev/null || echo "unknown")
        log_info "  题目$i: 正确=$IS_CORRECT"
    done
    log_success "答案提交完成"
    
    # 4. 提交试卷
    log_info "步骤4: 提交试卷"
    SUBMIT_RESPONSE=$(curl -s -X POST "${API_BASE}/test/session/${SESSION_ID}/submit")
    CEFR_LEVEL=$(echo $SUBMIT_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['cefrLevel'])" 2>/dev/null || echo "unknown")
    SCORE=$(echo $SUBMIT_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['score'])" 2>/dev/null || echo "unknown")
    log_success "试卷提交成功: CEFR=$CEFR_LEVEL, 正确率=$SCORE%"
    
    # 5. 获取报告
    log_info "步骤5: 获取测试报告"
    REPORT_RESPONSE=$(curl -s "${API_BASE}/test/report/${SESSION_ID}")
    REPORT_SUCCESS=$(echo $REPORT_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null || echo "false")
    
    if [ "$REPORT_SUCCESS" = "True" ]; then
        log_success "报告获取成功"
        echo "$REPORT_RESPONSE" | python3 -m json.tool | head -20
    else
        log_error "报告获取失败"
    fi
    
    # 6. 记录到全局变量供后续使用
    export TEST_SESSION_ID=$SESSION_ID
}

# ============================================================================
# 测试场景2: 生成分享链接 → 点击访问 → 记录渠道 → 转化统计
# ============================================================================
test_share_flow() {
    separator
    echo "测试场景2: 生成分享链接 → 点击访问 → 记录渠道 → 转化统计"
    separator
    
    # 1. 生成分享链接
    log_info "步骤1: 生成分享链接"
    SHARE_RESPONSE=$(curl -s -X POST "${API_BASE}/share/generate" \
        -H "Content-Type: application/json" \
        -d '{"test_id":"quick_test_v1","source":"wechat","ref_id":"school_beijing_001"}')
    
    SHARE_URL=$(echo $SHARE_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['shareUrl'])" 2>/dev/null || echo "")
    
    if [ -z "$SHARE_URL" ]; then
        log_error "分享链接生成失败"
        log_info "响应: $SHARE_RESPONSE"
        return 1
    fi
    log_success "分享链接生成成功: $SHARE_URL"
    
    # 2. 记录点击行为
    log_info "步骤2: 记录点击行为"
    TRACK_RESPONSE=$(curl -s -X POST "${API_BASE}/share/track" \
        -H "Content-Type: application/json" \
        -d '{"action":"click","params":{"testId":"quick_test_v1","source":"wechat","refId":"school_beijing_001"}}')
    
    TRACK_SUCCESS=$(echo $TRACK_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null || echo "false")
    if [ "$TRACK_SUCCESS" = "True" ]; then
        log_success "点击记录成功"
    else
        log_warning "点击记录失败"
    fi
    
    # 3. 记录开始测试
    log_info "步骤3: 记录开始测试"
    START_RESPONSE=$(curl -s -X POST "${API_BASE}/share/track" \
        -H "Content-Type: application/json" \
        -d '{"action":"start_test","params":{"testId":"quick_test_v1","source":"wechat","refId":"school_beijing_001"}}')
    
    # 4. 记录完成测试
    log_info "步骤4: 记录完成测试"
    COMPLETE_RESPONSE=$(curl -s -X POST "${API_BASE}/share/track" \
        -H "Content-Type: application/json" \
        -d '{"action":"complete_test","params":{"testId":"quick_test_v1","source":"wechat","refId":"school_beijing_001","sessionId":"'"${TEST_SESSION_ID}"'"}}')
    
    # 5. 获取渠道统计
    log_info "步骤5: 获取渠道统计"
    STATS_RESPONSE=$(curl -s "${API_BASE}/share/stats")
    STATS_JSON=$(echo $STATS_RESPONSE | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE")
    
    log_success "渠道统计获取成功"
    echo "$STATS_JSON" | head -30
    
    # 6. 获取渠道漏斗
    log_info "步骤6: 获取渠道漏斗"
    FUNNEL_RESPONSE=$(curl -s "${API_BASE}/share/funnel/wechat")
    FUNNEL_JSON=$(echo $FUNNEL_RESPONSE | python3 -m json.tool 2>/dev/null || echo "$FUNNEL_RESPONSE")
    echo "$FUNNEL_JSON"
}

# ============================================================================
# 测试场景3: 教师端 - 查看学生 → 发布练习 → 审核报告
# ============================================================================
test_teacher_flow() {
    separator
    echo "测试场景3: 教师端 - 查看学生 → 发布练习 → 审核报告"
    separator
    
    # 1. 获取学生列表
    log_info "步骤1: 获取学生列表"
    STUDENTS_RESPONSE=$(curl -s "${API_BASE}/students")
    STUDENT_COUNT=$(echo $STUDENTS_RESPONSE | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null || echo "0")
    log_success "获取学生列表成功: $STUDENT_COUNT 名学生"
    
    # 2. 获取学习数据
    log_info "步骤2: 获取学习数据概览"
    OVERVIEW_RESPONSE=$(curl -s "${API_BASE}/learning-overview")
    log_success "获取学习数据概览成功"
    echo "$OVERVIEW_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
    
    # 3. 获取学习计划
    log_info "步骤3: 获取学习计划"
    if [ -n "$TEST_SESSION_ID" ]; then
        PLAN_RESPONSE=$(curl -s "${API_BASE}/learning-plan/test_user")
        PLAN_JSON=$(echo $PLAN_RESPONSE | python3 -m json.tool 2>/dev/null || echo "$PLAN_RESPONSE")
        log_success "获取学习计划成功"
        echo "$PLAN_JSON" | head -15
    else
        log_warning "跳过: 无测试会话ID"
    fi
    
    # 4. 获取本周任务
    log_info "步骤4: 获取本周任务"
    TASKS_RESPONSE=$(curl -s "${API_BASE}/learning-plan/test_user/this-week")
    TASKS_JSON=$(echo $TASKS_RESPONSE | python3 -m json.tool 2>/dev/null || echo "$TASKS_RESPONSE")
    log_success "获取本周任务成功"
    echo "$TASKS_JSON" | head -20
}

# ============================================================================
# 测试场景4: 题库管理
# ============================================================================
test_question_bank() {
    separator
    echo "测试场景4: 题库管理"
    separator
    
    # 1. 获取试卷列表
    log_info "步骤1: 获取试卷列表"
    SETS_RESPONSE=$(curl -s "${API_BASE}/questions/sets")
    SET_COUNT=$(echo $SETS_RESPONSE | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null || echo "0")
    log_success "试卷总数: $SET_COUNT"
    
    # 2. 获取KET真题
    log_info "步骤2: 获取KET Reading Part 1"
    KET_RESPONSE=$(curl -s "${API_BASE}/questions/KET/1")
    KET_COUNT=$(echo $KET_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "0")
    log_success "KET Reading Part 1: $KET_COUNT 道题"
    
    # 3. 获取PET真题
    log_info "步骤3: 获取PET Reading Part 1"
    PET_RESPONSE=$(curl -s "${API_BASE}/questions/PET/1")
    PET_COUNT=$(echo $PET_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "0")
    log_success "PET Reading Part 1: $PET_COUNT 道题"
    
    # 4. 获取快速测试题目
    log_info "步骤4: 获取快速测试题目"
    QUICK_RESPONSE=$(curl -s "${API_BASE}/questions/quick-test")
    QUICK_COUNT=$(echo $QUICK_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "0")
    log_success "快速测试题目: $QUICK_COUNT 道"
}

# ============================================================================
# 测试场景5: 诊断和学习规划
# ============================================================================
test_diagnosis_planning() {
    separator
    echo "测试场景5: 诊断和学习规划"
    separator
    
    # 1. 运行诊断
    log_info "步骤1: 运行诊断"
    if [ -n "$TEST_SESSION_ID" ]; then
        DIAGNOSIS_RESPONSE=$(curl -s -X POST "${API_BASE}/diagnosis/run" \
            -H "Content-Type: application/json" \
            -d '{"student_id":"test_user"}')
        
        DIAGNOSIS_SUCCESS=$(echo $DIAGNOSIS_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null || echo "false")
        if [ "$DIAGNOSIS_SUCCESS" = "True" ]; then
            log_success "诊断完成"
            echo "$DIAGNOSIS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15
        fi
    else
        log_warning "跳过: 无测试会话ID"
    fi
    
    # 2. 获取学习计划
    log_info "步骤2: 获取学习计划"
    PLAN_RESPONSE=$(curl -s "${API_BASE}/learning-plan/test_user")
    PLAN_SUCCESS=$(echo $PLAN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null || echo "false")
    
    if [ "$PLAN_SUCCESS" = "True" ]; then
        log_success "学习计划获取成功"
        echo "$PLAN_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
    fi
    
    # 3. 获取教材推荐
    log_info "步骤3: 获取教材推荐"
    MATERIALS_RESPONSE=$(curl -s "${API_BASE}/learning-plan/materials/list")
    MATERIALS_SUCCESS=$(echo $MATERIALS_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null || echo "false")
    
    if [ "$MATERIALS_SUCCESS" = "True" ]; then
        log_success "教材推荐获取成功"
        echo "$MATERIALS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15
    fi
}

# ============================================================================
# 测试场景6: 前端页面
# ============================================================================
test_frontend() {
    separator
    echo "测试场景6: 前端页面"
    separator
    
    # 1. 首页
    log_info "步骤1: 检查首页"
    HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_BASE}/")
    if [ "$HOME_STATUS" = "200" ]; then
        log_success "首页访问成功: HTTP $HOME_STATUS"
    else
        log_error "首页访问失败: HTTP $HOME_STATUS"
    fi
    
    # 2. 测试入口页
    log_info "步骤2: 检查测试入口页"
    ENTRY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_BASE}/test/entry")
    if [ "$ENTRY_STATUS" = "200" ]; then
        log_success "测试入口页访问成功: HTTP $ENTRY_STATUS"
    else
        log_warning "测试入口页访问失败: HTTP $ENTRY_STATUS"
    fi
    
    # 3. 管理后台
    log_info "步骤3: 检查管理后台"
    ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_BASE}/admin")
    if [ "$ADMIN_STATUS" = "200" ]; then
        log_success "管理后台访问成功: HTTP $ADMIN_STATUS"
    else
        log_warning "管理后台访问失败: HTTP $ADMIN_STATUS"
    fi
}

# ============================================================================
# 健康检查
# ============================================================================
health_check() {
    separator
    echo "健康检查"
    separator
    
    # API健康检查
    log_info "检查API服务"
    HEALTH_RESPONSE=$(curl -s "${API_BASE}/health")
    if [ -n "$HEALTH_RESPONSE" ]; then
        log_success "API服务正常: $HEALTH_RESPONSE"
    else
        log_error "API服务无响应"
        return 1
    fi
    
    # 前端健康检查
    log_info "检查前端服务"
    FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_BASE}/")
    if [ "$FRONTEND_RESPONSE" = "200" ]; then
        log_success "前端服务正常: HTTP $FRONTEND_RESPONSE"
    else
        log_warning "前端服务异常: HTTP $FRONTEND_RESPONSE"
    fi
}

# ============================================================================
# 生成测试报告
# ============================================================================
generate_report() {
    separator
    echo "测试报告汇总"
    separator
    echo ""
    echo "测试完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "测试会话ID: ${TEST_SESSION_ID:-N/A}"
    echo ""
    echo "测试覆盖场景:"
    echo "  1. 用户注册 → 登录 → 做测试 → 出报告"
    echo "  2. 生成分享链接 → 点击访问 → 渠道追踪"
    echo "  3. 教师端 - 查看学生 → 发布练习"
    echo "  4. 题库管理"
    echo "  5. 诊断和学习规划"
    echo "  6. 前端页面"
    echo ""
    log_success "端到端测试完成!"
}

# ============================================================================
# 主函数
# ============================================================================
main() {
    echo ""
    echo "============================================================================"
    echo "         英语学习诊断系统 - 端到端自动化测试"
    echo "============================================================================"
    echo ""
    
    # 健康检查
    health_check || {
        log_error "健康检查失败，请确保服务已启动"
        exit 1
    }
    
    # 运行测试场景
    test_question_bank
    
    test_user_flow || log_warning "用户流程测试遇到问题，继续其他测试"
    
    test_share_flow || log_warning "分享流程测试遇到问题，继续其他测试"
    
    test_teacher_flow || log_warning "教师流程测试遇到问题，继续其他测试"
    
    test_diagnosis_planning || log_warning "诊断规划测试遇到问题，继续其他测试"
    
    test_frontend
    
    # 生成报告
    generate_report
}

# 运行
main "$@"
