#!/bin/bash

# =====================================================
# 英语能力测评与课程服务系统 - API 测试脚本
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
API_BASE_URL="${API_BASE_URL:-http://localhost:9091/api/v1}"

# 测试统计
TOTAL=0
PASSED=0
FAILED=0

# 日志函数
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

# 生成测试 token
generate_test_token() {
    # 注册测试用户
    curl -s -X POST "${API_BASE_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"phone":"test_api_user_123","password":"testpass123","name":"API Test User"}' > /dev/null 2>&1
    
    # 登录获取 token
    local response=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"phone":"test_api_user_123","password":"testpass123"}' 2>/dev/null)
    echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

# 发送 API 请求并验证
# $1: name, $2: method, $3: endpoint, $4: data (optional), $5: expected_status, $6: token (optional)
run_test() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=${5:-200}
    local token=$6
    
    local full_url="${API_BASE_URL}${endpoint}"
    TOTAL=$((TOTAL + 1))
    
    local response
    local status_code
    
    # 发送请求
    if [ -n "$token" ]; then
        if [ "$method" = "GET" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $token" "$full_url" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data" "$full_url" 2>/dev/null)
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
    
    # 验证状态码（支持通配符 * 表示任意2xx状态）
    if [ "$expected_status" = "*" ]; then
        if [[ "$status_code" =~ ^2[0-9][0-9]$ ]]; then
            PASSED=$((PASSED + 1))
            log_success "$name"
            return 0
        else
            FAILED=$((FAILED + 1))
            log_error "$name (expected: 2xx, got: $status_code)"
            return 1
        fi
    elif [ "$status_code" = "$expected_status" ]; then
        PASSED=$((PASSED + 1))
        log_success "$name"
        return 0
    else
        FAILED=$((FAILED + 1))
        log_error "$name (expected: $expected_status, got: $status_code)"
        return 1
    fi
}

# =====================================================
# 测试分组
# =====================================================

test_health() {
    log_info "Testing Health Check..."
    run_test "Health Check" GET "/health" "" 200
}

test_auth() {
    log_info "Testing Authentication APIs..."
    
    run_test "User Login" POST "/auth/login" '{"phone":"test_api_user_123","password":"testpass123"}' 200
    run_test "User Register" POST "/auth/register" '{"phone":"test_reg_user_999","password":"testpass123","name":"Register Test"}' "*"
}

test_authenticated_apis() {
    log_info "Testing Authenticated APIs..."
    
    local token=$(generate_test_token)
    if [ -z "$token" ]; then
        log_warn "Could not generate test token, skipping authenticated tests"
        return
    fi
    
    log_info "Using token: $token"
    
    # Auth endpoints
    run_test "Get User Info" GET "/auth/me" "" 200 "$token"
    run_test "Update Profile" PUT "/auth/profile" '{"name":"Updated Name"}' 200 "$token"
    
    # Assessment endpoints
    run_test "Get Assessment Levels" GET "/assessments/levels" "" 200 "$token"
    run_test "Get Assessment History" GET "/assessments/history" "" 200 "$token"
    
    # Course endpoints
    run_test "Get Course List" GET "/courses/" "" 200
    run_test "Get My Enrollments" GET "/courses/my/enrollments" "" 200 "$token"
    
    # Exam endpoints
    run_test "Get Exam Catalog" GET "/exams/" "" 200
    run_test "Get Exam Sessions" GET "/exams/KET/sessions" "" 200
    run_test "Get Exam Session Cities" GET "/exams/sessions/cities" "" 200
    run_test "Get My Registrations" GET "/exams/registrations/list" "" 200 "$token"
    run_test "Get Mock Exam Questions" GET "/exams/mock/questions?examType=KET" "" 200
    run_test "Get Mock Exam History" GET "/exams/mock/history" "" 200 "$token"
    
    # Payment endpoints
    run_test "Get Payment Orders" GET "/payment/list" "" 200 "$token"
    
    # Student Profile (requires childId, e.g., /student-profile/c1111111-1111-1111-1111-111111111111/full)
    run_test "Get Student Profile Full" GET "/student-profile/c1111111-1111-1111-1111-111111111111/full" "" 200 "$token"
    run_test "Get Student Profile Radar" GET "/student-profile/c1111111-1111-1111-1111-111111111111/radar" "" 200 "$token"
    run_test "Get Student Profile Trends" GET "/student-profile/c1111111-1111-1111-1111-111111111111/trends" "" 200 "$token"
    
    # CEFR Assessment (uses /cefr/assessments/:childId)
    run_test "Get CEFR Progress" GET "/cefr/progress/c1111111-1111-1111-1111-11111111111123" "" 200 "$token"
    run_test "Get CEFR History" GET "/cefr/assessments/c1111111-1111-1111-1111-11111111111123" "" 200 "$token"
    
    # Mock Exam (uses /mock-exam/config/:examType)
    run_test "Get Mock Exam Config" GET "/mock-exam/config/KET" "" 200 "$token"
    
    # Notification (uses /notifications/templates/list)
    run_test "Get Notifications" GET "/notifications/" "" 200 "$token"
    run_test "Get Notification Templates" GET "/notifications/templates/list" "" 200 "$token"
    
    # Free Course (uses /free-courses/lessons and /free-courses/achievements/list)
    run_test "Get Free Course Categories" GET "/free-courses/categories" "" 200
    run_test "Get Free Course Lessons" GET "/free-courses/lessons" "" 200
    run_test "Get My Achievements" GET "/free-courses/achievements/list" "" 200 "$token"
    
    # QR Code (uses /qrcode/list)
    run_test "Get QR Code List" GET "/qrcode/list" "" 200
    run_test "Generate QR Code" POST "/qrcode/generate" '{"url":"https://example.com","channelName":"test"}' 200
    
    # WeCom (uses /wecom/classes and /wecom/stats)
    run_test "Get My Students" GET "/wecom/students" "" 200 "$token"
    run_test "Get Classes" GET "/wecom/classes" "" 200 "$token"
    run_test "Get WeCom Stats" GET "/wecom/stats" "" 200 "$token"
    
    # Prep Plan
    run_test "Get Prep Plans" GET "/prep-plan/c1111111-1111-1111-1111-11111111111123" "" 200 "$token"
    
    # AI Teacher (uses /ai/status or /ai/health)
    run_test "Get AI Health" GET "/ai/health" "" 200
    run_test "Get AI Status" GET "/ai/status" "" 200
}

test_payment() {
    log_info "Testing Payment APIs..."
    
    local token=$(generate_test_token)
    if [ -z "$token" ]; then
        log_warn "Could not generate test token, skipping payment tests"
        return
    fi
    
    # Test create payment order
    local order_no="TEST$(date +%s)"
    run_test "Create Payment Order" POST "/payment/create" "{\"orderNo\":\"$order_no\",\"amount\":59.9,\"productType\":\"assessment\",\"productId\":\"test-123\",\"description\":\"Test Order\"}" 200 "$token"
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
    
    # 测试不需要认证的接口
    test_health
    test_auth
    
    # 测试需要认证的接口
    test_authenticated_apis
    
    # 测试支付接口
    test_payment
    
    # 打印结果
    echo ""
    echo "====================================================="
    echo "  测试完成"
    echo "  总计: $TOTAL"
    echo -e "  通过: ${GREEN}$PASSED${NC}"
    echo -e "  失败: ${RED}$FAILED${NC}"
    echo "====================================================="
    
    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

main "$@"
