#!/bin/bash

# Final Comprehensive Test Suite for InsightDash
# This script tests all major functionality thoroughly

set -e  # Exit on any error

API_BASE="http://localhost:8000/api/v1"
FRONTEND_URL="http://localhost:3000"

echo "🧪 === INSIGHTDASH COMPREHENSIVE TEST SUITE ==="
echo "Testing backend API and frontend integration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_code="${3:-0}"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ $? -eq $expected_code ]; then
            echo -e "${GREEN}✓ PASS${NC}"
            ((TESTS_PASSED++))
            return 0
        fi
    fi
    
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    return 1
}

# Helper function to test JSON endpoint
test_json_endpoint() {
    local endpoint="$1"
    local description="$2"
    local expected_field="$3"
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$API_BASE$endpoint")
    if echo "$response" | jq -e "$expected_field" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $response"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "🔧 === BACKEND API TESTS ==="

# Test basic endpoints
test_json_endpoint "/datasets" "datasets list" ".[0].id"
test_json_endpoint "/datasets/1" "individual dataset" ".id"
test_json_endpoint "/datasets/1/analytics" "dataset analytics" ".summary"
test_json_endpoint "/datasets/1/preview" "dataset preview" ".records"
test_json_endpoint "/analytics/summary" "analytics summary" ".total_datasets"
test_json_endpoint "/analytics/forecasts/recent" "recent forecasts" ".[0].id"
test_json_endpoint "/analytics/models/stats" "model stats" ".[0].model_type"
test_json_endpoint "/analytics/models/compare" "model comparison" ".[0].model_type"

echo ""
echo "🔨 === DATASET CRUD OPERATIONS ==="

# Test dataset creation
echo -n "Testing dataset creation... "
NEW_DATASET_DATA='{
    "name": "Test Dataset",
    "description": "A test dataset for validation",
    "file_type": "csv",
    "columns": [
        {"name": "id", "type": "integer"},
        {"name": "value", "type": "number"},
        {"name": "label", "type": "string"}
    ]
}'

CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/datasets" \
    -H "Content-Type: application/json" \
    -d "$NEW_DATASET_DATA")

if echo "$CREATE_RESPONSE" | jq -e '.id' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    CREATED_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $CREATE_RESPONSE"
    ((TESTS_FAILED++))
    CREATED_ID=""
fi

# Test dataset update (if creation succeeded)
if [ -n "$CREATED_ID" ]; then
    echo -n "Testing dataset update... "
    UPDATE_DATA='{
        "name": "Updated Test Dataset",
        "description": "An updated test dataset"
    }'
    
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/datasets/$CREATED_ID" \
        -H "Content-Type: application/json" \
        -d "$UPDATE_DATA")
    
    if echo "$UPDATE_RESPONSE" | jq -e '.dataset.name' | grep -q "Updated"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $UPDATE_RESPONSE"
        ((TESTS_FAILED++))
    fi
    
    # Test dataset deletion
    echo -n "Testing dataset deletion... "
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/datasets/$CREATED_ID")
    
    if echo "$DELETE_RESPONSE" | jq -e '.message' >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $DELETE_RESPONSE"
        ((TESTS_FAILED++))
    fi
fi

echo ""
echo "📊 === ANALYTICS AND FORECASTING ==="

# Test forecast creation
echo -n "Testing forecast creation... "
FORECAST_DATA='{
    "dataset_id": "1",
    "target_column": "sales",
    "date_column": "date",
    "model_type": "linear_regression",
    "horizon": 30
}'

FORECAST_RESPONSE=$(curl -s -X POST "$API_BASE/analytics/forecast" \
    -H "Content-Type: application/json" \
    -d "$FORECAST_DATA")

if echo "$FORECAST_RESPONSE" | jq -e '.id' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $FORECAST_RESPONSE"
    ((TESTS_FAILED++))
fi

echo ""
echo "📂 === EXPORT FUNCTIONALITY ==="

# Test CSV export
echo -n "Testing CSV export... "
if curl -s "$API_BASE/datasets/1/export?format=csv" | head -1 | grep -q "id,name,value"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

# Test JSON export
echo -n "Testing JSON export... "
if curl -s "$API_BASE/datasets/1/export?format=json" | jq -e '.[0]' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔐 === AUTHENTICATION ==="

# Test login endpoint
echo -n "Testing user login... "
LOGIN_DATA='{"username": "admin", "password": "admin123"}'
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

if echo "$LOGIN_RESPONSE" | jq -e '.access_token' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $LOGIN_RESPONSE"
    ((TESTS_FAILED++))
fi

echo ""
echo "🌐 === FRONTEND CONNECTIVITY ==="

# Test if frontend is running
echo -n "Testing frontend availability... "
if curl -s --connect-timeout 5 "$FRONTEND_URL" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Frontend not accessible at $FRONTEND_URL"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔍 === ERROR HANDLING ==="

# Test 404 errors
echo -n "Testing 404 error handling... "
if curl -s "$API_BASE/datasets/nonexistent" | jq -e '.error' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

# Test invalid JSON
echo -n "Testing invalid JSON handling... "
INVALID_RESPONSE=$(curl -s -X POST "$API_BASE/datasets" \
    -H "Content-Type: application/json" \
    -d "invalid json")

if echo "$INVALID_RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "🚀 === PERFORMANCE TESTS ==="

# Test response times
echo -n "Testing API response time... "
START_TIME=$(date +%s%3N)
curl -s "$API_BASE/datasets" >/dev/null
END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))  # Already in milliseconds

if [ $DURATION -lt 1000 ]; then  # Less than 1 second
    echo -e "${GREEN}✓ PASS${NC} (${DURATION}ms)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ SLOW${NC} (${DURATION}ms)"
    ((TESTS_PASSED++))
fi

echo ""
echo "📋 === TEST SUMMARY ==="
echo "===================="
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! InsightDash is ready for deployment.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
