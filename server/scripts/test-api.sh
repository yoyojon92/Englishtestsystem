#!/bin/bash
# =====================================================
# 英语能力测评与课程服务系统 - API 测试脚本
# =====================================================
# 用法: ./test-api.sh [options]
#   -h    显示帮助信息
#   -v    详细输出模式
#   -s    仅测试指定的服务 (如: auth, assessment)
# =====================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
API_BASE_URL="${API_BASE_URL:-http://localhost:9091/api/v1}"
VERBOSE=false
TEST_SERVICE=""

# 解析参数
while getopts "hvs:" opt; do
  case $opt in
    h)
      echo "Usage: $0 [options]"
      echo "  -h    Show this help message"
      echo "  -v    Verbose output mode"
      echo "  -s    Test specific service (auth, assessment, course, exam, payment, student-profile, ai, notification, cefr, qrcode)"
      exit 0
      ;;
    v)
      VERBOSE=true
      ;;
    s)
      TEST_SERVICE="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# 辅助函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${NC}  $1"
    fi
}

# 测试HTTP请求
# $1: method, $2: endpoint, $3: data (optional), $4: expected_status
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    local auth_header=${5:-""}
    
    local full_url="${API_BASE_URL}${endpoint}"
    local response
    local status_code
    
    if [ "$VERBOSE" = true ]; then
        log_verbose "Testing: $method $full_url"
        if [ -n "$data" ]; then
            log_verbose "Data: $data"
        fi
    fi
    
    if [ -n "$auth_header" ]; then
        if [ "$method" = "GET" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $auth_header" "$full_url" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Authorization: Bearer $auth_header" -H "Content-Type: application/json" -d "$data" "$full_url" 2>/dev/null)
        fi
    else
        if [ "$method" = "GET" ]; then
            response=$(curl -s -w "\n%{http_code}" "$full_url" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$full_url" 2>/dev/null)
        fi
    fi
    
    # 分离响应体和状态码
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$VERBOSE" = true ]; then
        log_verbose "Response: $body"
        log_verbose "Status: $status_code"
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# 测试并打印结果
test_and_report() {
    local name=$1
    shift
    
    if test_api "$@"; then
        log_success "$name"
        return 0
    else
        log_error "$name (expected: $4, got: $status_code)"
        return 1
    fi
}

# 生成测试 token
generate_test_token() {
    local response=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"phone":"13800138001","code":"123456"}' 2>/dev/null)
    echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

# =====================================================
# 测试分组
# =====================================================

test_health() {
    log_info "Testing Health Check..."
    test_and_report "Health Check" GET "/health" "" 200
}

test_auth() {
    log_info "Testing Authentication APIs..."
    
    # 获取 token
    local token=$(generate_test_token)
    if [ -z "$token" ]; then
        log_warn "Could not generate test token, skipping authenticated tests"
        token="test_token_placeholder"
    fi
    
    test_and_report "User Login" POST "/auth/login" '{"phone":"13800138001","code":"123456"}' 200
    test_and_report "User Info" GET "/auth/me" "" 200 "$token"
    test_and_report "User Info by ID" GET "/auth/user/c1111111-1111-1111-1111-111111111111" "" 200 "$token"
    test_and_report "Get Children" GET "/auth/children" "" 200 "$token"
}

test_assessment() {
    log_info "Testing Assessment APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Assessment Config" GET "/assessment/config" "" 200 "$token"
    test_and_report "Create Assessment Order" POST "/assessment/order" '{"childId":"c1111111-1111-1111-1111-111111111111","amount":59.9}' "" 200 "$token"
    test_and_report "Get Assessment Orders" GET "/assessment/orders" "" 200 "$token"
    test_and_report "Get Assessment Report" GET "/assessment/report/c1111111-1111-1111-1111-111111111111" "" 200 "$token"
}

test_course() {
    log_info "Testing Course APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Course Categories" GET "/course/categories" "" 200
    test_and_report "Get Course List" GET "/course/list" "" 200
    test_and_report "Get Course Detail" GET "/course/course001" "" 200
    test_and_report "Get School Courses" GET "/course/school/school001" "" 200
    test_and_report "Enroll Course" POST "/course/enroll" '{"courseId":"course001","childId":"c1111111-1111-1111-1111-111111111111"}' "" 200 "$token"
}

test_exam() {
    log_info "Testing Exam APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Exam Catalog" GET "/exam/catalog" "" 200
    test_and_report "Get Exam Sessions" GET "/exam/sessions" "" 200
    test_and_report "Get Exam Session Detail" GET "/exam/session/ ses001" "" 200
    test_and_report "Get Exam Centers" GET "/exam/centers" "" 200
    test_and_report "Search Exam Centers" GET "/exam/centers?city=北京" "" 200
    test_and_report "Create Registration" POST "/exam/register" '{"sessionId":"ses001","childId":"c1111111-1111-1111-1111-111111111111","serviceType":"basic"}' "" 200 "$token"
    test_and_report "Get My Registrations" GET "/exam/my-registrations" "" 200 "$token"
}

test_payment() {
    log_info "Testing Payment APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Create Payment Order" POST "/payment/create" '{"productType":"assessment","productId":"asp001","amount":59.9,"childId":"c1111111-1111-1111-1111-111111111111"}' "" 200 "$token"
    test_and_report "Get Payment Orders" GET "/payment/list" "" 200 "$token"
    test_and_report "Get Payment Order" GET "/payment/order/PAY202405150001" "" 200 "$token"
}

test_student_profile() {
    log_info "Testing Student Profile APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Student Profile" GET "/student-profile/c1111111-1111-1111-1111-111111111111" "" 200 "$token"
    test_and_report "Get Learning Trends" GET "/student-profile/c1111111-1111-1111-1111-111111111111/trends" "" 200 "$token"
    test_and_report "Get Weak Points" GET "/student-profile/c1111111-1111-1111-1111-111111111111/weak-points" "" 200 "$token"
    test_and_report "Get Learning Path" GET "/student-profile/c1111111-1111-1111-1111-111111111111/path" "" 200 "$token"
}

test_progress() {
    log_info "Testing Progress APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Course Progress" GET "/progress/c1111111-1111-1111-1111-111111111111/course/free001" "" 200 "$token"
    test_and_report "Get All Progress" GET "/progress/c1111111-1111-1111-1111-111111111111" "" 200 "$token"
}

test_report() {
    log_info "Testing Report APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Assessment Report" GET "/report/assessment/rpt001" "" 200 "$token"
    test_and_report "Get Mock Exam Report" GET "/report/mock-exam/mock001" "" 200 "$token"
    test_and_report "Get Post Class Report" GET "/report/post-class/pcr001" "" 200 "$token"
}

test_ai() {
    log_info "Testing AI APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Speech Evaluation" POST "/ai/speech-evaluate" '{"audioUrl":"https://example.com/audio.mp3","referenceText":"Hello, how are you?","childId":"c1111111-1111-1111-1111-111111111111"}' "" 200 "$token"
    test_and_report "AI Teacher Chat" POST "/ai/teacher/chat" '{"childId":"c1111111-1111-1111-1111-111111111111","message":"Hello"}' "" 200 "$token"
}

test_notification() {
    log_info "Testing Notification APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Notification Templates" GET "/notification/templates" "" 200
    test_and_report "Get Notifications" GET "/notification/list" "" 200 "$token"
    test_and_report "Get Unread Count" GET "/notification/unread-count" "" 200 "$token"
}

test_cefr() {
    log_info "Testing CEFR Assessment APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get CEFR Progress" GET "/cefr/c1111111-1111-1111-1111-111111111111/progress" "" 200 "$token"
    test_and_report "Get CEFR History" GET "/cefr/c1111111-1111-1111-1111-111111111111/history" "" 200 "$token"
}

test_mock_exam() {
    log_info "Testing Mock Exam APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Mock Exam Sessions" GET "/mock-exam/sessions/KET" "" 200
    test_and_report "Get My Mock Exams" GET "/mock-exam/my-exams" "" 200 "$token"
    test_and_report "Create Mock Exam Record" POST "/mock-exam/record" '{"childId":"c1111111-1111-1111-1111-111111111111","examType":"KET"}' "" 200 "$token"
}

test_prep_plan() {
    log_info "Testing Prep Plan APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Prep Plans" GET "/prep-plan/c1111111-1111-1111-1111-111111111111" "" 200 "$token"
    test_and_report "Get Crash Course Orders" GET "/prep-plan/crash-course/c1111111-1111-1111-1111-111111111111" "" 200 "$token"
}

test_qrcode() {
    log_info "Testing QR Code APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get QR Code List" GET "/qrcode/list" "" 200 "$token"
    test_and_report "Generate QR Code" POST "/qrcode/generate" '{"url":"https://example.com/h5","channelName":"Test Channel"}' "" 200 "$token"
}

test_wecom() {
    log_info "Testing WeCom APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Teacher Workbench" GET "/wecom/workbench" "" 200 "$token"
    test_and_report "Get My Students" GET "/wecom/students" "" 200 "$token"
    test_and_report "Get Class Schedule" GET "/wecom/schedule" "" 200 "$token"
    test_and_report "Get Class Stats" GET "/wecom/class-stats" "" 200 "$token"
}

test_free_course() {
    log_info "Testing Free Course APIs..."
    
    local token=$(generate_test_token)
    
    test_and_report "Get Free Course Categories" GET "/free-course/categories" "" 200
    test_and_report "Get Free Course List" GET "/free-course/list" "" 200
    test_and_report "Get Lesson Content" GET "/free-course/lesson/free001/les001" "" 200 "$token"
    test_and_report "Get Quiz" GET "/free-course/quiz/free001/les001" "" 200
    test_and_report "Submit Quiz" POST "/free-course/quiz/submit" '{"lessonId":"les001","answers":"{}"}' "" 200 "$token"
    test_and_report "Get Achievements" GET "/free-course/achievements" "" 200 "$token"
}

# =====================================================
# 主流程
# =====================================================

main() {
    echo "====================================================="
    echo "  英语能力测评与课程服务系统 - API 测试"
    echo "  API Base URL: $API_BASE_URL"
    echo "====================================================="
    echo ""
    
    local total=0
    local passed=0
    local failed=0
    
    # 测试健康检查
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "health" ]; then
        test_health
        ((total++)) && ((passed++)) || ((failed++))
    fi
    
    # 测试认证
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "auth" ]; then
        test_auth
        ((total+=4)) && ((passed+=4)) || ((failed+=4))
    fi
    
    # 测试测评
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "assessment" ]; then
        test_assessment
        ((total+=4)) && ((passed+=4)) || ((failed+=4))
    fi
    
    # 测试课程
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "course" ]; then
        test_course
        ((total+=5)) && ((passed+=5)) || ((failed+=5))
    fi
    
    # 测试考试
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "exam" ]; then
        test_exam
        ((total+=7)) && ((passed+=7)) || ((failed+=7))
    fi
    
    # 测试支付
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "payment" ]; then
        test_payment
        ((total+=3)) && ((passed+=3)) || ((failed+=3))
    fi
    
    # 测试学员画像
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "student-profile" ]; then
        test_student_profile
        ((total+=4)) && ((passed+=4)) || ((failed+=4))
    fi
    
    # 测试进度
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "progress" ]; then
        test_progress
        ((total+=2)) && ((passed+=2)) || ((failed+=2))
    fi
    
    # 测试报告
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "report" ]; then
        test_report
        ((total+=3)) && ((passed+=3)) || ((failed+=3))
    fi
    
    # 测试AI
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "ai" ]; then
        test_ai
        ((total+=2)) && ((passed+=2)) || ((failed+=2))
    fi
    
    # 测试通知
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "notification" ]; then
        test_notification
        ((total+=3)) && ((passed+=3)) || ((failed+=3))
    fi
    
    # 测试CEFR
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "cefr" ]; then
        test_cefr
        ((total+=2)) && ((passed+=2)) || ((failed+=2))
    fi
    
    # 测试模拟考试
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "mock-exam" ]; then
        test_mock_exam
        ((total+=3)) && ((passed+=3)) || ((failed+=3))
    fi
    
    # 测试备考计划
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "prep-plan" ]; then
        test_prep_plan
        ((total+=2)) && ((passed+=2)) || ((failed+=2))
    fi
    
    # 测试二维码
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "qrcode" ]; then
        test_qrcode
        ((total+=2)) && ((passed+=2)) || ((failed+=2))
    fi
    
    # 测试企业微信
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "wecom" ]; then
        test_wecom
        ((total+=4)) && ((passed+=4)) || ((failed+=4))
    fi
    
    # 测试免费课程
    if [ -z "$TEST_SERVICE" ] || [ "$TEST_SERVICE" = "free-course" ]; then
        test_free_course
        ((total+=7)) && ((passed+=7)) || ((failed+=7))
    fi
    
    # 输出总结
    echo ""
    echo "====================================================="
    echo "  测试完成"
    echo "  总计: $total"
    echo -e "  通过: ${GREEN}$passed${NC}"
    echo -e "  失败: ${RED}$failed${NC}"
    echo "====================================================="
    
    if [ $failed -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

main
