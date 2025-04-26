#!/bin/bash

# InsightDash Comprehensive Testing Script
echo "🧪 InsightDash Comprehensive Testing Suite"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
tests_passed=0
tests_failed=0
total_tests=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_exit_code="${3:-0}"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    ((total_tests++))
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ $? -eq $expected_exit_code ]; then
            echo -e "${GREEN}✅ PASS: $test_name${NC}"
            ((tests_passed++))
        else
            echo -e "${RED}❌ FAIL: $test_name (wrong exit code)${NC}"
            ((tests_failed++))
        fi
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((tests_failed++))
    fi
    echo ""
}

# Function to test API endpoint
test_api() {
    local endpoint="$1"
    local description="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}Testing API: $description${NC}"
    ((total_tests++))
    
    response=$(curl -s "http://localhost:8001$endpoint" 2>/dev/null)
    if [ $? -eq 0 ] && [[ $response =~ $expected_pattern ]]; then
        echo -e "${GREEN}✅ PASS: $description${NC}"
        ((tests_passed++))
    else
        echo -e "${RED}❌ FAIL: $description${NC}"
        echo -e "  Response: ${response:0:100}..."
        ((tests_failed++))
    fi
    echo ""
}

echo "🔧 Backend API Tests"
echo "==================="

# Test backend API endpoints
test_api "/api/v1/datasets" "Datasets endpoint" "\[\{.*\}\]"
test_api "/api/v1/analytics/models/stats" "Model stats endpoint" "\[\{.*model_type.*\}\]"
test_api "/api/v1/analytics/models/compare" "Model comparison endpoint" "\[\{.*model_type.*\}\]"

# Test authentication
echo -e "${BLUE}Testing: Authentication endpoint${NC}"
((total_tests++))
auth_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  http://localhost:8001/api/v1/auth/login 2>/dev/null)

if [[ $auth_response =~ "access_token" ]]; then
    echo -e "${GREEN}✅ PASS: Authentication endpoint${NC}"
    ((tests_passed++))
else
    echo -e "${RED}❌ FAIL: Authentication endpoint${NC}"
    ((tests_failed++))
fi
echo ""

# Test demo data generation
echo -e "${BLUE}Testing: Demo data generation${NC}"
((total_tests++))
demo_response=$(curl -s -X POST http://localhost:8001/api/v1/demo/generate-data 2>/dev/null)
if [[ $demo_response =~ "Sales Sample Data" ]]; then
    echo -e "${GREEN}✅ PASS: Demo data generation${NC}"
    ((tests_passed++))
else
    echo -e "${RED}❌ FAIL: Demo data generation${NC}"
    ((tests_failed++))
fi
echo ""

echo "🏗️ Frontend Build Tests"
echo "======================"

# Test development build
run_test "Frontend compiles without errors" "cd /Users/test/InsightDash/InsightDash/frontend && npm run build" 0

# Test if build artifacts exist
run_test "Main JavaScript bundle exists" "test -f /Users/test/InsightDash/InsightDash/frontend/build/static/js/main.*.js"
run_test "Main CSS bundle exists" "test -f /Users/test/InsightDash/InsightDash/frontend/build/static/css/main.*.css"
run_test "Index.html exists" "test -f /Users/test/InsightDash/InsightDash/frontend/build/index.html"

# Test bundle sizes (reasonable for production)
run_test "JavaScript bundle size check" "test $(find /Users/test/InsightDash/InsightDash/frontend/build/static/js/main.*.js -exec wc -c {} \\; | cut -d' ' -f1) -lt 2000000" # < 2MB

echo "📁 File Structure Tests"
echo "======================"

# Test critical files exist
run_test "Package.json exists" "test -f /Users/test/InsightDash/InsightDash/frontend/package.json"
run_test "Environment config exists" "test -f /Users/test/InsightDash/InsightDash/frontend/.env"
run_test "Main App component exists" "test -f /Users/test/InsightDash/InsightDash/frontend/src/App.jsx"
run_test "API service exists" "test -f /Users/test/InsightDash/InsightDash/frontend/src/services/api.js"
run_test "React Query hooks exist" "test -f /Users/test/InsightDash/InsightDash/frontend/src/hooks/useData.js"

# Test key components exist
run_test "ForecastModal component exists" "test -f /Users/test/InsightDash/InsightDash/frontend/src/components/analytics/ForecastModal.jsx"
run_test "DatasetList component exists" "test -f /Users/test/InsightDash/InsightDash/frontend/src/components/datasets/DatasetList.jsx"
run_test "Analytics component exists" "test -f /Users/test/InsightDash/InsightDash/frontend/src/components/analytics/Analytics.jsx"

echo "🔍 Code Quality Tests"
echo "===================="

# Test for common issues
run_test "No console.error calls in production code" "! grep -r 'console\.error' /Users/test/InsightDash/InsightDash/frontend/src/ --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx'"
run_test "No TODO comments in critical files" "! grep -r 'TODO' /Users/test/InsightDash/InsightDash/frontend/src/services/ --include='*.js'"

echo "📊 Summary"
echo "=========="
echo -e "Total tests: $total_tests"
echo -e "${GREEN}Passed: $tests_passed${NC}"
echo -e "${RED}Failed: $tests_failed${NC}"

if [ $tests_failed -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Application is ready for deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review before deployment.${NC}"
    exit 1
fi
